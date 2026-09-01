import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const response = NextResponse.redirect(new URL('/login', req.url));

    response.cookies.set('organization_backend', id, {
        maxAge: 86400 * 30,
        path: '/',
        secure: true,
    });

    return response;
}
