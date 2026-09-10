import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { rateLimit, requestIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
    const limit = rateLimit(requestIp(request))
    if (!limit.allowed) {
        return NextResponse.json(
            { error: 'Too many requests' },
            { status: 429, headers: { 'Retry-After': Math.ceil(limit.retryAfterMs / 1000).toString() } }
        )
    }

    const token = randomBytes(32).toString('base64url')
    return NextResponse.json({
        token
    })
}