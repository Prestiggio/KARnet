import { getLocale, getTranslations } from "next-intl/server"
import { TableOfContents } from "@/components/table-of-contents"
import Image from "next/image"
import React from "react"

function CustomH1({ children }:{ children: React.ReactNode }) {
  return <h1 className="text-red-600">{children}</h1>
}

function CustomH2({ children }:{ children: React.ReactNode }) {
  return <h2 className="text-red-600/80">{children}</h2>
}
 
const overrideComponents = {
  h1: CustomH1,
  h2: CustomH2
}

export async function generateStaticParams() {
    return [{ locale: 'fr' }, { locale: 'mg' }, { locale: 'en' }]
}

// Frontmatter values can embed `{props.data.KEY}` placeholders (e.g. legal
// boilerplate). Unlike the mdx body, frontmatter is plain YAML text and is
// never evaluated as JSX, so placeholders are resolved manually here against
// the same `data` object passed to the mdx (mirrors table-of-contents.tsx).
function resolveMatterVars(value: any, data: any): any {
    if (typeof value === "string") {
        return value.replace(/\{props\.data\.([A-Za-z0-9_]+)\}/g, (_, key) => String(data?.[key] ?? ''))
    }
    if (Array.isArray(value)) {
        return value.map((item) => resolveMatterVars(item, data))
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, resolveMatterVars(val, data)]))
    }
    return value
}

export default function StaticPage(slug: string) {

    const generateMetadata = async ()=>{
        const locale = await getLocale()
        const [{ matter }, data] = await Promise.all([import(`@/components/static/${slug}/${locale}.mdx`), import(`@/app/[locale]/(RGPD)/rgpd.json`)])
        const resolvedMatter = resolveMatterVars(matter, data)
        return {
            ...resolvedMatter,
            title: `Katolika - ${resolvedMatter.title}`
        }
    }

    const Page = async ()=>{
        const [locale, __, data ] = await Promise.all([getLocale(), getTranslations(), import(`@/app/[locale]/(RGPD)/rgpd.json`)])
        const { default: Post, toc } = await import(`@/components/static/${slug}/${locale}.mdx`)
        return (
            <div className="flex gap-12">
                <aside className="hidden w-84 shrink-0 lg:block">
                    <div className="min-h-lvh sticky top-0 bg-zinc-100 shadow-[35px_0_50px_rgba(0,0,0,0.1)] pb-12">
                        <div className="flex flex-row items-center gap-x-4 mx-8">
                            <a href="/"><Image src={`/logo.webp`} width={1024} height={1024} className="w-8 h-8" alt={__(`Katolika, Eglizy en ligne`)}/></a>
                            <div className="font-barlow font-[300] text-sm tracking-widest">KATOLIKA</div>
                        </div>
                        <TableOfContents data={data} toc={toc} />
                    </div>
                </aside>
                <article className="my-12 whitespace-pre-line">
                    <Post data={data} components={overrideComponents}/>
                </article>
            </div>
        )
    }

    return {
        Page,
        generateMetadata
    }
}