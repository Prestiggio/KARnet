'use client'

import { LogOutIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {

    const logout = ()=>{
        authClient.signOut()
    }

    return <button type="button" onClick={logout}><LogOutIcon/></button>
}