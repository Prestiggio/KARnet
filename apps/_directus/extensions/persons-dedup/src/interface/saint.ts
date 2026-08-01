import { defineInterface } from '@directus/extensions-sdk';
import PrefillInput from './PrefillInput.vue';

/**
 * Champ texte identique à l'input standard, mais qui se pré-remplit une
 * seule fois (au montage, si le champ est vide) à partir d'un paramètre de
 * l'URL. Utilisé pour préremplir lastname/firstname sur la page de création
 * de "saints" depuis le module de vérification de doublon.
 */
export default defineInterface({
	id: 'prefill-input',
	name: "Texte (pré-rempli depuis l'URL)",
	icon: 'text_fields',
	description: "Champ texte pré-rempli au premier chargement à partir d'un paramètre de requête, si le champ est vide",
	component: PrefillInput,
	types: ['string'],
	group: 'standard',
	options: [
		{
			field: 'queryParam',
			name: 'Paramètre URL',
			type: 'string',
			meta: {
				interface: 'input',
				width: 'full',
				note: 'Nom du paramètre de requête à lire (ex: lastname). Par défaut, le nom du champ.',
			},
		},
		{
			field: 'placeholder',
			name: 'Placeholder',
			type: 'string',
			meta: { interface: 'input', width: 'full' },
		},
	],
});
