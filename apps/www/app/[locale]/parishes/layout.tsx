import Footer from "@/components/footer";
import { ReactNode } from "react";

export default async function ParishesLayout({children}: {children: ReactNode}) {
    return <div className="flex flex-col min-h-dvh">
        <div className="grow flex flex-col bg-yellow-300/10 dark:bg-zinc-700">
            {children}
        </div>
        <Footer/>
    </div>
}