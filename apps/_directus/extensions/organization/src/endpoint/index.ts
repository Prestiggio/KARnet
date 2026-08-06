import { defineEndpoint } from '@directus/extensions-sdk';
import neo4j, { Node as Neo4jNode, Path } from 'neo4j-driver';

export default defineEndpoint({
	id: 'organigram',
	handler: (router, { services, database, getSchema, logger }) => {
		router.get('/:primaryKey', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const env = process.env

			const { date } = req.query;
			const REFERENCE_DATE = date;
			const REFERENCE_ORGANIZATION_ID = req.params.primaryKey;// '76ad4aa7-c1fe-459c-9b68-e381bb1f0dba';

			const driver = neo4j.driver(
				env.NEO4J_URI ?? 'bolt://neo4j:7687',
				neo4j.auth.basic(env.NEO4J_USER ?? 'neo4j', env.NEO4J_PASSWORD)
			);

			const session = driver.session();

			try {
				const descendants = await session.executeRead((tx) =>
					tx.run(
						`MATCH (p)-[:DISTRICT_OF*]->(a {id: "${REFERENCE_ORGANIZATION_ID}"}) RETURN p;`
					)
				);

				const ids = [REFERENCE_ORGANIZATION_ID, ...descendants.records.map(rec => rec.get('p').properties.id)]

				const parents = await session.executeRead((tx) =>
					tx.run(
						`MATCH (a {id: "${REFERENCE_ORGANIZATION_ID}"})-[:DISTRICT_OF*]->(p) RETURN p;`
					)
				);

				const parents_ids = parents.records.map(rec => rec.get('p').properties.id).reverse()

				const { ItemsService } = services;
				const schema = await getSchema();
				const organizationService = new ItemsService('organizations', { schema, accountability, knex: database });

				const organization = await organizationService.readOne(REFERENCE_ORGANIZATION_ID, {
					fields: ['guide']
				})

				const itemsService = new ItemsService('function_assignations', { schema, accountability, knex: database });

				const fields = [
					'id',
					'assigned.id',
					'assigned.firstname',
					'assigned.lastname',
					'assigned.portrait',
					'title',
					'start_at',
					'end_at',
					'function.id',
					'function.title',
					'function.name',
					'function.translations.title',
					'function.translations.name',
					'organization.patron.prefix',
					'organization.patron.suffix',
					'organization.patron.firstname',
					'organization.patron.lastname',
					'organization.abbreviation',
					'organization.name',
					'organization.level',
					'organization.id',
					'nodestyle'
				]

				const parent_function_assignations = await itemsService.readByQuery({
					fields,
					filter: {
						_and: [
							{
								representative: {
									_eq: true
								}
							},
							{
								_or: [
									{
										assigned: {
											deathdate: {
												_null: true
											}
										}
									},
									{
										assigned: {
											deathdate: {
												_gte: REFERENCE_DATE
											}
										}
									},
								]
							},
							/*{
								assigned: {
									portrait: {
										_nnull: true
									},
								}
							},*/
							{
								organization: {
									id: {
										_in: parents_ids
									}
								},
								start_at: {
									_lt: REFERENCE_DATE
								},
								_or: [
									{
										end_at: {
											_gt: REFERENCE_DATE
										}
									},
									{
										end_at: {
											_null: true
										}
									},
								]
							},
						]
					},
					deep: {
						function: {
							"translations": {
								_filter: {
									"languages_code": {
										"_eq": "mg-MG"
									}
								}
							}
						},
					},
					limit: -1,
				})

				const function_assignations = await itemsService.readByQuery({
					fields,
					filter: {
						_and: [
							{
								_or: [
									{
										assigned: {
											deathdate: {
												_null: true
											}
										}
									},
									{
										assigned: {
											deathdate: {
												_gte: REFERENCE_DATE
											}
										}
									},
								]
							},
							/*{
								assigned: {
									portrait: {
										_nnull: true
									},
								}
							},*/
							{
								organization: {
									id: {
										_in: ids
									}
								},
								start_at: {
									_lt: REFERENCE_DATE
								},
								_or: [
									{
										end_at: {
											_gt: REFERENCE_DATE
										}
									},
									{
										end_at: {
											_null: true
										}
									},
								]
							},
						]
					},
					deep: {
						function: {
							"translations": {
								_filter: {
									"languages_code": {
										"_eq": "mg-MG"
									}
								}
							}
						},
					},
					limit: -1,
				});

				let parent_filtered = parent_function_assignations.sort((faA, faB) => {
					return parents_ids.indexOf(faA.organization.id) - parents_ids.indexOf(faB.organization.id)
				})

				let filtered = function_assignations.sort((faA, faB) => {
					return ids.indexOf(faA.organization.id) - ids.indexOf(faB.organization.id)
				})

				const organizationRepresentativeMap: any = {}

				let idx = -1

				const mappingFn = (fa) => {
					if(fa.organization?.id) {
						organizationRepresentativeMap[fa.organization.id] = new String(fa.id)
					}
					idx++
					return ({
						id: new String(fa.id),
						person_id: fa.assigned?.id,
						lastname: fa.assigned?.lastname,
						firstname: fa.assigned?.firstname,
						picture: fa.assigned?.portrait ? `/assets/${fa.assigned.portrait}` : '/assets/de29da42-f147-483c-90fc-b1d115e9442e',
						rank: idx,
						organization_id: fa.organization?.id,
						function_id: fa.function?.id,
						nodestyle: {
							organization_visible: fa.organization?.id !== REFERENCE_ORGANIZATION_ID
						},
						meta: {
							ecclesia: {
								organizations: [
									{
										patron: fa.organization.patron ? `${fa.organization.patron.prefix ?? ''} ${fa.organization.patron.firstname ?? ''} ${fa.organization.patron.lastname}, ${fa.organization.patron.suffix ?? ''}` : null,
										name: fa.organization.abbreviation ?? fa.organization.name,
										level: fa.organization.level,
										role: fa.function.translations[0]?.name ?? fa.function.name,
										functions: [
											{
												title: fa.function.translations[0]?.title ?? fa.function.title,
												function: fa.title ?? fa.function.translations[0]?.name ?? fa.function.name,
												from: fa.start_at,
												to: fa.end_at
											}
										]
									}
								]
							}
						}
					})
				}

				const nodes = [...parent_filtered.map(mappingFn), ...filtered.map(mappingFn), {
					id: 'guide',
					type: 'background',
					draggable: false,
					position: {
						x: 0,
						y: 0
					},
					data: {
						url: organization.guide ? `/assets/${organization.guide}` : null
					}
				}]

				const parentTree = await session.executeRead((tx) =>
					tx.run(
						`MATCH p=(a {id: "${REFERENCE_ORGANIZATION_ID}"})-[:DISTRICT_OF*]->() RETURN p;`
					)
				);

				const tree = await session.executeRead((tx) =>
					tx.run(
						`MATCH p=()-[:DISTRICT_OF*]->(a {id: "${REFERENCE_ORGANIZATION_ID}"}) RETURN p;`
					)
				);

				function nodeKey(n: Neo4jNode): string {
					return (organizationRepresentativeMap[n.properties.id] ?? n.identity.toString());
				}

				const edgesMap = new Map<string, any>();
				for (const record of [...tree.records, ...parentTree.records]) {
					const path: Path = record.get('p');

					// segments contain {start, relationship, end} triples along the path
					for (const segment of path.segments) {
						const { start, relationship, end } = segment;

						const edgeId = relationship.elementId ?? relationship.identity.toString();
						if (!edgesMap.has(edgeId)) {
							edgesMap.set(edgeId, {
								id: edgeId,
								markerEnd: {
									type: 'arrowclosed'
								},
								source: nodeKey(end),
								sourceHandle: null,
								target: nodeKey(start),
								targetHandle: null,
								type: 'step',
								zIndex: 900
							});
						}
					}
				}

				return res.status(200).json({
					edges: Array.from(edgesMap.values()),
					nodes
				})

			} finally {
				await session.close();
			}
		});

		router.get('/:primaryKey/position', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			return res.status(200).json({
				nodes: [],
				edges: []
			})
		});
	},
});
