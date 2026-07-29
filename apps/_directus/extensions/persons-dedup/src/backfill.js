import { createDirectus, authentication, rest, readItems } from '@directus/sdk';
import { readFileSync } from 'fs';
import { request } from 'https';

/*
Indexe les personnes et les articles déjà en base dans Elasticsearch (le hook
ne synchronise que les créations/modifications futures).

RUN AT ROOT OF THIS EXTENSION (persons-dedup)
node src/backfill.js

Variables d'environnement requises dans le shell :
  ELASTICSEARCH_HOSTS, ELASTICSEARCH_PORT, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_CAPATH
  PERSONS_ES_INDEX (par défaut "persons")
  ARTICLES_ES_INDEX (par défaut "articles")
*/

const directus = createDirectus('http://localhost:8055').with(authentication()).with(rest());
await directus.login({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });

const env = process.env;
const index = env.PERSONS_ES_INDEX ?? 'persons';
const ca = env.ELASTICSEARCH_CAPATH ? readFileSync(env.ELASTICSEARCH_CAPATH) : undefined;
const auth =
	env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD
		? Buffer.from(`${env.ELASTICSEARCH_USERNAME}:${env.ELASTICSEARCH_PASSWORD}`).toString('base64')
		: undefined;

function bulkIndex(ndjson) {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: env.ELASTICSEARCH_HOSTS,
			port: env.ELASTICSEARCH_PORT,
			path: '/_bulk',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-ndjson',
				...(auth ? { Authorization: `Basic ${auth}` } : {}),
			},
			ca,
		};

		const req = request(options, (res) => {
			const chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const body = Buffer.concat(chunks).toString();
				resolve({ status: res.statusCode, body: body ? JSON.parse(body) : null });
			});
		});

		req.on('error', reject);
		req.write(ndjson);
		req.end();
	});
}

const perpage = 1000;
let page = 0;
let count = 0;

while (true) {
	const persons = await directus.request(
		readItems('persons', {
			fields: ['id', 'lastname', 'firstname', 'birthdate'],
			limit: perpage,
			offset: page * perpage,
			sort: ['id'],
		})
	);
	if (persons.length === 0) break;

	const lines = [];
	for (const person of persons) {
		lines.push(JSON.stringify({ update: { _index: index, _id: person.id } }));
		lines.push(
			JSON.stringify({
				doc: {
					lastname: person.lastname ?? null,
					firstname: person.firstname ?? null,
					birthdate: person.birthdate ?? null,
				},
				doc_as_upsert: true,
			})
		);
	}

	const { status, body } = await bulkIndex(lines.join('\n') + '\n');
	if (status >= 300 || body?.errors) {
		console.error(`Bulk index error (page ${page}):`, status, JSON.stringify(body).slice(0, 2000));
	}

	count += persons.length;
	console.log(`Indexed ${count} persons so far...`);
	page++;
}

console.log(`Backfill terminé : ${count} personnes indexées dans Elasticsearch (index "${index}").`);

const articlesIndex = env.ARTICLES_ES_INDEX ?? 'articles';
let articlesPage = 0;
let articlesCount = 0;

while (true) {
	const articles = await directus.request(
		readItems('articles', {
			fields: ['id', 'title', 'slug', 'content', 'excerpt', 'status'],
			limit: perpage,
			offset: articlesPage * perpage,
			sort: ['id'],
		})
	);
	if (articles.length === 0) break;

	const lines = [];
	for (const article of articles) {
		lines.push(JSON.stringify({ update: { _index: articlesIndex, _id: article.id } }));
		lines.push(
			JSON.stringify({
				doc: {
					title: article.title ?? null,
					slug: article.slug ?? null,
					content: article.content ?? null,
					excerpt: article.excerpt ?? null,
					status: article.status ?? null,
				},
				doc_as_upsert: true,
			})
		);
	}

	const { status, body } = await bulkIndex(lines.join('\n') + '\n');
	if (status >= 300 || body?.errors) {
		console.error(`Bulk index error (page ${articlesPage}):`, status, JSON.stringify(body).slice(0, 2000));
	}

	articlesCount += articles.length;
	console.log(`Indexed ${articlesCount} articles so far...`);
	articlesPage++;
}

console.log(`Backfill terminé : ${articlesCount} articles indexés dans Elasticsearch (index "${articlesIndex}").`);
