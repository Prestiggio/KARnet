import { redirect } from 'next/navigation';
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { getSessionCookie } from 'better-auth/cookies';

export function withoutAuth<T>(handler: (req: NextRequest) => Promise<T>) {
    return async (req: NextRequest) => {
        
        const serversession = await auth.api.getSession({
            headers: await headers()
        })

        if(serversession) {
            return redirect(serversession.user.home_uri ?? '/')
        }

        return handler(req);
    }
}