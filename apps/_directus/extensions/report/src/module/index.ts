import { defineModule } from '@directus/extensions-sdk';
import ModuleComponent from './module.vue';

export default defineModule({
	id: 'report',
	name: 'Rapports',
	icon: 'analytics',
	routes: [
		{
			path: ':primaryKey',
			component: ModuleComponent,
			props: true
		},
	],
});
