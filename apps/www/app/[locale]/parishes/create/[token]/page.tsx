import { auth } from "@/lib/auth";
import { headers } from 'next/headers';

export default async function PendingCreatePage() {
    const serversession = await auth.api.getSession({
        headers: await headers()
    })

    return <div>Ato zany le izy {JSON.stringify(serversession)}</div>
}