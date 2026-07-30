import { defineModule } from '@directus/extensions-sdk';
import PerformancesExport from './PerformancesExport.vue';

export default defineModule({
	id: 'performances-export',
	name: 'Export Performances',
	icon: 'description',
	routes: [
		{
			path: '',
			component: PerformancesExport,
		},
	],
});
