import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const newLang = await req.json()

    const response = NextResponse.json({lang: 'set'})

    response.cookies.set('lang', newLang.lang)

    return response
}