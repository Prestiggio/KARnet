'use client'

import { Link } from '@/i18n/navigation'
import { useMenu } from './menu-context'
import type { ComponentProps } from 'react'

export default function MenuNavLink(props: ComponentProps<typeof Link>) {
    const { close } = useMenu()

    return <Link {...props} onClick={close} />
}
