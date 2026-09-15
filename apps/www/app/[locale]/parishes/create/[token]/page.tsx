import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { getTranslations } from "next-intl/server";

export default async function PendingCreatePage({params}: {params: Promise<{token:string}>}) {
    const [__, {token}] = await Promise.all([
        getTranslations(),
        params
    ])

    const [ticket] = await directus.request(readItems('tickets', {
        fields: ['status', 'token', 'reviews.*'],
        filter: {
            token: {
                _eq: token
            }
        },
        limit: 1
    }))

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