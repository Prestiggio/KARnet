import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from "lucide-react";
import LogoutButton from "@/components/auth/logout";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function Header() {

    const [serversession, __] = await Promise.all([
        auth.api.getSession({
            headers: await headers()
        }),
        getTranslations()
    ])

    if(!serversession?.session) {
        return null
    }

    return <div className="hidden md:flex justify-center fixed top-0 left-0 z-1 pb-8 w-full">
        <div className="min-w-4xl bg-pink-800 text-white shadow-xl rounded-b-xl px-4">
            <div className="flex space-x-4 items-center h-full float-right font-barlow">
                <div className="mx-8 bg-white/16 h-full flex items-center">
                    <Link href={`/account/tickets`} className="flex flex-col justify-center px-4 border-transparent h-full transition duration-400 border-b-2 hover:border-white/70">{__(`Fangatahana`)}</Link>
                </div>
                <div className="py-1 flex items-center gap-2">
                    <Avatar className="h-4 w-4">
                        <AvatarImage
                            src={serversession?.user.image ?? undefined}
                            alt={serversession?.user.name}
                            referrerPolicy="no-referrer"
                        />
                        <AvatarFallback><UserCircle /></AvatarFallback>
                    </Avatar>
                    <div>
                        {serversession?.user.name}
                    </div>
                    <LogoutButton size={18}/>
                </div>
            </div>
        </div>
    </div>
}