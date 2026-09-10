'use client'

import { Mail, Smartphone, User2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import GoogleSignIn from './google'
import { useSearchParams } from 'next/navigation'
import { match } from "next/dist/compiled/path-to-regexp";

export default function LoginForm() {
    const __ = useTranslations()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect");
    const matcher = match('/parishes/create/:token', { decode: decodeURIComponent })
    let context = ''
    if(redirect && matcher(redirect) !== false)
        context = "parish_create"

    return <div className='space-y-4'>
        <div className='text-center'>
            <Link href={`/`}><Image src={`/logo.webp`} width={1024} height={1024} className="h-12 w-12 mx-auto" alt={__(`Katolika, Eglizy en ligne`)}/></Link>
        </div>
        {context === 'parish_create' ? <div className='my-4 text-center text-slate-500'>
            <div className='text-xl font-barlow font-bold'>
                {__(`Miverina aminao izahay`)}
            </div>
            <div className='text-lg'>
                {__(`Mahandrasa kely, apetraho ny contact`)}
            </div>
        </div>:<div className='text-lg font-barlow font-bold text-center text-slate-500 my-4'>
            {__(`Apetraho ny contact ifanomezantsika vaovao`)} :
        </div>}
        <div className='md:grid md:grid-cols-2 gap-8 space-y-4 md:space-y-0'>
            <div className='flex focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
                <input type='email' placeholder={__(`Email`)} autoFocus className='focus:outline-0 flex-1'/>
                <Mail className='inline-block text-slate-500'/>
            </div>
            <div className='flex focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
                <input type='phone' placeholder={__(`Laharan'ny finday`)} className='focus:outline-0 flex-1'/>
                <Smartphone className='inline-block text-slate-500'/>
            </div>
        </div>
        <div className='flex focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
            <input type='text' placeholder={__(`Anarana fiantso`)} className='focus:outline-0 flex-1'/>
            <User2 className='inline-block text-slate-500'/>
        </div>
        <div className='flex justify-center'>
            <GoogleSignIn/>
        </div>
    </div>
}