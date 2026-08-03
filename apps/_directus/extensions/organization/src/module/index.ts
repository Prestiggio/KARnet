import { defineModule } from '@directus/extensions-sdk';
import Organization from './Organization.vue';

export default defineModule({
	id: 'organization',
	name: 'Organisations',
	icon: 'account_tree',
	routes: [
		{
			path: '',
			component: Organization,
		},
	],
});
