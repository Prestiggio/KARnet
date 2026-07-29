import { defineEndpoint } from '@directus/extensions-sdk';

/**
 * Proxy sécurisé vers Elasticsearch.
 *
 * Pourquoi un proxy ? Les extensions "app" de Directus ne peuvent pas appeler
 * un serveur externe (protection CSRF), et cela évite d'exposer les
 * credentials ES au navigateur.
 *
 * Variables d'environnement à définir sur le conteneur Directus :
 *   SONG_SEARCH_ES_URL=https://elasticsearch:9200
 *   SONG_SEARCH_ES_API_KEY=xxxx                (ou SONG_SEARCH_ES_USER / SONG_SEARCH_ES_PASSWORD)
 *   SONG_SEARCH_ES_ALLOWED_INDEXES=songs,tracks
 *   SONG_SEARCH_ES_FIELDS=title^3,artist^2,album
 *
 * Si votre cluster ES utilise une CA privée (auto-signée), montez le
 * certificat et ajoutez : NODE_EXTRA_CA_CERTS=/certs/ca.crt
 */
export default defineEndpoint({
	id: 'song-search-api',
	handler: (router, { env, logger }) => {
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

			const esUrl: string | undefined = env.SONG_SEARCH_ES_URL;
			if (!esUrl) {
				logger.error('SONG_SEARCH_ES_URL is not defined');
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

			const fields = String(env.SONG_SEARCH_ES_FIELDS ?? 'title^3,artist^2,album')
				.split(',')
				.map((s: string) => s.trim())
				.filter(Boolean);

			const headers: Record<string, string> = { 'Content-Type': 'application/json' };
			if (env.SONG_SEARCH_ES_API_KEY) {
				headers.Authorization = `ApiKey ${env.SONG_SEARCH_ES_API_KEY}`;
			} else if (env.SONG_SEARCH_ES_USER && env.SONG_SEARCH_ES_PASSWORD) {
				const basic = Buffer.from(
					`${env.SONG_SEARCH_ES_USER}:${env.SONG_SEARCH_ES_PASSWORD}`,
				).toString('base64');
				headers.Authorization = `Basic ${basic}`;
			}

			try {
				const esRes = await fetch(`${esUrl.replace(/\/$/, '')}/${encodeURIComponent(index)}/_search`, {
					method: 'POST',
					headers,
					body: JSON.stringify({
						size: 10,
						query: {
							multi_match: {
								query: q,
								fields,
								type: 'best_fields',
								fuzziness: 'AUTO',
								operator: 'and',
							},
						},
					}),
				});

				if (!esRes.ok) {
					const text = await esRes.text();
					logger.error(`Elasticsearch error ${esRes.status}: ${text}`);
					return res.status(502).json({ error: 'Elasticsearch query failed' });
				}

				const data: any = await esRes.json();
				const results = (data?.hits?.hits ?? []).map((hit: any) => ({
					id: hit._id,
					_score: hit._score,
					...hit._source,
				}));

				return res.json({ results });
			} catch (err: any) {
				logger.error(err, 'Song search proxy failed');
				return res.status(502).json({ error: 'Could not reach Elasticsearch' });
			}
		});
	},
});
