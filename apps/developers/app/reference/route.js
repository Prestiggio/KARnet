// app/reference/route.js
import { ApiReference } from '@scalar/nextjs-api-reference'
const config = {
  //url: 'https://registry.scalar.com/@scalar/apis/galaxy?format=yaml',
  url: '/openapi.json',
  favicon: '/logo.png',
  metaData: {
    title: 'K@Rnet Developer API Reference'
  }
}
export const GET = ApiReference(config)