import { defineEndpoint } from '@directus/extensions-sdk';

// Agrégats du rapport pastoral pour une organisation, sur les axes décrits
// dans docs/mass-tracking-database-schema.md §10. Les collections sources
// (celebrations, observations, rehearsals, group_meetings, ...) n'existent
// pas encore dans le schéma Directus : les champs ci-dessous sont des
// placeholders à brancher sur de vraies requêtes une fois ces collections
// créées.
export default defineEndpoint({
	id: 'report',
	handler: (router, { database }) => {
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

		router.post('/:primaryKey', async (req, res) => {
			const accountability = (req as any).accountability;
			if (!accountability?.user) {
				return res.status(401).json({ error: 'Unauthorized' });
			}

			const organization_id = req.params.primaryKey;

			const { date, obs_value, is_estimate = false } = req.body;

			if (!organization_id || !date || obs_value === undefined) {
				return res.status(400).json({ error: 'organization_id, date and obs_value are required' });
			}

			await database.raw(
				`WITH p AS (SELECT ?::date AS d)
				INSERT INTO stat_observations
				  (id, ref_area, indicator, freq, time_period, time_start, time_end,
				   obs_value, schedule, obs_status, source, collected_at)
				SELECT gen_random_uuid(),?,
				       (SELECT id FROM stat_indicators WHERE code = 'MASS_ATTEND'),
				       stat_code_id('CL_FREQ','D'), to_char(p.d,'YYYY-MM-DD'), p.d, p.d,
				       ?,
				       stat_code_id('CL_SCHEDULE', '_T'),
				       stat_code_id('CL_OBS_STATUS', ?),
				       'declared',
				       now()
				FROM p
				ON CONFLICT (ref_area, indicator, freq, time_period,
				             sex, age_group, schedule, offering_type)
				DO UPDATE SET obs_value    = EXCLUDED.obs_value,
				              obs_status   = EXCLUDED.obs_status,
				              source       = EXCLUDED.source,
				              collected_at = EXCLUDED.collected_at`,
				[date, organization_id, obs_value, is_estimate ? 'E' : 'A']
			);

			return res.status(200).json({ ok: true });
		})
	},
});
