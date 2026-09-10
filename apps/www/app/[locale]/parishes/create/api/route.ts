import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { withRateLimiter } from '@/lib/withRateLimiter'
import { withRecaptcha } from '@/lib/withRecaptcha'

export const POST = withRateLimiter(withRecaptcha(async () => {
    const token = randomBytes(32).toString('base64url')
    return NextResponse.json({ token })
}))