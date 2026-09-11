'use server'

import { Pool, Result } from "pg";
import { auth } from "@/lib/auth";

export default async function OTPLogin(formData: FormData) {

    const email = formData.get('email') as string
    const fullname = formData.get('fullname') as string
    const locale = formData.get('locale') as string
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    const values = [email, fullname, locale]
    const resexists: Result = await pool.query({
        text: `SELECT EXISTS (
                SELECT 1 FROM public.email_leads WHERE email = $1
            )`,
        values: [email]
    })

    const [{ exists }] = resexists.rows

    if (!exists) {
        await pool.query(`
            INSERT INTO public.email_leads (email, fullname, locale) VALUES ($1, $2, $3)
            ON CONFLICT (email)
            DO UPDATE SET fullname = $2, locale = $3`, values)
    }
    else {
        await pool.query(`UPDATE public.email_leads SET fullname = $2, locale = $3 WHERE email = $1`, values)
    }

    await auth.api.sendVerificationOTP({
        body: {
            email,
            type: 'sign-in'
        }
    })
}