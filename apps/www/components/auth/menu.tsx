import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from "lucide-react";
import LogoutButton from "@/components/auth/logout";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function AuthMenu() {
    const [serversession, __] = await Promise.all([
        auth.api.getSession({
            headers: await headers()
        }),
        getTranslations()
    ])

    if(!serversession?.session) {
        return null
    }

    return <div className="md:hidden bg-pink-800 text-white py-4 space-y-4">
        <div className="flex items-center px-4 space-x-4">
            <Avatar className="h-9 w-9">
                <AvatarImage
                    src={serversession?.user.image ?? undefined}
                    alt={serversession?.user.name}
                    referrerPolicy="no-referrer"
                />
                <AvatarFallback><UserCircle /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="text-lg/4 font-barlow">
                    {serversession?.user.name}
                </div>
                <div className="text-sm text-slate-200">
                    {serversession?.user.email}
                </div>
            </div>
            <LogoutButton/>
        </div>
        <div className="bg-white/16 w-full h-full flex items-center">
            <Link href={`/account/tickets`} className="flex flex-col justify-center px-4 border-transparent min-h-12 transition duration-400 border-b-2 hover:border-white/70">{__(`Fangatahana`)}</Link>
        </div>
    </div>
}