'use client'

import { authClient } from "@/lib/auth-client"
import { session } from "@/lib/database"
import { useTranslations } from "next-intl"
import { useCallback } from "react"

export default function AppleSignInButton() {

    const __ = useTranslations()

    const signIn = useCallback(async()=>{
        const { redirect } = await session('redirect')
        authClient.signIn.social({
            provider: 'apple',
            callbackURL: redirect ?? '/'
        })
    }, [])

    return <button onClick={signIn} type="button" className="cursor-pointer min-h-10 bg-black text-white hover:bg-gray-900 transition font-semibold w-76 text-center font-sfpro rounded-lg shadow px-4 flex justify-center gap-3 items-center">
        <div>
            <i className="font-kto kto-apple inline-block"></i>
        </div>
        <div>{__(`Sokafy @ Apple`)}</div>
    </button>
}