import { FirstVisitProvider } from "@/components/parish/first-visit";
import { getParish } from "@/lib/entities/parishes";
import { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getAuthenticatedUserInfo, getParishType, hasParishAttached } from "@/lib/entities/user";

export default async function ParishLayout({children, params}: {children: ReactNode, params: Promise<{id: string}>}) {
    const [{ id }, serversession] = await Promise.all([
        params,
        auth.api.getSession({
            headers: await headers()
        })
    ])

    const [parish] = await Promise.all([
        getParish(id),
    ])

    const [type, parish_attached] = await Promise.all([
        getParishType(serversession?.user, parish.id),
        hasParishAttached(serversession?.user)
    ])

    return <FirstVisitProvider parishType={type} parishAttached={parish_attached}>
        {children}
    </FirstVisitProvider>
}