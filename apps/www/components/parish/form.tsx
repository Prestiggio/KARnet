'use client'

import { session } from '@/components/database'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

export default function ParishForm() {

    const [parish, setParish] = useState('')

    const __ = useTranslations()

    async function loadSession() {
        const p = await session('parish')
        setParish(p)
    }

    useEffect(() => {
        loadSession()
    }, [])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget))

        await fetch('/parishes/create/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
    }

    return <form className='grow flex flex-col justify-center p-4 md:p-0 md:my-8 md:max-w-4xl mx-auto w-full md:min-w-3xl space-y-8' onSubmit={onSubmit}>
        <input name="name" placeholder={__("Anaran'ny paroasy")} type='text' defaultValue={parish} className='focus:outline-2 text-center focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />
        <input name="patron" placeholder={__("Olomasina mpiaro")} type='text' className='focus:outline-2 focus:-outline-offset-2 text-center focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />
        <input name="diocese" placeholder={__("Diosezy")} type='text' className='focus:outline-2 focus:-outline-offset-2 text-center focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />
        <input name="district" placeholder={__("Distrika")} type='text' className='focus:outline-2 focus:-outline-offset-2 text-center focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />
        <button type='submit' className='bg-yellow-200 dark:bg-zinc-800 dark:text-white cursor-pointer hover:bg-yellow-200/80 dark:hover:bg-zinc-800/80 transition duration-300 hover:shadow-lg shadow-sm py-2 text-lg text-barlow font-bold text-zinc-600'>{__(`'zay`)}</button>
    </form>
}