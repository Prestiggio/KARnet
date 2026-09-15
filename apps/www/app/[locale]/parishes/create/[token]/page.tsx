import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { forbidden, notFound } from "next/navigation";

export default async function PendingCreatePage({params}: {params: Promise<{token:string}>}) {
    const [__, {token}, serversession] = await Promise.all([
        getTranslations(),
        params,
        auth.api.getSession({
            headers: await headers()
        })
    ])

    const [ticket] = await directus.request(readItems('tickets', {
        fields: ['status', 'token', 'content'],
        filter: {
            token: {
                _eq: token
            }
        },
        limit: 1
    }))

    if(!ticket) {
        notFound()
    }

    if(ticket?.content?.author?.user?.id !== serversession?.user.id) {
        forbidden()
    }

    return <div className="flex flex-col justify-center grow items-center">
        <div className="text-slate-600">
            <table className="w-full">
                <tbody>
                    <tr>
                        <th>Ticket Nº</th>
                        <td><p className="text-nowrap overflow-hidden text-ellipsis max-w-30">{ticket?.token}</p></td>
                    </tr>
                    <tr>
                        <th>Statut</th>
                        <td>{__(ticket?.status)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

}
