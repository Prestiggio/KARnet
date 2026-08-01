import { defineHook } from '@directus/extensions-sdk';
import { esRequest } from '../lib/esClient';

/**
 * Indexe la collection "saints" dans Elasticsearch :
 * - "saints" pour la vérification de doublon (recherche fulltext nom/prénom) avant création.
 *
 * Variables d'environnement à définir sur le conteneur Directus (mêmes que
 * pour le reste de l'infra, voir katolika-api/src/bible/ESseeder.ts) :
 *   ELASTICSEARCH_HOSTS, ELASTICSEARCH_PORT, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_CAPATH
 *   SAINTS_ES_INDEX=saints     (par défaut "saints")
 */

// Tous ces champs sont traductibles : celebrate_on inclus, la date de fête
// d'un saint pouvant varier selon les pays/langues (ex. Fête-Dieu).
const TRANSLATABLE_FIELDS = ['lastname', 'firstname', 'biography', 'prefix', 'suffix', 'celebrate_on'] as const;

function fullDoc(payload: Record<string, unknown>, extra: Record<string, unknown> = {}) {
	const doc: Record<string, unknown> = { ...extra };
	for (const field of TRANSLATABLE_FIELDS) doc[field] = payload[field] ?? null;
	return doc;
}

function partialDoc(payload: Record<string, unknown>, extra: Record<string, unknown> = {}) {
	const doc: Record<string, unknown> = { ...extra };
	for (const field of TRANSLATABLE_FIELDS) {
		if (field in payload) doc[field] = payload[field] ?? null;
	}
	return doc;
}

export default defineHook(({ action }, { services, database, getSchema, env, logger }) => {
	const index = String(env.SAINTS_ES_INDEX ?? 'saints');

	/** Lit un item directement en base (pas dans le payload de l'event, qui peut être partiel). */
	async function readItem(collection: string, id: string, fields: string[]): Promise<Record<string, any> | null> {
		try {
			const { ItemsService } = services;
			const schema = await getSchema();
			const svc = new ItemsService(collection, { schema, knex: database });
			return (await svc.readOne(id, { fields })) ?? null;
		} catch (err: any) {
			logger.error(`Failed to read ${collection} ${id}: ${err.message}`);
			return null;
		}
	}

	async function readSaint(id: string) {
		return readItem('saints', id, [...TRANSLATABLE_FIELDS]);
	}

	async function readTranslation(id: string) {
		return readItem('saints_translations', id, [...TRANSLATABLE_FIELDS, 'saints_id']);
	}

	async function indexSaint(id: string, doc: Record<string, unknown>) {
		try {
			const { status, json } = await esRequest(
				env,
				'POST',
				`/${encodeURIComponent(index)}/_update/${encodeURIComponent(id)}`,
				{ doc, doc_as_upsert: true }
			);
			if (status >= 300) {
				logger.error(`Elasticsearch index failed for saint ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch sync failed for saint ${id}: ${err.message}`);
		}
	}

	async function deleteSaint(id: string) {
		try {
			const { status, json } = await esRequest(
				env,
				'DELETE',
				`/${encodeURIComponent(index)}/_doc/${encodeURIComponent(id)}`
			);
			if (status >= 300 && status !== 404) {
				logger.error(`Elasticsearch delete failed for saint ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch delete failed for saint ${id}: ${err.message}`);
		}
	}

	// Supprime le document du saint ainsi que toutes ses traductions (docs
	// "t_*" dont saints_id référence ce saint) : la contrainte SQL sur
	// saints_translations.saints_id est en ON DELETE SET NULL (pas CASCADE),
	// donc les traductions ne sont pas supprimées mais orphelines en base, et
	// ce changement ne passe pas par l'API Directus (leur hook items.delete
	// ne se déclenche pas) — sans ce nettoyage explicite, leurs documents ES
	// resteraient associés à un saint qui n'existe plus.
	async function deleteSaintCascade(id: string) {
		try {
			const { status, json } = await esRequest(
				env,
				'POST',
				`/${encodeURIComponent(index)}/_delete_by_query`,
				{
					query: {
						bool: {
							should: [{ ids: { values: [id] } }, { term: { saints_id: id } }],
							minimum_should_match: 1,
						},
					},
				}
			);
			if (status >= 300) {
				logger.error(`Elasticsearch cascade delete failed for saint ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch cascade delete failed for saint ${id}: ${err.message}`);
		}
	}

	// Supprime les documents ES "t_*" de traductions qui n'existent plus en
	// base pour ce saint. Nécessaire car la suppression d'une traduction
	// depuis le formulaire du saint (retrait d'un élément de la liste
	// imbriquée "translations" puis sauvegarde) ne déclenche pas de manière
	// fiable le hook saints_translations.items.delete : Directus traite ça
	// comme une réécriture de la relation o2m au sein de la transaction de
	// saints.items.update, sans toujours émettre l'event de suppression sur
	// la collection enfant.
	async function reconcileTranslations(saintId: string) {
		try {
			const { ItemsService } = services;
			const schema = await getSchema();
			const svc = new ItemsService('saints_translations', { schema, knex: database });
			const rows: Array<Record<string, any>> = await svc.readByQuery({
				filter: { saints_id: { _eq: saintId } },
				fields: ['id'],
				limit: -1,
			});
			const existingIds = new Set(rows.map((r) => String(r.id)));

			const { status, json } = await esRequest(env, 'POST', `/${encodeURIComponent(index)}/_search`, {
				size: 1000,
				_source: false,
				query: { term: { saints_id: saintId } },
			});
			if (status >= 300) {
				logger.error(`Elasticsearch search failed while reconciling saint ${saintId}: ${status} ${JSON.stringify(json)}`);
				return;
			}

			const esIds: string[] = (json?.hits?.hits ?? []).map((hit: any) => hit._id);
			for (const esId of esIds) {
				if (!esId.startsWith('t_')) continue;
				const translationId = esId.slice(2);
				if (!existingIds.has(translationId)) {
					await deleteSaint(esId);
				}
			}
		} catch (err: any) {
			logger.error(`Elasticsearch reconciliation failed for saint ${saintId}: ${err.message}`);
		}
	}

	// Indexe une traduction en complétant ses champs vides avec ceux de la
	// fiche saint de base (ex : une traduction créée sans biographie hérite
	// de la biographie de la fiche de référence, plutôt que d'indexer `null`).
	async function syncTranslation(id: string) {
		const row = await readTranslation(id);
		if (!row) return;

		const base = row.saints_id != null ? await readSaint(String(row.saints_id)) : null;

		const doc: Record<string, unknown> = { saints_id: row.saints_id ?? null };
		for (const field of TRANSLATABLE_FIELDS) {
			const value = row[field];
			doc[field] = value !== undefined && value !== null && value !== '' ? value : (base?.[field] ?? null);
		}

		await indexSaint('t_' + id, doc);
	}

	action('saints.items.create', async ({ payload, key }) => {
		await indexSaint(String(key), fullDoc(payload, { saints_id: key }));
	});

	action('saints.items.update', async ({ payload, keys }) => {
		const doc = partialDoc(payload);
		if (Object.keys(doc).length > 0) {
			for (const key of keys) {
				await indexSaint(String(key), doc);
			}
		}

		// La liste imbriquée "translations" (retrait d'une traduction depuis le
		// formulaire du saint) transite par cette même action ; on réconcilie
		// l'index à chaque fois qu'elle est touchée, cf. reconcileTranslations.
		if ('translations' in payload) {
			for (const key of keys) {
				await reconcileTranslations(String(key));
			}
		}
	});

	action('saints.items.delete', async ({ keys }) => {
		for (const key of keys) {
			await deleteSaintCascade(String(key));
		}
	});

	action('saints_translations.items.create', async ({ key }) => {
		await syncTranslation(String(key));
	});

	action('saints_translations.items.update', async ({ keys }) => {
		for (const key of keys) {
			await syncTranslation(String(key));
		}
	});

	action('saints_translations.items.delete', async ({ keys }) => {
		for (const key of keys) {
			await deleteSaint('t_' + key);
		}
	});
});
