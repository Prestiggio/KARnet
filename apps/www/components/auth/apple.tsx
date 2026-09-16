'use client'

import { LG_COUNTRIES } from "@/lib/utils"
import { useLocale } from "next-intl"
import Script from "next/script"

export default function AppleSignInButton() {

    const locale = useLocale() as 'fr'|'en'|'mg'
    let locale_t = locale === 'mg' ? 'fr' : locale

    return <>
        <div id="appleid-signin" data-color="black" data-border="true" data-type="sign in" className="h-12"></div>
        <Script src={`https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/${LG_COUNTRIES[locale_t]}/appleid.auth.js`}/>
    </>
}