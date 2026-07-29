import { defineInterface } from '@directus/extensions-sdk';
import InterfaceComponent from './interface.vue';

export default defineInterface({
	id: 'song-search',
	name: 'Recherche de chanson (Elasticsearch)',
	icon: 'music_note',
	description: 'Recherche une chanson dans Elasticsearch et pré-remplit les champs du formulaire',
	component: InterfaceComponent,
	types: ['string'],
	group: 'standard',
	options: [
		{
			field: 'esIndex',
			name: 'Index Elasticsearch',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
				note: 'Doit figurer dans la whitelist SONG_SEARCH_ES_ALLOWED_INDEXES côté serveur',
			},
			schema: { default_value: 'songs' },
		},
		{
			field: 'valuePath',
			name: 'Champ ES stocké dans CE champ',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'half',
				note: 'Chemin dans _source, ex: title ou artist.name',
			},
			schema: { default_value: 'title' },
		},
		{
			field: 'mapping',
			name: 'Mapping champs Directus → champs ES',
			type: 'json',
			meta: {
				interface: 'input-code',
				options: { language: 'json' },
				note: 'Clé = champ Directus à pré-remplir, valeur = chemin dans le document ES (_source). Ex: { "artist": "artist.name", "album": "album", "year": "year", "duration": "duration_seconds" }',
			},
			schema: {
				default_value: JSON.stringify({ artist: 'artist', album: 'album', year: 'year' }, null, 2),
			},
		},
		{
			field: 'placeholder',
			name: 'Placeholder',
			type: 'string',
			meta: { interface: 'input', width: 'half' },
			schema: { default_value: 'Rechercher une chanson…' },
		},
	],
});
