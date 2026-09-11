'use client'

import { useState } from "react"
import gsap from 'gsap';
import { useTranslations } from "next-intl";

export default function OTPInput({ onChange }: { onChange?: (value: string) => void }) {
    const __ = useTranslations()
    const [otp, setOtp] = useState('')

    const handleTextChange = (e: any) => {
        const value = e.target.value
        setOtp(value)
        onChange?.(value)
    }

    return <div className="relative">
        <table className="min-w-full shadow dark:border-1 dark:border-white/15">
            <tbody>
                <tr className="divide-x text-3xl text-slate-600 dark:text-slate-50 font-barlow h-15 divide-gray-200 dark:divide-white/10">
                    <td className="w-1/6">{otp[0] ?? 0}</td>
                    <td className="w-1/6">{otp[1] ?? 0}</td>
                    <td className="w-1/6">{otp[2] ?? 0}</td>
                    <td className="w-1/6">{otp[3] ?? 0}</td>
                    <td className="w-1/6">{otp[4] ?? 0}</td>
                    <td className="w-1/6">{otp[5] ?? 0}</td>
                </tr>
            </tbody>
        </table>
        <input name="otp" required type="text" autoFocus onChange={handleTextChange} className="focus:outline-0 w-full text-6xl absolute top-0 left-0 text-transparent" maxLength={6} />
    </div>

}