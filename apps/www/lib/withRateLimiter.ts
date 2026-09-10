import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export function withRateLimiter<Args extends unknown[]>(
    handler: (req: NextRequest, ...args: Args) => Response | Promise<Response>
) {
    return async (req: NextRequest, ...args: Args) => {
        const limit = rateLimit(requestIp(req))
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Too many requests' },
                { status: 429, headers: { 'Retry-After': Math.ceil(limit.retryAfterMs / 1000).toString() } }
            )
        }

        return handler(req, ...args)
    }
}
