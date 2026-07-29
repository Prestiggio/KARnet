import { defineHook } from '@directus/extensions-sdk';
import { esRequest } from '../lib/esClient';

/**
 * Indexe la collection "songs" dans Elasticsearch à la création/modification/
 * suppression d'un chant, pour que la recherche (interface `song-search`)
 * reste à jour sans dépendre du script de backfill (`src/backfill.js`).
 *
 * Mapping Directus -> Elasticsearch (inverse de celui du backfill) :
 *   title                        -> title
 *   lyrics                       -> content
 *   about                        -> resume_fr
 *   infos.moments_messe          -> moments_messe
 *   infos.notes                  -> notes
 *   infos.references_bibliques   -> references_bibliques
 *   infos.temps_liturgiques      -> temps_liturgiques
 *   infos.themes                 -> themes
 *   infos.traduction_titre_fr    -> traduction_titre_fr
 *
 * Invariant : le _id du document Elasticsearch est toujours égal à
 * `infos.es_id`. Si un chant n'a pas encore de es_id (créé directement dans
 * le Data Studio, pas via le backfill), Elasticsearch en génère un à
 * l'indexation et on l'écrit dans `infos.es_id` (avec `emitEvents: false`
 * pour ne pas redéclencher ce hook).
 *
 * Variables d'environnement à définir sur le conteneur Directus (mêmes que
 * pour le backfill, voir src/backfill.js) :
 *   ELASTICSEARCH_HOSTS, ELASTICSEARCH_PORT, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_CAPATH
 *   SONGS_ES_INDEX (par défaut "songs")
 */
export default defineHook(({ filter, action }, { services, database, getSchema, env, logger }) => {
	const index = String(env.SONGS_ES_INDEX ?? 'songs');

	function toIds(single: unknown, many: unknown): string[] {
		if (Array.isArray(many)) return many.map(String);
		if (single !== undefined && single !== null) return [String(single)];
		return [];
	}

	function fullDoc(payload: Record<string, any>): Record<string, unknown> {
		const infos = payload.infos ?? {};
		return {
			title: payload.title ?? null,
			content: payload.lyrics ?? null,
			resume_fr: payload.about ?? null,
			moments_messe: infos.moments_messe ?? null,
			notes: infos.notes ?? null,
			references_bibliques: infos.references_bibliques ?? null,
			temps_liturgiques: infos.temps_liturgiques ?? null,
			themes: infos.themes ?? null,
			traduction_titre_fr: infos.traduction_titre_fr ?? null,
		};
	}

	function partialDoc(payload: Record<string, any>): Record<string, unknown> {
		const doc: Record<string, unknown> = {};
		if ('title' in payload) doc.title = payload.title ?? null;
		if ('lyrics' in payload) doc.content = payload.lyrics ?? null;
		if ('about' in payload) doc.resume_fr = payload.about ?? null;
		if ('infos' in payload) {
			const infos = payload.infos ?? {};
			doc.moments_messe = infos.moments_messe ?? null;
			doc.notes = infos.notes ?? null;
			doc.references_bibliques = infos.references_bibliques ?? null;
			doc.temps_liturgiques = infos.temps_liturgiques ?? null;
			doc.themes = infos.themes ?? null;
			doc.traduction_titre_fr = infos.traduction_titre_fr ?? null;
		}
		return doc;
	}

	function itemsService() {
		const { ItemsService } = services;
		return { ItemsService };
	}

	/** Lit `infos` du chant en base (pas dans le payload de l'event). */
	async function readInfos(id: string): Promise<Record<string, any>> {
		try {
			const { ItemsService } = itemsService();
			const schema = await getSchema();
			const svc = new ItemsService('songs', { schema, knex: database });
			const item = await svc.readOne(id, { fields: ['infos'] });
			return item?.infos ?? {};
		} catch {
			return {};
		}
	}

	/** Écrit `infos.es_id` sans redéclencher ce hook (emitEvents: false). */
	async function writeEsId(id: string, currentInfos: Record<string, any>, esId: string) {
		try {
			const { ItemsService } = itemsService();
			const schema = await getSchema();
			const svc = new ItemsService('songs', { schema, knex: database });
			await svc.updateOne(id, { infos: { ...currentInfos, es_id: esId } }, { emitEvents: false });
		} catch (err: any) {
			logger.error(`Impossible d'écrire infos.es_id pour le chant ${id}: ${err.message}`);
		}
	}

	/** Met à jour un document ES existant (id connu). */
	async function updateEsDoc(esId: string, doc: Record<string, unknown>) {
		try {
			const { status, json } = await esRequest(
				env,
				'POST',
				`/${encodeURIComponent(index)}/_update/${encodeURIComponent(esId)}`,
				{ doc, doc_as_upsert: true }
			);
			if (status >= 300) {
				logger.error(`Elasticsearch index failed for song ${esId}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch sync failed for song ${esId}: ${err.message}`);
		}
	}

	/** Crée un nouveau document ES (laisse Elasticsearch générer l'_id) et renvoie ce _id. */
	async function createEsDoc(doc: Record<string, unknown>): Promise<string | undefined> {
		try {
			const { status, json } = await esRequest(env, 'POST', `/${encodeURIComponent(index)}/_doc`, doc);
			if (status >= 300) {
				logger.error(`Elasticsearch create failed: ${status} ${JSON.stringify(json)}`);
				return undefined;
			}
			return json?._id;
		} catch (err: any) {
			logger.error(`Elasticsearch create failed: ${err.message}`);
			return undefined;
		}
	}

	async function deleteEsDoc(esId: string) {
		try {
			const { status, json } = await esRequest(
				env,
				'DELETE',
				`/${encodeURIComponent(index)}/_doc/${encodeURIComponent(esId)}`
			);
			if (status >= 300 && status !== 404) {
				logger.error(`Elasticsearch delete failed for song ${esId}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch delete failed for song ${esId}: ${err.message}`);
		}
	}

	/** Indexe `doc` pour le chant `id`, en créant le document ES s'il n'a pas encore de es_id. */
	async function syncSong(id: string, doc: Record<string, unknown>, knownInfos: Record<string, any> | undefined) {
		const infos = knownInfos ?? (await readInfos(id));
		const esId = infos?.es_id;

		if (esId) {
			await updateEsDoc(String(esId), doc);
			return;
		}

		const newEsId = await createEsDoc(doc);
		if (newEsId) {
			await writeEsId(id, infos ?? {}, newEsId);
		}
	}

	action('songs.items.create', async ({ payload, key, keys }: any) => {
		const doc = fullDoc(payload ?? {});
		for (const id of toIds(key, keys)) {
			await syncSong(id, doc, payload?.infos);
		}
	});

	action('songs.items.update', async ({ payload, key, keys }: any) => {
		const doc = partialDoc(payload ?? {});
		if (Object.keys(doc).length === 0) return;

		const knownInfos = 'infos' in (payload ?? {}) ? payload.infos ?? {} : undefined;
		for (const id of toIds(key, keys)) {
			await syncSong(id, doc, knownInfos);
		}
	});

	// La suppression se fait en deux temps : on lit `infos.es_id` avant que la
	// ligne ne disparaisse (filter, avant écriture), puis on supprime le
	// document ES une fois la suppression Directus confirmée (action, après
	// écriture).
	const pendingEsIds = new Map<string, string | undefined>();

	filter('songs.items.delete', async (payloadKeys: unknown) => {
		for (const id of toIds(payloadKeys, payloadKeys)) {
			const infos = await readInfos(id);
			pendingEsIds.set(id, infos?.es_id);
		}
		return payloadKeys;
	});

	action('songs.items.delete', async ({ key, keys }: any) => {
		for (const id of toIds(key, keys)) {
			const esId = pendingEsIds.get(id);
			pendingEsIds.delete(id);
			if (esId) await deleteEsDoc(String(esId));
		}
	});
});
