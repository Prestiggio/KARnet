'use client'

import { useTranslations } from "next-intl"
import { Search, LogIn, Info } from "lucide-react"
import { useEffect, useState, type MouseEvent } from 'react'
import Fuse from 'fuse.js'
import Image from "next/image"
import Link from "next/link"
import { session } from '@/components/database'
import { motion, AnimatePresence } from 'motion/react'
import { trackEvent } from "@/lib/umami"

export default function SearchForm({ parishes }: { parishes: any[] }) {
    const __ = useTranslations()

    const [items, setItems] = useState(parishes)
    const [keyword, setKeyword] = useState('')

    const fuse = new Fuse(parishes, {
        keys: ['name'],
        includeScore: true
    })

    const searchChanged = (e: any) => {
        const k = e.target.value
        setKeyword(k)
        setItems(ar => {
            return k ? fuse.search(k).map(it => it.item) : parishes
        })
    }

    useEffect(() => {
        session('parish', keyword)
    }, [keyword])

    const handleClick = (event: MouseEvent<HTMLAnchorElement>, parish: any) => {
        event.preventDefault()
        const href = event.currentTarget.getAttribute('href')
        trackEvent('parish_selected', {
            parish_id: parish.id,
            parish_name: parish.name,
        });
        fetch(`/parishes/${parish.id}/join`).then(()=>{
            document.location.href = href as string
        })
    };

    return <>
        <div className="sticky top-0 z-3 md:relative bg-yellow-50 dark:bg-zinc-800 md:bg-transparent">
            <input type="search" placeholder={__(`Karohy ato ny Eglizinao`)} onChange={searchChanged} className="focus:outline-2 pl-12 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-11/12 md:w-full bg-slate-300/10 dark:bg-zinc-800 my-4 py-2 px-4 hover:shadow-lg transition duration-400" />
            <Search className="absolute top-6 left-4 text-slate-400" />
        </div>
        {(items.length == 0 || keyword.length > 0) && <Link transitionTypes={['forward']} href={`/parishes/create`} className="float-left btn-add-parish mb-4 mr-4 shadow-lg block p-4 text-center text-white text-sm italic font-bold"><Info className="inline text-white mr-1" /> {__(`Azonao faritana eto ny Eglizinao raha tsy hita`)}</Link>}
        {items.length > 0 && <div className="float-right aspect-5/2 max-h-70">
            <h2 className="mb-2 uppercase text-gray-500 text-xs">{__(`Paroasy matetika zahàna`)} :</h2>
            <motion.ul layout className="md:grid grid-cols-4 gap-4 space-y-4 md:space-y-0 mb-4 md:mb-0">
                <AnimatePresence mode="popLayout" initial={false}>
                    <Link transitionTypes={['forward']} href={`/parishes/${items[0].id}/login`} onClick={(event)=>handleClick(event, items[0])} className="relative col-span-2 flex flex-col-reverse md:flex-row hover:shadow-lg transition duration-400">
                        <div className="relative md:absolute w-full bottom-0 grow md:bg-slate-600/80 min-h-30 md:text-white flex flex-col justify-between p-4">
                            <div>{__(`Kristianina_en_ligne`, { n: 3000 })}</div>
                            <div>
                                <div className="text-2xl">{items[0].name}</div>
                                <div className="text-xs">{items[0].ancestors}</div>
                            </div>
                            <div className="bg-gray-700 p-3 absolute right-0 bottom-0 text-gray-400">
                                <LogIn />
                            </div>
                        </div>
                        <div className="min-h-25 md:min-h-auto bg-slate-500">
                            {items[0].picture && <Image className="h-auto w-auto" src={`${process.env.NEXT_PUBLIC_CDN_HOST}/assets/${items[0].picture}`} width={800} height={600} alt={items[0].name} />}
                        </div>
                    </Link>
                    {items.slice(1, 3).map(parish => <motion.li key={parish.id} layout initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                            layout: { type: "spring", stiffness: 350, damping: 30 },
                            opacity: { duration: 0.15 },
                        }}><Link transitionTypes={['forward']} href={`/parishes/${parish.id}/login`} onClick={(event)=>handleClick(event, parish)} className="relative h-full cursor-pointer md:bg-slate-600/10 hover:shadow-lg transition duration-400 shadow-sm min-h-30">
                            <div className="bg-slate-500 h-full relative">
                                {parish.picture && <Image className="h-auto w-auto" src={`${process.env.NEXT_PUBLIC_CDN_HOST}/assets/${parish.picture}`} width={800} height={600} alt={parish.name} />}
                            </div>
                            <div className="absolute w-full bottom-0 left-0">
                                <div className="bg-gray-700 p-1 text-gray-400 text-xs float-right">
                                    <LogIn />
                                </div>
                                <div className="clear-right text-lg md:text-sm bg-slate-800/65 text-white p-4">
                                    {parish.name}
                                </div>
                            </div>
                        </Link>
                    </motion.li>)}
                </AnimatePresence>
            </motion.ul>
        </div>}
    </>
}