import { defineHook } from '@directus/extensions-sdk';
import { esRequest } from '../lib/esClient';

/**
 * Indexe les collections "persons" et "articles" dans Elasticsearch :
 * - "persons" pour la vérification de doublon (recherche fulltext nom/prénom) avant création.
 * - "articles" pour la recherche fulltext (titre/contenu/extrait).
 *
 * Variables d'environnement à définir sur le conteneur Directus (mêmes que
 * pour le reste de l'infra, voir katolika-api/src/bible/ESseeder.ts) :
 *   ELASTICSEARCH_HOSTS, ELASTICSEARCH_PORT, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_CAPATH
 *   PERSONS_ES_INDEX=persons     (par défaut "persons")
 *   ARTICLES_ES_INDEX=articles  (par défaut "articles")
 */
export default defineHook(({ action }, { env, logger }) => {
	const index = String(env.PERSONS_ES_INDEX ?? 'persons');
	const articlesIndex = String(env.ARTICLES_ES_INDEX ?? 'articles');

	async function indexPerson(id: string, doc: Record<string, unknown>) {
		try {
			const { status, json } = await esRequest(
				env,
				'POST',
				`/${encodeURIComponent(index)}/_update/${encodeURIComponent(id)}`,
				{ doc, doc_as_upsert: true }
			);
			if (status >= 300) {
				logger.error(`Elasticsearch index failed for person ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch sync failed for person ${id}: ${err.message}`);
		}
	}

	async function deletePerson(id: string) {
		try {
			const { status, json } = await esRequest(
				env,
				'DELETE',
				`/${encodeURIComponent(index)}/_doc/${encodeURIComponent(id)}`
			);
			if (status >= 300 && status !== 404) {
				logger.error(`Elasticsearch delete failed for person ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch delete failed for person ${id}: ${err.message}`);
		}
	}

	async function indexArticle(id: string, doc: Record<string, unknown>) {
		try {
			const { status, json } = await esRequest(
				env,
				'POST',
				`/${encodeURIComponent(articlesIndex)}/_update/${encodeURIComponent(id)}`,
				{ doc, doc_as_upsert: true }
			);
			if (status >= 300) {
				logger.error(`Elasticsearch index failed for article ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch sync failed for article ${id}: ${err.message}`);
		}
	}

	async function deleteArticle(id: string) {
		try {
			const { status, json } = await esRequest(
				env,
				'DELETE',
				`/${encodeURIComponent(articlesIndex)}/_doc/${encodeURIComponent(id)}`
			);
			if (status >= 300 && status !== 404) {
				logger.error(`Elasticsearch delete failed for article ${id}: ${status} ${JSON.stringify(json)}`);
			}
		} catch (err: any) {
			logger.error(`Elasticsearch delete failed for article ${id}: ${err.message}`);
		}
	}

	action('persons.items.create', async ({ payload, key }) => {
		await indexPerson(String(key), {
			lastname: payload.lastname ?? null,
			firstname: payload.firstname ?? null,
			birthdate: payload.birthdate ?? null,
		});
	});

	action('persons.items.update', async ({ payload, keys }) => {
		const doc: Record<string, unknown> = {};
		if ('lastname' in payload) doc.lastname = payload.lastname ?? null;
		if ('firstname' in payload) doc.firstname = payload.firstname ?? null;
		if ('birthdate' in payload) doc.birthdate = payload.birthdate ?? null;
		if (Object.keys(doc).length === 0) return;

		for (const key of keys) {
			await indexPerson(String(key), doc);
		}
	});

	action('persons.items.delete', async ({ keys }) => {
		for (const key of keys) {
			await deletePerson(String(key));
		}
	});

	action('articles.items.create', async ({ payload, key }) => {
		await indexArticle(String(key), {
			title: payload.title ?? null,
			slug: payload.slug ?? null,
			content: payload.content ?? null,
			excerpt: payload.excerpt ?? null,
			status: payload.status ?? null,
		});
	});

	action('articles.items.update', async ({ payload, keys }) => {
		const doc: Record<string, unknown> = {};
		if ('title' in payload) doc.title = payload.title ?? null;
		if ('slug' in payload) doc.slug = payload.slug ?? null;
		if ('content' in payload) doc.content = payload.content ?? null;
		if ('excerpt' in payload) doc.excerpt = payload.excerpt ?? null;
		if ('status' in payload) doc.status = payload.status ?? null;
		if (Object.keys(doc).length === 0) return;

		for (const key of keys) {
			await indexArticle(String(key), doc);
		}
	});

	action('articles.items.delete', async ({ keys }) => {
		for (const key of keys) {
			await deleteArticle(String(key));
		}
	});
});
