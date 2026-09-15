import { NextRequest, NextResponse } from "next/server";
import { withRateLimiter } from "./withRateLimiter";
import { withRecaptcha } from "./withRecaptcha";
import { getSessionCookie } from "better-auth/cookies";
import { randomBytes } from 'node:crypto'

export function withPendingSubmission<Args extends unknown[]>(
    handler: (req: NextRequest, token: string, ...args: Args) => Response | Promise<Response>
) {
    return withRateLimiter(withRecaptcha(async (req: NextRequest, ...args: Args) => {
        const sessionCookie = getSessionCookie(req)

        /**
         * This token identifies a form submission.
         * If not logged in, this token is used on frontend to save the request for later submission
         * If logged in, it can be used to track the status of a request
         */
        const token = randomBytes(32).toString('base64url')

        if(sessionCookie) {
            return handler(req, token, ...args)
        }

        return NextResponse.json({
            token
        })
    }))
}