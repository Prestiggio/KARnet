'use client'

declare const FB: {
    init: (config: {
        appId?: string;
        xfbml: boolean;
        version: string;
    }) => void;
}

declare global {
    interface Window {
        fbAsyncInit?: () => void;
    }
}

import Script from "next/script";
import { useEffect } from "react"

export default function FacebookSignInButton() {

    useEffect(() => {
        window.fbAsyncInit = function () {
            FB.init({
                appId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
                xfbml: true,
                version: "v26.0",
            });
        };
    }, [])

    return <div>
        <div id="spinner">
            <div
            className="fb-login-button"
            data-max-rows="1"
            data-size="large"
            data-button-type="continue_with"
            data-use-continue-as="true"
            ></div>
        </div>
        <Script id="facebook-jssdk" src="https://connect.facebook.net/en_US/sdk.js"/>
    </div>
}
