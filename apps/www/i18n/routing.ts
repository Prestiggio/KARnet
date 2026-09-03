import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['mg', 'fr', 'en'],
 
  // Used when no locale matches
  defaultLocale: 'mg',

  pathnames: {
    '/': '/',
    '/legal-notice': {
      mg: '/fenitra-ara-dalana',
      fr: '/mentions-legales'
    },
    '/terms': {
      mg: '/fepetra-samihafa',
      fr: '/conditions-generales-d-utilisation'
    },
    '/privacy': {
      mg: '/zo-tsiambarantelo',
      fr: '/politique-de-confidentialite'
    },
    '/parishes': {
      mg: '/paroasy-rehetra',
      fr: '/paroisses'
    },
    '/parishes/[id]': {
      mg: '/paroasy/[id]',
      fr: '/paroisse/[id]'
    },
    '/parishes/[id]/login': {
      mg: '/paroasy/[id]/miditra',
      fr: '/paroisse/[id]/connexion'
    }
  }
});