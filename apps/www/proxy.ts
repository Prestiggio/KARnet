import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
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
  const { pathname, searchParams } = request.nextUrl;
  const src = searchParams.get('utm_source')
  let provider: 'facebook' | 'google' | null = null
  if (src === 'facebook' || searchParams.has('fbclid')) provider = 'facebook'
  else if (src === 'google' || searchParams.has('gclid')) provider = 'google'

  const setProviderCookie = (response: NextResponse) => {
    if(provider) {
      response.cookies.set('auth_hint', provider, {
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
        httpOnly: false,
      })
    }
    return response
  }

  if (isProtected(request.nextUrl.pathname)) {
    const sessionCookie = getSessionCookie(request);

    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      url.searchParams.set("redirect", pathname);
      return setProviderCookie(NextResponse.redirect(new URL(url)));
    }
  }

  return setProviderCookie(intlMiddleware(request));
}