import { NextRequest, NextResponse } from "next/server";
import { render } from '@react-email/render';
import CreateParishMail from "@/emails/parishes/create";
import mailer from "@/lib/mailer";

export async function POST(req: NextRequest) {
    const data = await req.json()

    const html = await render(CreateParishMail(data))

    const result = await mailer({
        to: process.env.ADMIN_EMAIL!,
        subject: 'Nouvelle paroisse ' + data.name,
        html,
        text: JSON.stringify(data)
    })

    return NextResponse.json(result)
}