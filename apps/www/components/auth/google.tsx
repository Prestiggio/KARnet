'use client'

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInButton() {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (buttonRef.current) {
            const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            authClient.oneTap({
                button: {
                    container: buttonRef.current,
                    config: {
                        type: 'standard',
                        theme: isDark ? "filled_black" : "outline"
                    }
                }
            });
        }
    }, []);

    return <div ref={buttonRef}></div>;
}