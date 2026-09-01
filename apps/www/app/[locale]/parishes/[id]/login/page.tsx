import { getAncestors, getAssigned, getParish, getPlaces } from "@/lib/entities/parishes"
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next"
import { getPage } from "@/lib/entities/pages";
import { LG_COUNTRIES } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import moment from 'moment'

const base = process.env.BETTER_AUTH_URL

type Props = {
    params: Promise<{ locale: string, id: string }>
    searchParams: Promise<{ page?: string | string[] }>
}

function GoogleMap({place}:{place:any}) {
    const mapUrl = `https://www.google.com/maps?q=${place.coords.coordinates[1]},${place.coords.coordinates[0]}&z=15&output=embed`;
    return <iframe
        src={mapUrl}
        width="100%"
        className="h-1/2"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
    />
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const [{ id, locale }, { page }, __] = await Promise.all([
        params,
        searchParams,
        getTranslations(),
    ])
    const [
        parish,
        template
    ] = await Promise.all([
        getParish(id),
        getPage('login')
    ])
    const p = Number(page ?? 1);
    const url =  `${base}/${locale}/parishes/${id}/login`;

    const languages: any = {}
    languages['x-default'] = `/mg/parishes`

    return {
        title: parish.name + ' | ' + __(`Midira`),
        description: __(``),
        alternates: {
            canonical: url,
            languages,
        },
        openGraph: {
            type: "website",
            siteName: "katolika.net",
            title: `${parish.name} | ${parish.ancestors} | ${__(`Midira amin'ny paroasinao`)}`,
            description: ``,
            url,
            locale: LG_COUNTRIES[locale as keyof typeof LG_COUNTRIES],
            alternateLocale: Object.entries(LG_COUNTRIES)
                .filter(([l]) => l !== locale).map(([, v]) => v),
            images: [{
                url: `${base}/logo.webp`,
                width: 1200, height: 630, alt: parish.name,
            }],
        },
        twitter: { card: "summary_large_image" },
        robots: { index: p <= 1, follow: true, "max-image-preview": "large" },
    };
}

export default async function LoginPage({params}: {params: Promise<{id:string}>}) {
    const [{ id }, __] = await Promise.all([
        params,
        getTranslations()
    ])
    const [parish] = await Promise.all([
        getParish(id)
    ])
    const ancestors = getAncestors(parish)
    const diocese = ancestors.find(it=>it.type?.slug === 'diosezy')
    const [[place,], [pastor,], vicars] = await Promise.all([
        getPlaces(parish.id),
        getAssigned('Pastor', parish.id),
        getAssigned('Parochial Vicar', parish.id)
    ])
    
    return <div className="grow flex flex-col">
        <header className="px-5 py-3 border-b border-1 border-zinc-200">
            <Link href={`/`} transitionTypes={['back']} className="text-barlow flex items-center gap-3">
                <Image src={`/logo.webp`} width={480} height={480} alt={__(`Katolika, Eglizy en ligne`)} className="w-7 h-7"/>
                KATOLIKA
            </Link>
        </header>
        <ViewTransition name="login"
            enter={{ forward: "forward", back: "back", default: "auto" }}
            exit={{ forward: "forward", back: "back", default: "auto" }}
            share={{ forward: "forward", back: "back", default: "auto" }}>
            <div className="flex flex-col md:flex-row grow divide-x divide-zinc-200">
                <div className="md:w-3/12 p-6">
                    <Image src={`${process.env.NEXT_PUBLIC_CDN_HOST}/assets/${parish.picture}`} width={800} height={600} alt={parish.name} className="h-full object-cover"/>
                </div>
                <div className="md:w-6/12 p-6">
                    <span className="uppercase text-zinc-500 text-barlow tracking-widest">{diocese?.name}</span>
                    <div className="text-4xl md:text-5xl font-barlow font-[400]">
                        {parish.name}
                    </div>
                    <div className="min-h-50 prose dark:prose-invert my-8 max-w-none">
                        <table className="w-full border-spacing-4 border-1 border-zinc-300">
                            <tbody>
                                <tr className="divide-x divide-zinc-300">
                                    <td className="px-6 divide-y divide-zinc-300">
                                        <div>   
                                            <div className="text-nowrap text-4xl">2 400</div>
                                            <span className="text-zinc-500">vita batemy</span>
                                        </div>
                                        <div>   
                                            <div className="text-nowrap text-3xl">1 064</div>
                                            <span className="text-zinc-500">nankamasina ny alahady 30 aogositra</span>
                                        </div>
                                    </td>
                                    <td className="px-6 divide-y divide-zinc-300">
                                        <div>
                                            <div className="text-nowrap text-4xl">6</div>
                                            <span className="text-zinc-500">Natao batemy ny alahady lasa teo</span>
                                        </div>
                                        <div>
                                            <div className="text-nowrap text-3xl">1</div>
                                            <span className="text-zinc-500">Nodimandry ny herinandro lasa teo</span>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <h3>{__(`Fandaharam-potoanan'ny herinandro`)}</h3>
                        <table className="w-full border-collapse border-spacing-4">
                            <tbody>
                                <tr>
                                    <td>Alakamisy 4 Septambra</td>
                                    <td>Ora masina manomboka @ 5 ora sy sasany hariva<br/>
                                    Programa : Fitsaohana ny sakramenta masina sy konfesy<br/>
                                    *Mpanentana : AFAFI-FET<br/>
                                    *Mpitendry : Gérard<br/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Zoma 5 Septambra</td>
                                    <td>
                                        Zoma voalohany : Amin'ny 6 ora 15 mn maraina, 12 ora 45 mn ary 5 ora sy sasany hariva<br/>
                                    Programa : Sorona masina<br/>
                                    *Mpanentana : Tsy haiko iza fa samihafa ny maraina sy ny hariva sy ny atoandro, tsy miseho io raha tsy loggué<br/>
                                    *Mpitendry : Gérard<br/>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Alahady 7 Septambra</td>
                                    <td>
                                        6ora sy sasany<br/>
                                        8ora sy 45mn<br/>
                                        11 ora atoandro (teny frantsay)<br/>
                                        5 ora hariva<br/>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <h3>{__(`Ora fisokafan'ny birao`)}</h3>
                        <table className="w-full border-collapse border-spacing-4">
                            <tbody>
                                <tr>
                                    <td>Alatsinainy - Talata - Alakamisy maraina - Zoma - Sabotsy</td>
                                    <td>Maraina amin'ny 8 ora sy sasany hatramin'ny 11 ora sy sasany<br/>
                                    Hariva amin'ny 2 ora hatramin'ny 4 ora sy sasany</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="md:w-3/12 p-6">
                    {place?.coords && <GoogleMap place={place}/>}
                    <div className="border border-dashed border-zinc-200 border-1 my-4 p-4">
                        <table className="w-full border-collapse border-spacing-[10px]">
                            <tbody>
                                {pastor && <tr>
                                    <td className="text-nowrap align-top text-right text-zinc-500">*{__(`Curé`)} : </td>
                                    <td>
                                        <div className="font-bold">{pastor?.title} {pastor?.assigned?.lastname} {pastor?.assigned?.firstname}</div>
                                        <div className="text-xs italic">{__(`Hatramin'ny`)} {moment(pastor?.start_at).format('Y')}</div>
                                    </td>
                                </tr>}
                                {vicars.map((vicar:any)=><tr key={vicar.id}>
                                    <td className="text-nowrap align-top text-right text-zinc-500">*{__(`Vicaire`)} : </td>
                                    <td>
                                        <div className="font-bold">{vicar?.title} {vicar?.assigned?.lastname} {vicar?.assigned?.firstname}</div>
                                        <div className="text-xs italic">{__(`Hatramin'ny`)} {moment(vicar?.start_at).format('Y')}</div>
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </ViewTransition>
    </div>
}