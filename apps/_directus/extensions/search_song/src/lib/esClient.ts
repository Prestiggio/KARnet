import { request } from 'https';
import { readFileSync } from 'fs';

/**
 * Client Elasticsearch minimal basé sur `https.request`, aligné sur le
 * cluster ES déjà utilisé par katolika-api (voir src/bible/ESseeder.ts) :
 * TLS avec CA privée (auto-signée) fournie via ELASTICSEARCH_CAPATH, auth basique via
 * ELASTICSEARCH_USERNAME/ELASTICSEARCH_PASSWORD. Le fetch global de Node n'expose pas d'option
 * `ca` simple, d'où l'usage direct du module https.
 */
export interface EsEnv {
	ELASTICSEARCH_HOSTS?: string;
	ELASTICSEARCH_PORT?: string | number;
	ELASTICSEARCH_USERNAME?: string;
	ELASTICSEARCH_PASSWORD?: string;
	ELASTICSEARCH_CAPATH?: string;
}

export interface EsResponse {
	status: number;
	json: any;
}

export function esRequest(env: EsEnv, method: string, path: string, body?: unknown): Promise<EsResponse> {
	return new Promise((resolve, reject) => {
		if (!env.ELASTICSEARCH_HOSTS) {
			reject(new Error('ELASTICSEARCH_HOSTS is not defined'));
			return;
		}

		const auth =
			env.ELASTICSEARCH_USERNAME && env.ELASTICSEARCH_PASSWORD
				? Buffer.from(`${env.ELASTICSEARCH_USERNAME}:${env.ELASTICSEARCH_PASSWORD}`).toString('base64')
				: undefined;

		const options: Record<string, unknown> = {
			hostname: env.ELASTICSEARCH_HOSTS,
			port: env.ELASTICSEARCH_PORT,
			path,
			method,
			headers: {
				'Content-Type': 'application/json',
				...(auth ? { Authorization: `Basic ${auth}` } : {}),
			},
		};

		if (env.ELASTICSEARCH_CAPATH) {
			options.ca = readFileSync(env.ELASTICSEARCH_CAPATH);
		}

		const req = request(options, (res) => {
			const chunks: Buffer[] = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const raw = Buffer.concat(chunks).toString();
				let json: any = null;
				try {
					json = raw ? JSON.parse(raw) : null;
				} catch {
					json = raw;
				}
				resolve({ status: res.statusCode ?? 0, json });
			});
		});

		req.on('error', reject);
		if (body !== undefined) req.write(JSON.stringify(body));
		req.end();
	});
}
