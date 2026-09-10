'use client'

import { session } from '@/lib/database'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { SquareArrowOutUpRight } from 'lucide-react'
import Antibot from '@/components/antibot'
import { Link } from '@/i18n/navigation'
import DiosezyMap from './diosezy'
import { FormProvider, useForm } from '@/components/form-context'

export default function ParishForm({ dioceses }: { dioceses: any[] }) {
    return <FormProvider>
        <ParishFormFields dioceses={dioceses} />
    </FormProvider>
}

function ParishFormFields({ dioceses }: { dioceses: any[] }) {

    const formId = 'parish-draft'

    const { formData, handleChange, validate } = useForm(formId, {
        parish: '',
        patron: '',
        diocese: '',
        district: ''
    })

    const __ = useTranslations()

    const handleTextChange = (e: any) => {
        const field = e.target.getAttribute('name')
        const value = e.target.value
        handleChange(field, value)
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if(!validate()) {
            return
        }
        const data = Object.fromEntries(new FormData(e.currentTarget))
        const [response] = await Promise.all([
            fetch(`/parishes/create/api`)
        ])
        const { token } = await response.json()
        await session(token, data)
        document.location.href = `/parishes/create/${token}`
        /*await fetch('/parishes/create/api', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })*/
    }

    return <form id={formId} className='grow shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col justify-center p-4 md:p-8 md:my-8 md:max-w-4xl mx-auto w-full md:min-w-3xl space-y-8' onSubmit={onSubmit}>
        <div className='text-center'>
            <Link href={`/`}><Image src={`/logo.webp`} width={1024} height={1024} className="h-12 w-12 mx-auto" alt={__(`Katolika, Eglizy en ligne`)} /></Link>
        </div>
        <div className='flex flex-col md:flex-row md:gap-8 space-y-4 md:space-y-0'>
            <input required name="name" onChange={handleTextChange} placeholder={__("Anaran'ny paroasy")} type='text' defaultValue={formData.name} className='md:flex-1 focus:outline-2 text-center focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />
            <input required name="patron" onChange={handleTextChange} placeholder={__("Olomasina mpiaro")} type='text' defaultValue={formData.patron} className='md:flex-1 focus:outline-2 focus:-outline-offset-2 text-center focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />
        </div>
        <DiosezyMap dioceses={dioceses} />
        {false && <input name="district" onChange={handleTextChange} placeholder={__("Distrika")} type='text' defaultValue={formData.district} className='focus:outline-2 focus:-outline-offset-2 text-center focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400' />}
        <button type='submit' className='relative bg-yellow-200 dark:bg-zinc-800 dark:text-white cursor-pointer hover:bg-yellow-200/80 dark:hover:bg-zinc-800/80 transition duration-300 hover:shadow-lg shadow-sm py-2 text-lg/8 font-barlow font-bold text-zinc-600'>{__(`Ampidirina`)} <SquareArrowOutUpRight className='absolute top-3 right-3 w-5' /></button>
        <Antibot />
    </form>
}