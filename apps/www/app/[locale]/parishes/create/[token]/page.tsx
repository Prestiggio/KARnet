import directus from "@/lib/directus";
import { readItems } from "@directus/sdk";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { forbidden, notFound } from "next/navigation";
import ShareButton from "@/components/ui/share-button";
import ParishForm from "@/components/parish/form";

export default async function PendingCreatePage({params}: {params: Promise<{locale:string, token:string}>}) {
    const [__, {locale, token}, serversession] = await Promise.all([
        getTranslations(),
        params,
        auth.api.getSession({
            headers: await headers()
        })
    ])

    const headersList = await headers();
    const host = headersList.get('x-forwarded-host') ?? headersList.get('host') ?? 'localhost:3000';
    const protocol = headersList.get('x-forwarded-proto') ?? (host.includes('localhost') ? 'http' : 'https');
    const absolutePageUrl = `${protocol}://${host}/${locale}/parishes/create/${token}`;

    const [ticket] = await directus.request(readItems('tickets', {
        fields: ['status', 'token', 'content'],
        filter: {
            token: {
                _eq: token
            }
        },
        limit: 1
    }))

    if(ticket && ticket?.content?.author?.user?.id !== serversession?.user.id) {
        forbidden()
    }

    if(!ticket) {
        const dioceses = await directus.request(readItems('organizations', {
            fields: ['id', 'name'],
            filter: {
                type: {
                    slug: {
                        _eq: 'diosezy'
                    }
                }
            }
        }))

        return <div className="flex flex-col justify-center grow items-center">
            <h2 className="text-xl font-barlow font-semibold">{__(`Tena ito ny paroasy tianao ampidirina ?`)}</h2>
            <ParishForm dioceses={dioceses} token={token}/>
        </div>
    }

    return <div className="flex flex-col justify-center grow items-center">
        <div className="text-slate-600 md:min-w-3xl">
            <table className="w-full">
                <tbody className="divide-y">
                    <tr className="divide-x">
                        <th className="p-3">{__(`Ticket Nº`)}</th>
                        <td className="p-3"><p className="text-nowrap overflow-hidden text-ellipsis max-w-60">{ticket?.token}</p></td>
                    </tr>
                    <tr className="divide-x">
                        <th className="p-3 capitalize">{__(`status`)}</th>
                        <td className="p-3 capitalize">{__(ticket?.status)}</td>
                    </tr>
                </tbody>
            </table>
            <div className="w-full flex justify-center">
                <ShareButton title={`katolika.net`} text={`Ticket nanampiana paroasy vaovao ao amin'i katolika.net: ${ticket?.content?.name}`} url={absolutePageUrl} />
            </div>
        </div>
    </div>

}
