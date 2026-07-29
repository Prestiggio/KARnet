import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './chord.vue';

export default defineInterface({
	id: 'song-chord',
	name: 'Accords depuis clavier MIDI',
	icon: 'piano',
	description: "Détecte l'accord joué sur un clavier MIDI connecté et l'insère dans le champ",
	component: InterfaceComponent,
	types: ['text'],
	group: 'standard',
	options: [
		{
			field: 'notation',
			name: 'Notation des accords',
			type: 'string',
			meta: {
				interface: 'select-dropdown',
				options: {
					choices: [
						{ text: 'Anglo-saxonne (C, D, E…)', value: 'letters' },
						{ text: 'Solfège (Do, Ré, Mi…)', value: 'solfege' },
					],
				},
			},
			schema: { default_value: 'letters' },
		}
	],
});
