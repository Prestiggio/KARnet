import { auth } from "@/lib/auth";
import { headers } from 'next/headers';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle } from "lucide-react";
import LogoutButton from "@/components/auth/logout";

export default async function Header() {

    const serversession = await auth.api.getSession({
        headers: await headers()
    })

    if(!serversession?.session) {
        return null
    }

    return <div className="hidden md:flex justify-center fixed top-0 left-0 z-1 pb-8 w-full">
        <div className="min-w-4xl bg-pink-800 text-white shadow-xl rounded-b-xl px-4 py-1">
            <div className="flex space-x-4 items-center float-right">
                <Avatar className="h-4 w-4">
                    <AvatarImage
                        src={serversession?.user.image ?? undefined}
                        alt={serversession?.user.name}
                        referrerPolicy="no-referrer"
                    />
                    <AvatarFallback><UserCircle /></AvatarFallback>
                </Avatar>
                <div className="font-barlow">
                    {serversession?.user.name}
                </div>
                <LogoutButton size={18}/>
            </div>
        </div>
    </div>
}