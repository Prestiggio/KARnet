import directus from "@/lib/directus";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

export default async function TicketsPage() {
    const [serversession, __] = await Promise.all([
        auth.api.getSession({
            headers: await headers()
        }),
        getTranslations()
    ])

    const tickets: any[] = await directus.request(()=>({
        path: `/report/tickets/${serversession?.user.id}`,
    }))

    return <div className="prose dark:prose-invert">
        <h1>{__(`Fangatahana misokatra`)}</h1>
        <table>
            <thead>
                <tr>
                    <th>{__(`Fangatahana`)}</th>
                    <th>{__(`Dingana efa vita`)}</th>
                </tr>
            </thead>
            <tbody>
                {tickets.filter(t=>t.subject==='parish-draft').map((ticket)=><tr key={ticket.id}>
                    <td><Link href={`/parishes/create/${ticket.token}`}>{ticket.content.name}</Link></td>
                    <td>{__(ticket.status)}</td>
                </tr>)}
            </tbody>
        </table>
    </div>
}