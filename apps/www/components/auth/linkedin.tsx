'use client'

import { session } from "@/lib/database"
import { useTranslations } from "next-intl"
import { useCallback } from "react"
import { authClient } from "@/lib/auth-client"

export default function LinkedingSignInButton() {
    const __ = useTranslations()

    const signIn = useCallback(async()=>{
        const { redirect } = await session('redirect')
        authClient.signIn.social({
            provider: 'linkedin',
            callbackURL: redirect ?? '/'
        })
    }, [])

    return <button onClick={signIn} className="cursor-pointer text-lg bg-white hover:bg-sky-50 transition font-semibold w-76 text-center font-barlow py-2 rounded-lg shadow text-[#0077B5] flex justify-center gap-3 items-center" type="button">
        <div>
            <i className="font-kto text-xl kto-linkedin float-left ml-4"></i>
        </div>
        <div>
            {__(`Sokafy @ Linkedin`)}
        </div>
    </button>
}