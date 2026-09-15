'use client'

import gsap from 'gsap';
import { useTranslations } from "next-intl";
import { useForm } from "../form-context";

export default function OTPInput() {
    const __ = useTranslations()
    const { formData, setFormData } = useForm('otp-form', {
        otp: ''
    })

    const handleTextChange = (e: any) => {
        const value = e.target.value
        setFormData({
            otp: value
        })
    }

    return <div className="relative">
        <table className="min-w-full shadow dark:border-1 dark:border-white/15">
            <tbody>
                <tr className="divide-x text-3xl text-slate-600 dark:text-slate-50 font-barlow h-15 divide-gray-200 dark:divide-white/10">
                    <td className="w-1/6">{formData.otp[0] ?? <span className="text-gray-200">0</span>}</td>
                    <td className="w-1/6">{formData.otp[1] ?? <span className="text-gray-200">0</span>}</td>
                    <td className="w-1/6">{formData.otp[2] ?? <span className="text-gray-200">0</span>}</td>
                    <td className="w-1/6">{formData.otp[3] ?? <span className="text-gray-200">0</span>}</td>
                    <td className="w-1/6">{formData.otp[4] ?? <span className="text-gray-200">0</span>}</td>
                    <td className="w-1/6">{formData.otp[5] ?? <span className="text-gray-200">0</span>}</td>
                </tr>
            </tbody>
        </table>
        <input name="otp" required type="text" autoFocus onChange={handleTextChange} className="focus:outline-0 w-full text-6xl absolute top-0 left-0 text-transparent" maxLength={6} />
    </div>

}