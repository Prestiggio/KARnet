'use client'

import { Mail, Smartphone, User2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import GoogleSignIn from './google'
import { useSearchParams } from 'next/navigation'
import { match } from "next/dist/compiled/path-to-regexp";
import { useRef, useState } from 'react'
import { trackEvent } from '@/lib/umami'

export default function LoginForm() {
    const __ = useTranslations()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect");

    const [providers, setProviders] = useState<string[]>([
        'google',
        //'sms'
    ])

    const matcher = match('/parishes/create/:token', { decode: decodeURIComponent })
    let context = ''
    if(redirect && matcher(redirect) !== false)
        context = "parish_create"

    const submitClicks = useRef<number[]>([])
    const rageClickReported = useRef(false)

    const handleSubmitClick = () => {
        const now = Date.now()
        submitClicks.current = [...submitClicks.current, now].filter(t => now - t < 2000)
        if (submitClicks.current.length >= 3 && !rageClickReported.current) {
            rageClickReported.current = true
            trackEvent('login_rage_click', { clicks: submitClicks.current.length, context })
        }
    }

    const handleInvalid = (event: React.InvalidEvent<HTMLInputElement>) => {
        trackEvent('login_field_validation_error', {
            field: event.currentTarget.name || event.currentTarget.type,
            context,
        })
    }

    const handleFieldAbandon = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.currentTarget.value === '') {
            trackEvent('login_field_abandoned', {
                field: event.currentTarget.name || event.currentTarget.type,
                context,
            })
        }
    }

    return <form className='space-y-4'>
        <div className='text-center'>
            <Link href={`/`}><Image src={`/logo.webp`} width={1024} height={1024} className="h-12 w-12 mx-auto" alt={__(`Katolika, Eglizy en ligne`)}/></Link>
        </div>
        {context === 'parish_create' ? <div className='my-4 text-center text-slate-500 dark:text-slate-100'>
            <div className='text-xl font-barlow font-bold'>
                {__(`Miverina aminao izahay`)}
            </div>
            <div className='text-lg'>
                {__(`Mahandrasa kely, apetraho ny contact`)}
            </div>
        </div>:<div className='text-lg font-barlow font-bold text-center text-slate-500 my-4'>
            {__(`Apetraho ny contact ifanomezantsika vaovao`)} :
        </div>}
        <div className='md:flex space-x-8 space-y-4 md:space-y-0'>
            <div className='flex flex-1 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
                <input type='email' name='email' required placeholder={__(`Email`)} autoFocus className='focus:outline-0 flex-1' onInvalid={handleInvalid} onBlur={handleFieldAbandon}/>
                <Mail className='inline-block text-slate-500'/>
            </div>
            {providers.includes('sms') && <div className='flex flex-1 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
                <input type='phone' name='phone' required placeholder={__(`Laharan'ny finday`)} className='focus:outline-0 flex-1' onInvalid={handleInvalid} onBlur={handleFieldAbandon}/>
                <Smartphone className='inline-block text-slate-500'/>
            </div>}
        </div>
        <div className='flex focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
            <input type='text' name='fullname' placeholder={__(`Anarana fiantso`)} className='focus:outline-0 flex-1'/>
            <User2 className='inline-block text-slate-500'/>
        </div>
        <button type='submit' onClick={handleSubmitClick} className='relative capitalize font-barlow text-lg font-semibold text-center w-full dark:bg-slate-200/30 py-2 bg-yellow-200 shadow-lg cursor-pointer hover:bg-yellow-100 transition duration-400'>
            {__(`'zay`)}
        </button>
        {providers.includes('google') && <div className='border-t-1 dark:border-slate-500 pt-4'>
            {providers.includes('google') && <div className='flex justify-center'>
                <GoogleSignIn/>
            </div>}
        </div>}
    </form>
}