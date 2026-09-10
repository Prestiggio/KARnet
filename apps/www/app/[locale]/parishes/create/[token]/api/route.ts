import { NextRequest, NextResponse } from "next/server";
import directus from "@/lib/directus";
import directusLocalMailer from "@/lib/directus-local-mailer";
import { render } from '@react-email/render';
import CreateParishMail from "@/emails/parishes/create";

export async function POST(req: NextRequest) {
    const data = await req.json()

    const html = await render(CreateParishMail(data))

    const directusInstance = process.env.NODE_ENV == 'development' ? directusLocalMailer : directus

    const result = await directusInstance.request(() => ({
        path: '/notifier/mail',
        method: 'POST',
        body: JSON.stringify({
            to: process.env.ADMIN_EMAIL,
            subject: 'Nouvelle paroisse ' + data.name,
            html,
            text: JSON.stringify(data),
        })
    }))

    return NextResponse.json(result)
}