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

    useEffect(()=>{
        loadSession()
    }, [])

    return <div className='grow flex flex-col justify-center p-4 md:p-0 md:my-8 md:max-w-4xl mx-auto'>
        <label htmlFor='name'>{__("Anaran'ny paroasy")}</label>
        <input id="name" type='text' defaultValue={parish} className='focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-11/12 md:w-full bg-slate-300/10 my-4 py-2 px-4 hover:shadow-lg transition duration-400'/>
        <label htmlFor='name'>{__("Olomasina mpiaro")}</label>
        <label htmlFor='name'>{__("Distrika")}</label>
        <label htmlFor='name'>{__("Diosezy")}</label>
    </div>
}