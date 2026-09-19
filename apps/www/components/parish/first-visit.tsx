'use client'

import { XCircle } from "lucide-react";
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

type FirstVisit = {
    popupVisible: boolean;
    setPopupVisible: (v: boolean) => void;
    attached: boolean;
    setAttached: (a: boolean) => void;
}

export const FirstVisitContext = createContext<FirstVisit | null>(null)

export function FirstVisitProvider({ children, parishType, parishAttached }: { children: ReactNode, parishType: string|null, parishAttached: boolean }) {
    const [popupVisible, setPopupVisible] = useState(false)
    const [attached, setAttached] = useState(parishAttached)

    useEffect(()=>{
        if(parishType===null) {
            const timer = setTimeout(() => {
                setPopupVisible(true)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [parishType])

    return <FirstVisitContext.Provider value={{
        popupVisible,
        setPopupVisible,
        attached,
        setAttached
    }}>
        {children}
    </FirstVisitContext.Provider>
}

export const useFirstVisit = () => {
    const ctx = useContext(FirstVisitContext)
    if (!ctx) throw new Error('useFirstVisit must be used within a FirstVisitProvider')
    return ctx
}

export function FirstVisitPopup({id}: {id: string}) {
    const {popupVisible, setPopupVisible, attached} = useFirstVisit()

    const setParishType = async (type:string)=>{
        fetch(`/parishes/${id}/api`, {
            method: 'PUT',
            body: JSON.stringify({
                type
            })
        })
        setPopupVisible(false)
    }

    return <div className={`${!popupVisible && 'hidden'} absolute w-screen h-screen top-0 left-0 bg-yellow-400/10 flex flex-col justify-center items-center`}>
        <div className="prose dark:prose-invert p-4 bg-slate-600/10 rounded-xl shadow-lg">
            <div className="bg-white/90 p-8 rounded-xl text-slate-500 relative">
                <button className="absolute right-0 top-0 p-2 hover:text-gray-400 cursor-pointer" type="button" onClick={()=>setPopupVisible(false)}>
                    <XCircle size={20} />
                </button>
                <h3 className="mt-0 text-slate-700 text-center">Kristianina ao angaha ianao ?</h3>
                <div className="flex gap-4 justify-between font-barlow">
                    {attached && <button onClick={()=>setParishType('attach')} type="button" className={`cursor-pointer transition duration-300 hover:shadow-lg px-4 py-2 rounded-lg`}>Eny</button>}
                    <button onClick={()=>setParishType('visit')} type="button" className={`cursor-pointer transition duration-300 hover:shadow-lg px-4 py-2 rounded-lg`}>Vahiny / Mandalo</button>
                    <button onClick={()=>setParishType('ancestor_attached')} type="button" className={`cursor-pointer transition duration-300 hover:shadow-lg px-4 py-2 rounded-lg`}>Zanaka am-pielezana</button>
                </div>
            </div>
        </div>
    </div>
}