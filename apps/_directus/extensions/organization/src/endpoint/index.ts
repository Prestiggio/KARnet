import { defineEndpoint } from '@directus/extensions-sdk';
import { parse } from 'yaml'
import neo4j from 'neo4j-driver';
import fs from 'fs'

const FIELDS = [
	'id',
	'chords',
	'song.title',
	'song.infos'
];

function personName(person: { firstname?: string | null; lastname?: string | null } | null | undefined) {
	if (!person) return null;
	const name = [person.firstname, person.lastname].filter(Boolean).join(' ').trim();
	return name || null;
}

// Convertit un texte multi-lignes (paroles, markdown minimal, ChordPro) en
// paragraphes docx en respectant les sauts de ligne et les paragraphes vides.
function textToParagraphs(text: string, options: { monospace?: boolean } = {}): Paragraph[] {
	const font = options.monospace ? 'Courier New' : undefined;
	const blocks = text.replace(/\r\n/g, '\n').split(/\n{2,}/);

	return blocks
		.filter((block) => block.trim().length > 0)
		.map((block) => {
			const lines = block.split('\n');
			const children: TextRun[] = [];
			lines.forEach((line, index) => {
				if (index > 0) children.push(new TextRun({ text: '', break: 1 }));
				children.push(new TextRun({ text: line, font }));
			});
			return new Paragraph({ children, spacing: { after: 200 } });
		});
}

function buildPerformanceSection(performance: any, isFirst: boolean): Paragraph[] {
	const paragraphs: Paragraph[] = [];

	paragraphs.push(new Paragraph({ text: performance.song?.infos?.es_id, heading: HeadingLevel.HEADING_1, spacing: { after: 100 }, pageBreakBefore: !isFirst }));

	if (performance.song?.title) {
		paragraphs.push(new Paragraph({ text: performance.song.title, heading: HeadingLevel.HEADING_1, spacing: { after: 100 } }));
	}

	if (performance.chords) {
		paragraphs.push(...textToParagraphs(String(performance.chords), { monospace: true }));
	}

	return paragraphs;
}

export default defineEndpoint({
	id: 'organigram',
	handler: (router, { services, database, getSchema, logger }) => {
		router.get('/', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const env = process.env

			const driver = neo4j.driver(
				env.NEO4J_URI ?? 'bolt://neo4j:7687',
				neo4j.auth.basic(env.NEO4J_USER ?? 'neo4j', env.NEO4J_PASSWORD)
			);

			const session = driver.session();

			try {
				const descendants = await session.executeRead((tx) =>
					tx.run(
						`MATCH (p)-[:DISTRICT_OF*]->(a:Paroasy) RETURN p LIMIT 150;`
					)
				);

				let ids = descendants.records.map(rec => rec.get('p').properties.id)

				const parents = await session.executeRead((tx) =>
					tx.run(
						`MATCH (a:Paroasy)-[:DISTRICT_OF*]->(p) RETURN p LIMIT 100;`
					)
				);

				const parents_ids = parents.records.map(rec => rec.get('p').properties.id)

				ids = [...ids, ...parents_ids]

				const { ItemsService } = services;
				const schema = await getSchema();
				const itemsService = new ItemsService('persons', { schema, accountability, knex: database });

				const persons = await itemsService.readByQuery({
					fields: ['id',
						'firstname',
						'lastname',
						'portrait',
						'functions.start_at',
						'functions.function.title',
						'functions.function.name',
						'functions.function.translations.title',
						'functions.function.translations.name',
						'functions.organization.patron.prefix',
						'functions.organization.patron.suffix',
						'functions.organization.patron.firstname',
						'functions.organization.patron.lastname',
						'functions.organization.abbreviation',
						'functions.organization.name',
						'functions.organization.level',
					],
					filter: {
						_and: [
							{
								_or: [
									{
										deathdate: {
											_null: true
										}
									},
									{
										deathdate: {
											_gte: '2026-03-15'
										}
									},
								]
							},
							{
								_or: [
									{
										_and: [
											{
												portrait: {
													_nnull: true
												},
											},
											{
												functions: {
													organization: {
														id: {
															_in: ids
														}
													},
													function: {
														"translations": {
															"languages_code": {
																"_eq": "mg-MG"
															}
														}
													},
													start_at: {
														_lt: '2026-03-15'
													},
													end_at: {
														_gt: '2026-03-15'
													}
												}
											}
										]
									},
									{
										_and: [
											{
												portrait: {
													_nnull: true
												},
											},
											{
												functions: {
													organization: {
														id: {
															_in: ids
														}
													},
													function: {
														"translations": {
															"languages_code": {
																"_eq": "mg-MG"
															}
														}
													},
													start_at: {
														_lt: '2026-03-15'
													},
													end_at: {
														_null: true
													}
												}
											}
										]
									},
								]
							},
						]
					},
					deep: {
						"functions": {
							function: {
								translations: {
									"_filter": {
										"languages_code": {
											"_eq": "mg-MG"
										}
									}
								}
							},
							'_sort': ['-start_at']
						}
					},
					limit: -1,
				});

				return res.status(200).json(persons.map(person => ({
					id: person.id,
					lastname: person.lastname,
					firstname: person.firstname,
					picture: `/assets/${person.portrait}`,
					meta: {
						ecclesia: {
							organizations: [
								{
									patron: person.functions[0].organization.patron ? `${person.functions[0].organization.patron.prefix ?? ''} ${person.functions[0].organization.patron.firstname ?? ''} ${person.functions[0].organization.patron.lastname}, ${person.functions[0].organization.patron.suffix ?? ''}` : null,
									name: person.functions[0].organization.abbreviation ?? person.functions[0].organization.name,
									level: person.functions[0].organization.level,
									role: person.functions[0].function.translations[0]?.name ?? person.functions[0].function.name,
									functions: [
										{
											title: person.functions[0].function.translations[0]?.title ?? person.functions[0].function.title,
											function: person.functions[0].function.translations[0]?.name ?? person.functions[0].function.name,
											from: person.functions[0].start_at
										}
									]
								}
							]
						}
					}
				})))

			} finally {
				await session.close();
			}
		});

		router.get('/position', async (req, res) => {
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
