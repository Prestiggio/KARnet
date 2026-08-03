import { defineModule } from '@directus/extensions-sdk';
import PerformancesExport from './PerformancesExport.vue';

export default defineModule({
	id: 'performances-export',
	name: 'Export Performances',
	icon: 'music_video',
	routes: [
		{
			path: '',
			component: PerformancesExport,
		},
	],
});
