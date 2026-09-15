'use client'

import { LogOutIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@/i18n/navigation";

export default function LogoutButton({size}:{size?: number}) {

    const router = useRouter()

    const logout = async ()=>{
        await authClient.signOut()
        router.push('/')
    }

    return <button type="button" className="cursor-pointer hover:text-yellow-200" onClick={logout}><LogOutIcon size={size ?? 32}/></button>
}