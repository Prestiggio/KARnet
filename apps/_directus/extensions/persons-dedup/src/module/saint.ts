import { defineModule } from '@directus/extensions-sdk';
import SaintCheck from './SaintCheck.vue';

export default defineModule({
	id: 'saints-dedup',
	name: 'Nouveau saint',
	icon: 'manage_search',
	routes: [
		{
			path: '',
			component: SaintCheck,
		},
	],
});
