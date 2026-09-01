'use client'

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

export default function BackButton() {
    const __ = useTranslations()

    const router = useRouter()

    return <button type="button" onClick={()=>router.back()} className="my-6 px-8 py-4 text-zinc-800 hover:text-zinc-900 shadow-lg text-lg rounded-lg bg-zinc-200/30 hover:bg-zinc-100 transition duration-200 text-shadow-xs hover:text-shadow-none">{__(`Miverena any aloha`)}</button>
}