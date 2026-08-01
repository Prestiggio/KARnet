import { defineEndpoint } from '@directus/extensions-sdk';
import { esRequest } from '../lib/esClient';

/**
 * Proxy sécurisé vers Elasticsearch pour la recherche de doublon "saints".
 * Les extensions "app" ne peuvent pas appeler un serveur externe (CSRF), et
 * cela évite d'exposer les identifiants ES au navigateur.
 *
 * Variables d'environnement (voir aussi src/hook/index.ts et
 * katolika-api/src/bible/ESseeder.ts) :
 *   ELASTICSEARCH_HOSTS, ELASTICSEARCH_PORT, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD, ELASTICSEARCH_CAPATH
 *   SAINTS_ES_INDEX (par défaut "saints")
 */
export default defineEndpoint({
	id: 'saints-dedup-api',
	handler: (router, { services, database, getSchema, env, logger }) => {
		router.get('/', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			// Le proxy interroge directement l'index ES "saints" (nom/prénom/date
			// de naissance) sans passer par Directus : on doit donc revérifier ici
			// que le rôle de l'utilisateur a bien le droit de lire la collection
			// "saints", sous peine de laisser n'importe quel compte authentifié
			// contourner les permissions Directus sur ces données personnelles.
			try {
				const { ItemsService } = services;
				const schema = await getSchema();
				const itemsService = new ItemsService('saints', { schema, accountability, knex: database });
				await itemsService.readByQuery({ limit: 0 });
			} catch (err: any) {
				return res.status(403).json({ error: 'Forbidden' });
			}

			const lastname = String(req.query.lastname ?? '').trim();
			const firstname = String(req.query.firstname ?? '').trim();
			if (!lastname) {
				return res.status(400).json({ error: 'lastname is required' });
			}

			if (!env.ELASTICSEARCH_HOSTS) {
				logger.error('ELASTICSEARCH_HOSTS is not defined');
				return res.status(500).json({ error: 'Elasticsearch is not configured' });
			}
			const index = String(env.SAINTS_ES_INDEX ?? 'saints');

			try {
				const must: unknown[] = [{ match: { lastname: { query: lastname, fuzziness: 'AUTO', boost: 2 } } }];
				if (firstname) {
					must.push({ match: { firstname: { query: firstname, fuzziness: 'AUTO' } } });
				}

				const { status, json } = await esRequest(env, 'POST', `/${encodeURIComponent(index)}/_search`, {
					size: 20,
					query: {
						bool: { must },
					},
				});

				if (status >= 300) {
					logger.error(`Elasticsearch error ${status}: ${JSON.stringify(json)}`);
					return res.status(502).json({ error: 'Elasticsearch query failed' });
				}

				const results = (json?.hits?.hits ?? []).map((hit: any) => ({
					id: hit._id,
					_score: hit._score,
					...hit._source,
				}));

				return res.json({ results });
			} catch (err: any) {
				logger.error(err, 'Saints dedup search proxy failed');
				return res.status(502).json({ error: 'Could not reach Elasticsearch' });
			}
		});
	},
});
