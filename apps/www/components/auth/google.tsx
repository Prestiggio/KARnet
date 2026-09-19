'use client'

import { useCallback, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { session } from "@/lib/database";

export default function GoogleSignInButton() {
    const buttonRef = useRef<HTMLDivElement>(null);

    const setup = useCallback(async()=>{
        const container = buttonRef.current;
        if (!container) return;

        const { redirect } = await session('redirect')
        const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        authClient.oneTap({
            button: {
                container,
                config: {
                    type: 'standard',
                    theme: isDark ? "filled_black" : "outline"
                }
            },
            callbackURL: redirect ?? '/'
        });
    }, [])

    useEffect(() => {
        if (buttonRef.current) {
            void setup()
        }
    }, [setup]);

    return <div ref={buttonRef}></div>;
}
