import { defineEndpoint } from '@directus/extensions-sdk';
import {
	Document,
	Packer,
	Paragraph,
	HeadingLevel,
	TextRun,
} from 'docx';

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
		paragraphs.push(new Paragraph({ text: performance.song.title, heading: HeadingLevel.HEADING_1, spacing: { after: 100 }}));
	}

	if (performance.chords) {
		paragraphs.push(...textToParagraphs(String(performance.chords), { monospace: true }));
	}

	return paragraphs;
}

export default defineEndpoint({
	id: 'performances-export-api',
	handler: (router, { services, database, getSchema, logger }) => {
		router.post('/', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const ids = Array.isArray(req.body?.ids) ? req.body.ids.map(String) : undefined;
			if (ids && ids.length === 0) {
				return res.status(400).json({ error: 'ids must be a non-empty array when provided' });
			}

			try {
				const { ItemsService } = services;
				const schema = await getSchema();
				const itemsService = new ItemsService('performances', { schema, accountability, knex: database });

				const performances = await itemsService.readByQuery({
					fields: FIELDS,
					filter: ids ? { id: { _in: ids } } : undefined,
					sort: ['sort'],
					limit: -1,
				});

				if (!performances.length) {
					return res.status(404).json({ error: 'No performance found' });
				}

				const children = performances.flatMap((performance: any, index: number) =>
					buildPerformanceSection(performance, index === 0)
				);

				const doc = new Document({
					sections: [{ children }],
				});

				const buffer = await Packer.toBuffer(doc);

				res.setHeader(
					'Content-Type',
					'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
				);
				res.setHeader('Content-Disposition', 'attachment; filename="performances.docx"');
				return res.send(buffer);
			} catch (err: any) {
				logger.error(err, 'Performances DOCX export failed');
				return res.status(500).json({ error: 'Export failed' });
			}
		});
	},
});
