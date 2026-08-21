'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

type MenuContextValue = {
    closed: boolean
    toggle: () => void
    close: () => void
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: ReactNode }) {
    const [closed, setClosed] = useState(true)

    return (
        <MenuContext.Provider
            value={{
                closed,
                toggle: () => setClosed(c => !c),
                close: () => setClosed(true),
            }}
        >
            {children}
        </MenuContext.Provider>
    )
}

export function useMenu() {
    const ctx = useContext(MenuContext)
    if (!ctx) throw new Error('useMenu must be used within a MenuProvider')
    return ctx
}
