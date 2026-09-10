import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from "lucide-react";
import LogoutButton from "@/components/auth/logout";

export default async function AuthMenu() {
    const serversession = await auth.api.getSession({
        headers: await headers()
    })

    if(!serversession?.session) {
        return null
    }

    return <div className="md:hidden bg-pink-600 text-white px-4 py-8">
        <div className="flex items-center space-x-4">
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
    </div>
}