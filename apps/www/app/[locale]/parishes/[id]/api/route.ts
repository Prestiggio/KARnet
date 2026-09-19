import { auth } from "@/lib/auth";
import directus from "@/lib/directus";
import { getParishType, setParishType } from "@/lib/entities/user";
import { createItem } from "@directus/sdk";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest, {params}: {params: Promise<{id:string}>})=>{
    const [{id}, data, serversession] = await Promise.all([
        params,
        req.json(),
        auth.api.getSession({
            headers: await headers()
        })
    ])
    const type = await getParishType(serversession?.user, id)
    if(!type && data.type !== 'visit') {
        const subject = data.type === 'attach' ? 'parish-attach' : 'parish-ancestor'
        await directus.request(createItem('tickets', {
            token: serversession?.user.id,
            subject,
            content: { data, id, author: serversession }
        }))
    }
    await setParishType(serversession?.user, id, data.type)
    return NextResponse.json({
        success: true
    })
}