import directus from '@/lib/directus';
import { readItems, readItem } from "@directus/sdk";
import { isUuid, LG_DASHCODES } from "@/lib/utils";
import { getLocale } from 'next-intl/server';
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";

const fields = ['id', 'name', 'picture.id', 'picture.width', 'picture.height', 'slug', 'date_created', 'translations.name',
    'parent.id', 'parent.name', 'parent.type.slug', 'parent.translations.name',
    'parent.parent.id', 'parent.parent.name', 'parent.parent.type.slug', 'parent.parent.translations.name',
    'parent.parent.parent.id', 'parent.parent.parent.name', 'parent.parent.parent.type.slug', 'parent.parent.parent.translations.name',
    'parent.parent.parent.parent.id', 'parent.parent.parent.parent.name', 'parent.parent.parent.parent.type.slug', 'parent.parent.parent.parent.translations.name',
]

function getDeepTranslations(locale: keyof typeof LG_DASHCODES) {
    return {
        "translations": {
            _filter: {
                "languages_code": {
                    "_eq": LG_DASHCODES[locale]
                }
            }
        },
        parent: {
            "translations": {
                _filter: {
                    "languages_code": {
                        "_eq": LG_DASHCODES[locale]
                    }
                }
            },
            parent: {
                "translations": {
                    _filter: {
                        "languages_code": {
                            "_eq": LG_DASHCODES[locale]
                        }
                    }
                },
                parent: {
                    "translations": {
                        _filter: {
                            "languages_code": {
                                "_eq": LG_DASHCODES[locale]
                            }
                        }
                    },
                    parent: {
                        "translations": {
                            _filter: {
                                "languages_code": {
                                    "_eq": LG_DASHCODES[locale]
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export function getAncestors(parish: any) {
    let ancestors: any[] = []
    let parent = { ...parish.parent }
    let i = 0
    while (parent) {
        if (parent.name) {
            ancestors.push({
                ...parent,
                name: parent.translations?.[0]?.name ?? parent.name
            })
        }
        parent = { ...parent.parent }
        i++
        if (parent.type?.slug === 'diosezy' || i > 4) {
            ancestors.push({
                ...parent,
                name: parent.translations?.[0]?.name ?? parent.name
            })
            break
        }
    }
    return ancestors.reverse()
}

function getAncestorName(parish: any) {
    let ancestors = getAncestors(parish)
    return ancestors.map(parent => parent.name)
}

export async function getParish(id: string) {
    const locale = await getLocale() as keyof typeof LG_DASHCODES
    let parish: any
    if (isUuid(id)) {
        parish = await directus.request(readItem('organizations', id, {
            fields,
            deep: getDeepTranslations(locale),
        }))
    }
    else {
        [parish,] = await directus.request(readItems('organizations', {
            fields,
            filter: {
                _or: [
                    {
                        slug: {
                            _eq: id
                        }
                    },
                    {
                        translations: {
                            slug: {
                                _eq: id
                            }
                        }
                    }
                ]
            },
            deep: getDeepTranslations(locale),
        }))
    }
    return {
        ...parish,
        name: parish.translations?.[0]?.name ?? parish.name,
        slug: parish.translations?.[0]?.slug ?? parish.slug,
        ancestors: getAncestorName(parish).join(' - ')
    }
}

export async function getParishes(limit: number = -1) {
    const locale = await getLocale() as keyof typeof LG_DASHCODES
    const parishes: any[] = await directus.request(readItems('organizations', {
        fields,
        filter: {
            type: {
                slug: {
                    _eq: 'paroasy'
                }
            }
        },
        deep: getDeepTranslations(locale),
        limit
    }))

    return parishes.map(parish => {
        return {
            ...parish,
            name: parish.translations?.[0]?.name ?? parish.name,
            ancestors: getAncestorName(parish).join(' - ')
        }
    })

}

export async function getPlaces(parish_id: string) {
    const places = await directus.request(readItems('places', {
        filter: {
            sector: parish_id
        }
    }))
    return places
}

export async function getAssigned(function_name: string, organization: string) {
    const function_assignations = await directus.request(readItems('function_assignations', {
        fields: ['id', 'assigned.firstname', 'assigned.lastname', 'title', 'start_at'],
        filter: {
            organization: {
                _eq: organization
            },
            function: {
                name: {
                    _eq: function_name
                }
            },
            end_at: {
                _null: true
            }
        },
        sort: ['-start_at']
    }))
    return function_assignations
}

export function parishJsonLd(parish: any, locale: string) {
    const BASE_URL = process.env.BETTER_AUTH_URL;

    const entityId = `${BASE_URL}/parishes/${parish.id}#church`;

    const href = { pathname: "/parishes/[id]", params: { id: parish.slug } } as const;
    const pageUrl = `${BASE_URL}${getPathname({ locale, href })}`

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Church',
                '@id': entityId,
                name: parish.name,
                alternateName: parish.alt_names ?? undefined,
                description: parish.description,
                url: pageUrl,
                address: {
                    '@type': 'PostalAddress',
                    streetAddress: parish.place?.address,
                    addressCountry: 'MG',
                },
                geo: {
                    '@type': 'GeoCoordinates',
                    latitude: parish.place?.coords?.coordinates?.[0],
                    longitude: parish.place?.coords?.coordinates?.[1],
                },
                image: parish.picture?.id
                    ? `${process.env.NEXT_PUBLIC_CDN_HOST}/assets/${parish.picture.id}`
                    : undefined,
                isAccessibleForFree: true
            },
            {
                '@type': 'WebPage',
                '@id': pageUrl,
                url: pageUrl,
                inLanguage: locale,
                mainEntity: { '@id': entityId },
                isPartOf: { '@id': `${BASE_URL}/#website` },
                dateModified: parish.date_created,
            }
        ],
    };
}