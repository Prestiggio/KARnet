import { Pool, Result } from "pg";
import directus from "@/lib/directus";
import { readUsers } from "@directus/sdk";

export async function findUserByEmail(email: string) {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    const res: Result = await pool.query(`SELECT * FROM public.email_leads WHERE email = $1`, [email])
    return res.rows[0]
}

export async function getAuthenticatedUserInfo(user: any) {
    let [me,] = await directus.request(readUsers({
        filter: {
            email: {
                _eq: user.email
            }
        }
    }))

    if(!me) {
        //create ticket to admin for creating the user
        me = {
            ...user,
            id: null,
        }
    }

    return me
}

export async function getParishType(user: {id?: string | null} | null | undefined, parish_id: string) {
    if (!user?.id) return null

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    const res: Result = await pool.query(`SELECT type FROM public.user_parishes WHERE user_id = $1 AND parish_id = $2`, [user.id, parish_id])
    const {type = null} = res.rows[0] ?? {}
    return type
}

export async function hasParishAttached(user: {id?: string | null} | null | undefined) {
    if (!user?.id) return null

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    const res: Result = await pool.query(`SELECT 1 FROM public.user_parishes WHERE user_id = $1 AND type = $2`, [user.id, 'attach'])
    const {attached = false} = res.rows[0] ?? {}
    return attached
}

export async function setParishType(user: any, parish_id: string, type: 'attach' | 'visit' | 'ancestor_attached') {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL
    })
    return await pool.query(`INSERT INTO public.user_parishes (user_id, parish_id, type) VALUES ($1, $2, $3)
        ON CONFLICT(user_id, parish_id) DO NOTHING`, [
        user.id,
        parish_id,
        type
    ])
}
