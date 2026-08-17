// app/reference/route.js
import { ApiReference } from '@scalar/nextjs-api-reference'
const config = {
  //url: 'https://registry.scalar.com/@scalar/apis/galaxy?format=yaml',
  url: '/openapi.json',
  favicon: '/logo.png',
  metaData: {
    title: 'Référence de l\'API K@Rnet pour les développeurs',
    description: 'Points de terminaison disponibles pour interagir avec les centres de données K@Rnet de l\'Église catholique romaine à Madagascar',
    ogDescription: 'Points de terminaison disponibles pour interagir avec les centres de données K@Rnet de l\'Église catholique romaine à Madagascar',
    ogTitle: 'Référence de l\'API K@Rnet pour les développeurs',
    ogImage: 'https://developer.katolika.net/api.webp',
    author: 'Prestiggio',
    date: '2026-08-17'
  }
}
export const GET = ApiReference(config)