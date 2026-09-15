import { NextRequest, NextResponse } from 'next/server'
import { withPendingSubmission } from '@/lib/withPendingSubmission'
import { render } from '@react-email/render';
import CreateParishMail from "@/emails/parishes/create";
import mailer from "@/lib/mailer";
import { auth } from "@/lib/auth";
import directus from '@/lib/directus';
import { createItem } from '@directus/sdk';

export const POST = withPendingSubmission(async (request: NextRequest, token: string) => {

    let result: any = {
        token
    }

    const [serversession, data] = await Promise.all([
        auth.api.getSession({
            headers: request.headers
        }),
        request.json()
    ])

    try {
        const [
            html,
            ticket
        ] = await Promise.all([
            render(CreateParishMail({...data, author: serversession})),
            await directus.request(createItem('tickets', {
                token: data.token ?? token,
                subject: 'parish-draft',
                content: { ...data, author: serversession}
            }))
        ])
        const mailed = await mailer({
            to: process.env.ADMIN_EMAIL!,
            subject: 'Nouvelle paroisse ' + data.name,
            html,
            text: JSON.stringify({ token, ...data, author: serversession})
        })
        if(mailed) {
            result.sent = true
        }
    }
    catch(e) {
        result.error = e
    }
    
    return NextResponse.json(result)
})