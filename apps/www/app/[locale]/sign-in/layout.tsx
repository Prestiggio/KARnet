import Footer from "@/components/footer";
import { ReactNode } from "react";

export default async function LoginLayout({children}: {children: ReactNode}) {
    return <div className="flex flex-col min-h-dvh">
        <div className="grow flex flex-col justify-center bg-yellow-300/10 dark:bg-zinc-700">
            <div className="w-full md:w-auto md:min-w-xl px-4 md:px-0 mx-auto">
                {children}
            </div>
        </div>
        <Footer/>
    </div>
}