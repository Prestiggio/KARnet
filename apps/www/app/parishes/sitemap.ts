import type { MetadataRoute } from 'next'
import directus from '@/lib/directus';
import { readItems, aggregate } from '@directus/sdk';
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const BASE_URL = process.env.BETTER_AUTH_URL;

// Google's limit is 50,000 URLs per sitemap
const PERPAGE = 50000

export async function generateSitemaps() {
  // Fetch the total number of products and calculate the number of sitemaps needed

  const [{ count }] = await directus.request(aggregate('organizations', {
    aggregate: {
      count: ['id']
    },
    query: {
      filter: {
        type: {
          slug: {
            _eq: 'paroasy'
          }
        }
      }
    }
  }))

  const n = Math.ceil(Number(count?.id) / PERPAGE)

  return Array.from({ length: n }, (_, id) => ({ id }))
}

export default async function sitemap(props: {
  id: Promise<string>
}): Promise<MetadataRoute.Sitemap> {
  const id = await props.id
  const parishes: any[] = await directus.request(readItems('organizations', {
    fields: ['id', 'name', 'slug', 'date_created', 'translations.slug', 'translations.languages_code'],
    filter: {
      type: {
        slug: {
          _eq: 'paroasy'
        }
      }
    },
    limit: Math.floor(PERPAGE / routing.locales.length),
    page: parseInt(id)
  }))
  return parishes.flatMap((parish) => {
    const href = { pathname: "/parishes/[id]", params: { id: parish.slug } } as const;
    const languages = Object.fromEntries(
      routing.locales.map((locale) => {
        const localizedHref = parish.translations.find((it: any) => it.languages_code.startsWith(locale))?.slug
        return [locale, `${BASE_URL}${getPathname({ locale, href: localizedHref ? { pathname: "/parishes/[id]", params: { id: localizedHref } } : href })}`]
      })
    );
    languages["x-default"] = `${BASE_URL}${getPathname({ locale: routing.defaultLocale, href })}`;

    return routing.locales.map((locale) => {
      const localizedHref = parish.translations.find((it: any) => it.languages_code.startsWith(locale))?.slug
      return ({
        url: `${BASE_URL}${getPathname({ locale, href: localizedHref ? { pathname: "/parishes/[id]", params: { id: localizedHref } } : href })}`,
        lastModified: parish.date_created,
        changeFrequency: "hourly" as const,
        priority: 0.5,
        alternates: { languages },
      })
    });
  })
}