import { NextRequest, NextResponse } from 'next/server'

const RECAPTCHA_MIN_SCORE = 0.9

export function withRecaptcha<Args extends unknown[]>(
    handler: (req: NextRequest, ...args: Args) => Response | Promise<Response>
) {
    return async (req: NextRequest, ...args: Args) => {
        let antibot = null
        try {
            const formData = await req.clone().formData()
            antibot = formData.get('antibot')
        }
        catch(e) {
            const jsonData = await req.clone().json()
            antibot = jsonData.antibot
        }
        
        if(!antibot) {
            const jsonData = await req.clone().json()
            antibot = jsonData.antibot
        }

        if(!antibot) {
            return NextResponse.json(
                { error: 'reCAPTCHA verification failed, please try again' },
                { status: 403 }
            )
        }

        const fdata = new URLSearchParams()
        fdata.append('secret', process.env.RECAPTCHA_SERVER_KEY as string)
        fdata.append('response', antibot ? antibot.toString() : '')

        const googleResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            body: fdata,
            cache: 'no-store'
        })

        const google = await googleResponse.json()

        if (!google.success || google.score < RECAPTCHA_MIN_SCORE) {
            return NextResponse.json(
                { error: 'reCAPTCHA verification failed, please try again' },
                { status: 403 }
            )
        }

        return handler(req, ...args)
    }
}
