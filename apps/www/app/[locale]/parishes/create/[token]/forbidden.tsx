import { getTranslations } from "next-intl/server"
import { Ban } from "lucide-react"

export default async function Forbidden() {
    const __ = await getTranslations()

    return <div className="grow flex flex-col justify-center items-center text-3xl uppercase text-red-500">
        <Ban size={80}/>
        {__(`Tsy azonao idirana io`)} !
    </div>
}