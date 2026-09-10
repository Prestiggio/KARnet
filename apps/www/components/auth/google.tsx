'use client'

import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignInButton() {
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (buttonRef.current) {
            authClient.oneTap({
                button: {
                    container: buttonRef.current,
                    config: {
                        type: 'standard',
                        theme: "outline"
                    }
                }
            });
            authClient.oneTap()
        }
    }, []);

    return <div ref={buttonRef}></div>;
}