import { defineEndpoint } from '@directus/extensions-sdk';
import { esRequest } from '../lib/esClient';

/**
 * Proxy sécurisé vers Elasticsearch.
 *
 * Pourquoi un proxy ? Les extensions "app" de Directus ne peuvent pas appeler
 * un serveur externe (protection CSRF), et cela évite d'exposer les
 * credentials ES au navigateur.
 *
 * Variables d'environnement à définir sur le conteneur Directus (mêmes que
 * celles utilisées par katolika-api, voir src/bible/ESseeder.ts) :
 *   ELASTICSEARCH_HOSTS=elasticsearch
 *   ELASTICSEARCH_PORT=9200
 *   ELASTICSEARCH_USERNAME / ELASTICSEARCH_PASSWORD
 *   ELASTICSEARCH_CAPATH=/certs/ca.crt          (si CA privée auto-signée)
 *   SONG_SEARCH_ES_ALLOWED_INDEXES=songs,tracks
 *   SONG_SEARCH_ES_FIELDS=title^3,artist^2,album
 */
export default defineEndpoint({
	id: 'song-search-api',
	handler: (router, { services, database, getSchema, env, logger }) => {
		router.get('/', async (req, res) => {
			// Réservé aux utilisateurs connectés au Data Studio
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const q = String(req.query.q ?? '').trim();
			if (q.length < 2) {
				return res.json({ results: [] });
			}

			if (!env.ELASTICSEARCH_HOSTS) {
				logger.error('ELASTICSEARCH_HOSTS is not defined');
				return res.status(500).json({ error: 'Elasticsearch is not configured' });
			}

			// Whitelist d'index pour éviter la lecture arbitraire du cluster
			const allowed = String(env.SONG_SEARCH_ES_ALLOWED_INDEXES ?? 'songs')
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean);
			const index = String(req.query.index ?? allowed[0]);
			if (!allowed.includes(index)) {
				return res.status(400).json({ error: `Index "${index}" not allowed` });
			}

			try {
				const esRes = await esRequest(env, 'POST', `/${encodeURIComponent(index)}/_search`,
				{
					query: {
						query_string: {
							query: q!,
							fields: ['title^2', 'content'],
							fuzziness: 'AUTO'
						}
					},
					sort: [
						{
							_score: {
								order: 'desc'
							}
						}
					],
					size: 100
				});

				if (esRes.status < 200 || esRes.status >= 300) {
					logger.error(`Elasticsearch error ${esRes.status}: ${JSON.stringify(esRes.json)}`);
					return res.status(502).json({ error: 'Elasticsearch query failed' });
				}

				const hits: any[] = esRes.json?.hits?.hits ?? [];
				if (hits.length === 0) {
					return res.json({ results: [] });
				}

				// Les documents ES ne sont qu'un index de recherche : on retourne les
				// chants Directus correspondants (infos.es_id === _id ES), avec tous
				// leurs champs à jour, pour le pré-remplissage du formulaire.
				const scoreByEsId = new Map<string, number>(hits.map((hit) => [String(hit._id), hit._score]));

				// Le filtrage par sous-chemin JSON (infos.es_id) passe par le moteur
				// de permissions comme un chemin relationnel et échoue pour les rôles
				// non-admin. On résout donc les ids Directus via une requête knex brute
				// (non soumise aux permissions), puis on relit les chants via
				// l'ItemsService (qui applique bien les permissions de l'utilisateur).
				const matchingIds: string[] = await database('songs')
					.whereRaw("infos->>'es_id' = ANY(?)", [[...scoreByEsId.keys()]])
					.pluck('id');

				if (matchingIds.length === 0) {
					return res.json({ results: [] });
				}

				const { ItemsService } = services;
				const schema = await getSchema();
				const songsService = new ItemsService('songs', { schema, accountability, knex: database });

				const songs = await songsService.readByQuery({
					fields: ['*'],
					filter: { id: { _in: matchingIds } },
					limit: -1,
				});

				const results = songs
					.map((song: any) => ({ ...song, _score: scoreByEsId.get(String(song.infos?.es_id)) }))
					.sort((a: any, b: any) => (b._score ?? 0) - (a._score ?? 0));

				return res.json({ results });
			} catch (err: any) {
				logger.error(err, 'Song search proxy failed');
				return res.status(502).json({ error: 'Could not reach Elasticsearch' });
			}
		});
	},
});
