import { Pool, Result } from "pg";

export async function findUserByEmail(email: string) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    const res: Result = await pool.query(`SELECT * FROM public.email_leads WHERE email = $1`, [email])
    return res.rows[0]
}