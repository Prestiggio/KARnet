import directus from '@/lib/directus';
import { readItems, readItem } from "@directus/sdk";
import { LG_DASHCODES } from "@/lib/utils";
import { getLocale } from 'next-intl/server';

const fields = ['id', 'name', 'picture', 'translations.name',
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
    const parish: any = await directus.request(readItem('organizations', id, {
        fields,
        deep: getDeepTranslations(locale),
    }))
    return {
        ...parish,
        name: parish.translations?.[0]?.name ?? parish.name,
        ancestors: getAncestorName(parish).join(' - ')
    }
}

export async function getParishes() {
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
    }))

    return parishes.map(parish => {
        return {
            ...parish,
            name: parish.translations?.[0]?.name ?? parish.name,
            ancestors: getAncestorName(parish).join(' - ')
        }
    })

}

export async function getPlaces(parish_id:string) {
    const places = await directus.request(readItems('places', {
        filter: {
            sector: parish_id
        }
    }))
    return places
}

export async function getAssigned(function_name:string, organization:string) {
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