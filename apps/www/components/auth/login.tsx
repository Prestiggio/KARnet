'use client'

declare const grecaptcha: { enterprise : { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> }}

import { Mail, Smartphone, User2, CircleX } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import GoogleSignIn from './google'
import { useSearchParams } from 'next/navigation'
import { match } from "next/dist/compiled/path-to-regexp";
import { useActionState, useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/umami'
import OTPLogin, { validateOTP } from '@/actions/login/otp'
import { session, session_delete, values } from '@/lib/database'
import OTPInput from '@/components/auth/OTPInput'
import Antibot from '@/components/antibot'
import { FormProvider, useForm } from '../form-context';
import FacebookSignInButton from './facebook';
import AppleSignInButton from './apple';
import LinkedingSignInButton from './linkedin';
import SocialLogin from './social';

type User = {
    email: string,
    name: string,
    antibot: string
}

export default function LoginFormWrapper() {
    return <FormProvider>
        <LoginForm/>
    </FormProvider>
}

function LoginForm() {
    const __ = useTranslations()
    const searchParams = useSearchParams()
    const redirect = searchParams.get("redirect");
    const locale = useLocale()
    const { formData, setFormData } = useForm('otp-form', {
        otp: ''
    })
    const [user, setUser] = useState<User>({
        email: '',
        name: '',
        antibot: ''
    })
    const [showSpammed, setShowSpammed] = useState(false)
    const [allowRetry, setAllowRetry] = useState(false)
    const [allowCall, setAllowCall] = useState(false)

    const matcher = match('/parishes/create/:token', { decode: decodeURIComponent })
    let context = ''
    if (redirect && matcher(redirect) !== false)
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

    useEffect(() => {
        session('redirect', { redirect })
    }, [])

    const handleUserChange = (e: any, field: string) => {
        const value = e.target.value
        setUser((u: User) => ({
            ...u,
            [field]: value
        }))
    }

    const [state, formAction, pending] = useActionState(OTPLogin, {
        sent: false,
        required: []
    })

    const validateOTPWithUser = validateOTP.bind(null, user)
    const otpSubmitted = useRef(false)
    const [otpState, otpFormAction, otpPending] = useActionState(validateOTPWithUser, {
        success: false
    })

    const [showAlternative, setShowAlternative] = useState(false)
    const [showPopup, setShopPopup] = useState(false)

    useEffect(() => {
        if (!state.sent) return
        grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA!, { action: 'submit' }).then(async (recaptcha_token: any)=>{
            setUser((u:User)=>({
                ...u,
                antibot: recaptcha_token
            }))
        });
        const timer = setTimeout(() => {
            setShowSpammed(true)
        }, 10000)
        return () => clearTimeout(timer)
    }, [state.sent])

    useEffect(() => {
        if (!showSpammed) return
        const timer = setTimeout(() => {
            setAllowRetry(true)
        }, 10000)
        return () => clearTimeout(timer)
    }, [showSpammed])

    useEffect(()=>{
        if(!state.required?.length) return;
        grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA!, { action: 'submit' }).then(async (recaptcha_token: any)=>{
            setUser((u:User)=>({
                ...u,
                antibot: recaptcha_token
            }))
        });
    }, [state.required])

    useEffect(() => {
        if (allowRetry) return
        if (!showSpammed) return
        const timer = setTimeout(() => {
            setAllowRetry(true)
        }, 30000)
        return () => clearTimeout(timer)
    }, [allowRetry, showSpammed])

    useEffect(() => {
        if (state.sent && showSpammed && allowRetry) {
            const timer = setTimeout(() => {
                if (!formData.otp) setShowAlternative(true)
            }, 15000)
            return () => clearTimeout(timer)
        }

    }, [state.sent, showSpammed, allowRetry])

    async function queueSubmissions() {
        
        const all = await values()
        let parish_creations: Promise<any>[] = []
        for(const item of all) {
            const pending = await session(item.key)
            if(pending.subject === 'parish-draft') {
                parish_creations.push(fetch(`/parishes/create/api`, {
                    method: 'POST',
                    body: JSON.stringify({...pending.content, token: item.key})
                }))
                parish_creations.push(session_delete(item.key))
            }
        }
        await Promise.all(parish_creations)
        
        
    }

    useEffect(()=>{
        setFormData({
            otp: ''
        })
        if(otpState.success) {
            document.location.href = redirect ?? '/'
        }
    }, [otpState])

    const resendOTP = async () => {
        setAllowRetry(false)
        grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA!, { action: 'submit' }).then(async function (recaptcha_token: any) {
            void fetch('/sign-in/otp', {
                method: 'POST',
                body: JSON.stringify({
                    ...user,
                    antibot: recaptcha_token
                })
            })
        });
    }

    if(!state.sent && state.required?.includes('fullname')) {
        return <form className='space-y-4' action={formAction}>
            <div className='flex focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
                <input type='text' onChange={(e) => handleUserChange(e, 'name')} value={user.name} name='fullname' required placeholder={__(`Anarana fiantso`)} className='focus:outline-0 flex-1' />
                <User2 className='inline-block text-slate-500' />
            </div>
            <input type="hidden" name="email" value={user.email}/>
            <input type='hidden' name='locale' value={locale} />
            <input type='hidden' name='antibot' value={user.antibot} />
            <button type='submit' onClick={handleSubmitClick} disabled={pending} className='relative capitalize font-barlow text-lg font-semibold text-center w-full dark:bg-slate-200/30 py-2 bg-yellow-200 shadow-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-slate-600 transition duration-400 disabled:bg-gray-200'>
                {__(`'zay`)}
            </button>
        </form>
    }
    else if (state.sent) {
        return <form action={otpFormAction}>
            <div className="text-center space-y-4 text-slate-600 dark:text-slate-100">
                <div className="text-lg text-slate-800 dark:text-slate-200">
                    {__(`Nalefanay mail any amin'i ${user.email} ny code`)}
                </div>
                <div>
                    {showSpammed && <div className="text-sm text-gray-400">{__('Jereo ihany anaty spam raha tsy voaray afaka 1 minitra')}</div>}
                    {allowRetry && <button type="button" className="text-sm font-semibold cursor-pointer hover:underline" onClick={resendOTP}>
                        {__(`Raha tsy voaray ny mail dia potsero eto averinay alefa`)}
                    </button>}
                </div>
                <OTPInput/>
                {allowCall && <div>
                    {__(`Raha tsy mety voaray dia antsoy ny finday 034 96 545 54`)}
                </div>}
                {otpSubmitted.current && !otpPending && !otpState.success && <div className="text-red-500 text-sm">{__(`Diso ilay kaody nampidirinao`)}</div>}
                <button onClick={() => { otpSubmitted.current = true }} disabled={otpPending} className="mt-12 capitalize bg-slate-600 hover:bg-slate-500 transition duration-400 cursor-pointer dark:bg-zinc-600 font-semibold font-barlow text-lg dark:text-slate-200 text-white w-full py-3 shadow-lg disabled:opacity-50">{__(`'zay`)}</button>
                {showAlternative && <div className='border-t-1 dark:border-slate-500 pt-4 space-y-4 mt-6'>
                    <div className='font-semibold text-slate-700 text-center'>{__(`Fomba hafa`)} :</div>
                    <div className='flex justify-center gap-4'>
                        <SocialLogin/>
                    </div>
                </div>}
            </div>
        </form>
    }

    return <>
        <form className={`space-y-4 ${showPopup && 'transition blur-xs'}`} action={formAction}>
            <div className='text-center'>
                <Link href={`/`}><Image src={`/logo.webp`} width={1024} height={1024} className="h-12 w-12 mx-auto" alt={__(`Katolika, Eglizy en ligne`)} /></Link>
            </div>
            {context === 'parish_create' ? <div className='my-4 text-center text-slate-500 dark:text-slate-100'>
                <div className='text-lg'>
                    {__(`Voaray ny fangatahanao hampiditra paroasy vaovao.`)}
                </div>
                <div className='text-xl font-barlow font-bold'>
                    {__(`Hilazanay ianao rehefa ao fa,`)}
                </div>
                <div className='text-lg'>
                    {__(`Apetraho ny contact`)}
                </div>
            </div> : <div className='text-lg font-barlow font-bold text-center text-slate-500 my-4'>
                {__(`Apetraho ny contact ifanomezantsika vaovao`)} :
            </div>}
            <div className='md:flex space-x-8 space-y-4 md:space-y-0'>
                <div className='flex flex-1 focus:outline-2 focus:-outline-offset-2 focus:outline-slate-600 dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-slate-500 shadow-sm w-full bg-slate-300/10 py-2 px-4 hover:shadow-lg transition duration-400'>
                    <input type='email' name='email' required placeholder={__(`Email`)} autoFocus onChange={(e) => handleUserChange(e, 'email')} value={user.email} className='focus:outline-0 flex-1' onInvalid={handleInvalid} onBlur={handleFieldAbandon} />
                    <Mail className='inline-block text-slate-500' />
                </div>
            </div>
            <button type='submit' onClick={handleSubmitClick} disabled={pending} className='relative capitalize font-barlow text-lg font-semibold text-center w-full dark:bg-slate-200/30 py-2 bg-yellow-200 shadow-lg cursor-pointer hover:bg-yellow-100 dark:hover:bg-slate-500 transition duration-400 disabled:bg-gray-200'>
                {__(`'zay`)}
            </button>
            <Antibot />
            <hr/>
            <div className='text-center text-slate-500 dark:text-slate-100'>
                <button type="button" className='font-semibold hover:underline' onClick={()=>setShopPopup(true)}>{__(`Tsy manana email ve ?`)}</button>
            </div>
        </form>
        <div className={`absolute flex flex-col justify-center items-center top-0 left-0 bg-yellow-800/50 w-screen h-screen ${showPopup ? 'transition opacity-100' : 'transition opacity-0 hidden'}`}>
            <div className='flex items-start'>
                <div className='space-y-4 flex flex-col items-center'>
                    <SocialLogin/>
                </div>
                <button className='float-right ml-8 cursor-pointer text-slate-600 dark:text-slate-300 transition duration-400 hover:text-slate-500' type='button' onClick={()=>setShopPopup(false)}>
                    <CircleX size={36}/>
                </button>
            </div>
        </div>
    </>
}