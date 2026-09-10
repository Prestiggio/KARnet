const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 3
const BLOCK_MS = 24 * 60 * 60 * 1000

type Entry = {
    timestamps: number[]
    blockedUntil?: number
}

const store = new Map<string, Entry>()

export function rateLimit(key: string): { allowed: true } | { allowed: false; retryAfterMs: number } {
    const now = Date.now()
    const entry = store.get(key) ?? { timestamps: [] }

    if (entry.blockedUntil && entry.blockedUntil > now) {
        return { allowed: false, retryAfterMs: entry.blockedUntil - now }
    }

    entry.timestamps = entry.timestamps.filter(t => now - t < WINDOW_MS)
    entry.timestamps.push(now)

    if (entry.timestamps.length > MAX_REQUESTS) {
        entry.blockedUntil = now + BLOCK_MS
        entry.timestamps = []
        store.set(key, entry)
        return { allowed: false, retryAfterMs: BLOCK_MS }
    }

    store.set(key, entry)
    return { allowed: true }
}

export function requestIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    return request.headers.get('x-real-ip') ?? 'unknown'
}
