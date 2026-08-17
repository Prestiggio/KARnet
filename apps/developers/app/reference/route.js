// app/reference/route.js
import { ApiReference } from '@scalar/nextjs-api-reference'
const config = {
  //url: 'https://registry.scalar.com/@scalar/apis/galaxy?format=yaml',
  url: '/openapi.json',
  favicon: '/logo.png',
  metaData: {
    title: 'K@Rnet Developer API Reference',
    description: 'Available endpoints for interacting with Roman Catholic Church Network in Madagascar',
    ogDescription: 'Available endpoints for interacting with Roman Catholic Church Network in Madagascar',
    ogTitle: 'K@Rnet Developer API Reference',
    ogImage: 'https://developer.katolika.net/api.jpeg',
    author: 'Prestiggio',
    date: '2026-08-17'
  }
}
export const GET = ApiReference(config)