import { defineEndpoint } from '@directus/extensions-sdk';
import type { Accountability } from '@directus/types'

export default defineEndpoint((router, {services, getSchema, database}) => {

	const { MailService } = services

	router.post('/mail', async (_req, res) => {

		const { accountability } = _req as typeof _req & { accountability?: Accountability | null }

		if (!accountability?.user) {
			return res.status(401).json({ error: 'Unauthorized' });
		}

		if (!accountability.admin) {
			return res.status(403).json({ error: 'Forbidden' });
		}

		const { to, subject, html, text } = _req.body

		const mail = new MailService({
			schema: await getSchema(),
			knex: database,
			accountability: accountability,
		})

		const response = await mail.send({ to, subject, html, text })

		return res.status(200).json({
			response
		})
	});
});
