import directus from '@/lib/directus';
import { readItems, readItem } from "@directus/sdk";
import { LG_DASHCODES } from "@/lib/utils";
import { getLocale } from 'next-intl/server';

function getDeepTranslations(locale: keyof typeof LG_DASHCODES) {
    return {
        "translations": {
            _filter: {
                "languages_code": {
                    "_eq": LG_DASHCODES[locale]
                }
            }
        }
    }
}

export async function getPage(slug: string) {
    const locale = await getLocale() as keyof typeof LG_DASHCODES

    const pages = await directus.request(readItems('pages', {
        fields: [
            'id',
            'title',
            'description', 
            'og_title',
            'og_description',
            'og_alt',
            'slug',
            'og_image',
            'translations.title',
            'translations.description',
            'translations.og_title',
            'translations.og_description',
            'translations.og_alt'
        ],
        filter: {
            slug: {
                _eq: slug
            }
        },
        deep: getDeepTranslations(locale),
        limit: 1
    }))

    if(pages.length) {
        const page = pages[0]

        const _page = await directus.request(readItem('pages', page.id, {
            fields: ['translations.slug', 'translations.languages_code']
        }))

        return {
            ...page,
            title: page.translations?.[0]?.title ?? page.title,
            description: page.translations?.[0]?.description ?? page.description,
            og_title: page.translations?.[0]?.og_title ?? page.og_title,
            og_description: page.translations?.[0]?.og_description ?? page.og_description,
            og_alt: page.translations?.[0]?.og_alt ?? page.og_alt,
            slug: page.translations?.[0]?.slug ?? page.slug,
            slugs: _page.translations
        }
    }
}