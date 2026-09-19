import Footer from "@/components/footer";
import Header from "@/components/header";
import { ReactNode } from "react";

export default async function AccountLayout({children}: {children: ReactNode}) {
    return <>
        <Header/>
        <div className="grow flex flex-col mt-18 md:mt-0 md:justify-center items-center">
            {children}
        </div>
        <Footer/>
    </>
}