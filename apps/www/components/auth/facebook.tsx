'use client'

import { useTranslations } from "next-intl";
import { authClient } from "@/lib/auth-client";
import { useCallback } from "react";
import { session } from "@/lib/database";

export default function FacebookSignInButton() {

    const __ = useTranslations()

    const signIn = useCallback(async()=>{
        const { redirect } = await session('redirect')
        authClient.signIn.social({
            provider: 'facebook',
            callbackURL: redirect ?? '/'
        })
    }, [])

    return <button onClick={signIn} type="button" className="cursor-pointer bg-[#4269B2] text-white hover:bg-[#5882d0] transition font-semibold w-76 text-center font-barlow rounded-lg shadow px-4 flex justify-center gap-3 items-center">
        <div>
            <i className="font-kto text-xl kto-facebook inline-block pt-2"></i>
        </div>
        <div>{__(`Sokafy @ Facebook`)}</div>
    </button>
}
