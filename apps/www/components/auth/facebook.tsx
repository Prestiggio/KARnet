'use client'

declare const FB: { init: (conf: any) => void; login: (cb: (response: any) => void) => void; api: (path: string, fields: any, cb: (response: any) => void) => void }

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

    const loginWithFacebook = () => {
        FB.login(function (response) {
            if (response.authResponse) {
                console.log("Welcome!  Fetching your information.... ");
                // After successful login, we can fetch the user's information
                FB.api("/me", { fields: "name, email" }, function (response) {
                    document.getElementById("profile").innerHTML =
                        "Good to see you, " +
                        response.name +
                        ". i see your email address is " +
                        response.email;
                });
            } else {
                console.log("User cancelled login or did not fully authorize.");
            }
        });
    }

    return <div>
        <p id="profile"></p>
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