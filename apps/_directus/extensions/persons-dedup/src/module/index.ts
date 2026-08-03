import { defineModule } from '@directus/extensions-sdk';
import PersonCheck from './PersonCheck.vue';
import SaintCheck from './SaintCheck.vue';

export default defineModule({
	id: 'persons-dedup',
	name: 'Nouvelle personne',
	icon: 'person_search',
	routes: [
		{
			path: '',
			component: PersonCheck,
		},
		{
			path: 'saints',
			component: SaintCheck
		}
	],
});
