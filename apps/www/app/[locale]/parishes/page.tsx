import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LG_COUNTRIES } from "@/lib/utils";
import SearchForm from "@/components/parish/search";
import { ViewTransition } from "react";
import { getParishes } from "@/lib/entities/parishes";
import { getPage } from "@/lib/entities/pages";

const base = process.env.BETTER_AUTH_URL;

type Props = {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ page?: string | string[] }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [content, { locale }, { page }, __] = await Promise.all([
        getPage('parishes'),
        params,
        searchParams,
        getTranslations(),
    ])
    const p = Number(page ?? 1);
    const suffix = p > 1 ? ` — ${__(`Pejy`)} ${p}` : "";
    const url =  `${base}/${locale}/${content?.slug ?? 'parishes'}`;

    const languages: any = {}
    content?.slugs?.map((slug:any)=>{
        const short_lang = slug.languages_code.split('-')[0]
        languages[short_lang] = `/${short_lang}/${slug.slug}`
    })
    languages['x-default'] = `/mg/parishes`

    return {
        title: content?.title + ' | ' + __('EKAR en ligne') + suffix,
        description: content?.description,
        alternates: {
            canonical: url,
            languages,
        },
        openGraph: {
            type: "website",
            siteName: "katolika.net",
            title: content?.og_title,
            description: content?.og_description,
            url,
            locale: LG_COUNTRIES[locale as keyof typeof LG_COUNTRIES],
            alternateLocale: Object.entries(LG_COUNTRIES)
                .filter(([l]) => l !== locale).map(([, v]) => v),
            images: [{
                url: `${base}/logo.webp`,
                width: 1200, height: 630, alt: content?.og_alt,
            }],
        },
        twitter: { card: "summary_large_image" },
        robots: { index: p <= 1, follow: true, "max-image-preview": "large" },
    };
}

export default async function Parishes() {
    const parishes = await getParishes()

    return <ViewTransition
        name="login"
        enter={{ forward: "forward", back: "back", default: "auto" }}
        exit={{ forward: "forward", back: "back", default: "auto" }}
        share={{ forward: "forward", back: "back", default: "auto" }}
    >
        <div className="px-4">
            <SearchForm parishes={parishes}/>
        </div>
    </ViewTransition>

}