import { defineModule } from '@directus/extensions-sdk';
import PersonCheck from './PersonCheck.vue';

export default defineModule({
	id: 'persons-dedup',
	name: 'Nouvelle personne',
	icon: 'person_search',
	routes: [
		{
			path: '',
			component: PersonCheck,
		},
	],
});
