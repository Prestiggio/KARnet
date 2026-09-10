import { Pool } from "pg";

const pool = new Pool({
    connectionString: `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
})

export async function findUserByEmail(email: string) {
    const res = await pool.query('SELECT NOW()')
    await pool.end()
    return {
        fullname: 'rakoto'
    }
}