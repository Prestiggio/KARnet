import { defineEndpoint } from '@directus/extensions-sdk';

// Agrégats du rapport pastoral pour une organisation, sur les axes décrits
// dans docs/mass-tracking-database-schema.md §10. Les collections sources
// (celebrations, observations, rehearsals, group_meetings, ...) n'existent
// pas encore dans le schéma Directus : les champs ci-dessous sont des
// placeholders à brancher sur de vraies requêtes une fois ces collections
// créées.
export default defineEndpoint({
	id: 'report',
	handler: (router) => {
		router.get('/:primaryKey', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const organizationId = req.params.primaryKey;
			const { from = null, to = null } = req.query;

			return res.status(200).json({
				organization_id: organizationId,
				period: { from, to },
				attendance: {
					average_attendee_count_by_period: [],
					average_attendee_count_by_church: [],
				},
				mobility: {
					attendee_to_parked_car_ratio: null,
				},
				sentiment: {
					positive_ratio: null,
					negative_ratio: null,
					average_star_rating: null,
					by_priest: [],
					by_group: [],
				},
				private_masses: {
					total: null,
					by_type: [],
				},
				group_meetings: {
					participation_vs_celebration_attendance: [],
				},
			});
		});
	},
});
