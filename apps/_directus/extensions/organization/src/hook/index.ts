import { defineHook } from '@directus/extensions-sdk';
import { createDirectus, authentication, rest, readItems } from '@directus/sdk';
import neo4j from 'neo4j-driver';

// Neo4j ne permet pas de paramétrer un label de nœud ($label ne fonctionne pas
// dans MATCH/MERGE), d'où l'interpolation dans le Cypher. On whitelist donc la
// valeur pour empêcher une injection Cypher via le champ "level".
const SAFE_LABEL = /^[A-Za-z][A-Za-z0-9_]*$/;

function assertSafeLabel(label: unknown, logger: { error: (msg: string) => void }): string | null {
	if (typeof label !== 'string' || !SAFE_LABEL.test(label)) {
		logger.error(`Neo4j sync refused: unsafe label "${label}"`);
		return null;
	}
	return label;
}

export default defineHook(({ action }, { env, logger }) => {

	const driver = neo4j.driver(
		env.NEO4J_URI ?? 'bolt://neo4j:7687',
		neo4j.auth.basic(env.NEO4J_USER ?? 'neo4j', env.NEO4J_PASSWORD)
	);

	action('organizations.items.create', async ({ payload, key }) => {
		const session = driver.session();
		try {
			const level = assertSafeLabel(payload.level, logger);
			if (!level) return;

			await session.executeWrite((tx) =>
				tx.run(
					`MERGE (p:${level} {id: $id})
           SET p.name = $name`,
					{
						id: String(key),
						name: payload.name ?? null
					}
				)
			);
			logger.info(`Neo4j: node Organization créé (id=${key})`);

			if (payload.parent) {
				const directus = createDirectus('http://localhost:8055').with(authentication()).with(rest());
				await directus.login({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
				const parents = await directus.request(
					readItems('organizations', {
						fields: ['level'],
						filter: { id: { _eq: payload.parent } },
					})
				);

				if (parents.length) {
					const parent = parents[0]
					const parentLevel = parent ? assertSafeLabel(parent.level, logger) : null;

					if (parent && parentLevel) {
						const session = driver.session();
						try {
							await session.executeWrite((tx) =>
								tx.run(
									`MATCH(a:${level} {id: $organizationId})
								MATCH(b:${parentLevel} {id: $parentId})
								MERGE (a)-[:DISTRICT_OF]->(b)`,
									{ organizationId: String(key), parentId: String(payload.parent) }
								)
							);
						}
						catch (err: any) {
							console.error('There was an error creating relationship ', err)
						}
					}
				}
			}

		} catch (err: any) {
			logger.error(`Neo4j sync failed: ${err.message}`);
			// Ne pas throw : l'item Directus est déjà créé, on ne veut pas casser la réponse
		} finally {
			await session.close();
		}
	});

	// Optionnel : sync des updates et deletes
	action('organizations.items.update', async ({ payload, keys }) => {

		const directus = createDirectus('http://localhost:8055').with(authentication()).with(rest());
		await directus.login({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
		const organizations = await directus.request(
			readItems('organizations', {
				fields: ['level'],
				filter: { id: { _eq: keys[0] } },
			})
		);

		if (organizations.length && payload.parent) {
			const organization = organizations[0]
			const parents = await directus.request(
				readItems('organizations', {
					fields: ['level'],
					filter: { id: { _eq: payload.parent } },
				})
			);

			if (parents.length) {
				const parent = parents[0]
				const organizationLevel = organization ? assertSafeLabel(organization.level, logger) : null;
				const parentLevel = parent ? assertSafeLabel(parent.level, logger) : null;

				if (organizationLevel && parentLevel) {
					const session = driver.session();
					try {
						await session.executeWrite((tx) =>
							tx.run(
								`MATCH(a:${organizationLevel} {id: $organizationId})
								MATCH(b:${parentLevel} {id: $parentId})
								MERGE (a)-[:DISTRICT_OF]->(b)`,
								{ organizationId: String(keys[0]), parentId: String(payload.parent) }
							)
						);
					}
					catch (err: any) {
						console.error('There was an error creating relationship ', err)
					}
				}
			}
		}
	});

	action('organizations.items.delete', async ({ keys }) => {
		const session = driver.session();
		try {
			await session.executeWrite((tx) =>
				tx.run(
					`MATCH (p:Organization) WHERE p.id IN $ids DETACH DELETE p`,
					{ ids: keys.map(String) }
				)
			);
		} finally {
			await session.close();
		}
	});
});
