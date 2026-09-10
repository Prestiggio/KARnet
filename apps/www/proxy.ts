import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { match } from "next/dist/compiled/path-to-regexp";

const intlMiddleware = createMiddleware(routing);

export const config = {
  matcher: [
    '/parishes/create/:token((?!api$).+)+',
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ]
};

// Next.js statically parses `config` above, so it must stay a literal object
// (no spreads/identifiers) — protected routes are every matcher entry except
// the trailing catch-all.
const protectedMatchers = config.matcher.slice(0, -1).map(pattern =>
  match(pattern, { decode: decodeURIComponent })
);

const localePrefix = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

function isProtected(pathname: string) {
  const path = pathname.replace(localePrefix, '') || '/';
  return protectedMatchers.some(matcher => matcher(path) !== false);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isProtected(request.nextUrl.pathname)) {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      const matcher = match('/parishes/create/:token', { decode: decodeURIComponent })
      if(matcher(pathname) !== false)
        url.searchParams.set("context", "parish_create");
      return NextResponse.redirect(new URL(url));
    }
  }

  return intlMiddleware(request);
}