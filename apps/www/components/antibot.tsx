'use client'

declare const grecaptcha: { enterprise : { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> }}

import { useCallback, useRef } from "react"
import Script from "next/script"

export default function Antibot() {
    const antibot = useRef<HTMLInputElement>(null)

    const setToken = useCallback(()=>{
        grecaptcha.enterprise.ready(function() {
            grecaptcha.enterprise.execute(process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA!, {action: 'submit'}).then(async function(recaptcha_token:any) {
                if (antibot.current) antibot.current.value = recaptcha_token
            });
        });
    }, [])

    return <>
        <Script src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA}`} onLoad={setToken}/>
        <input ref={antibot} type='hidden' name='antibot'/>
    </>
}