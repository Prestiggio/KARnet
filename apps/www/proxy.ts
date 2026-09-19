import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { match } from "next/dist/compiled/path-to-regexp";

const intlMiddleware = createMiddleware(routing);

export const config = {
  matcher: [
    '/tickets',
    '/parishes/:id((?!api|join|create$).+)+',
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ]
};

// Next.js statically parses `config` above, so it must stay a literal object
// (no spreads/identifiers) — protected routes are every matcher entry except
// the trailing catch-all.
const protectedMatchers = config.matcher.slice(0, -1).map(pattern =>
  match(pattern, { decode: decodeURIComponent })
);

// The proxy receives localized URLs before next-intl rewrites them.
const localizedProtectedMatchers = Object.entries(routing.pathnames).flatMap(([internalPath, localizedPaths]) => {
  if (!protectedMatchers.some(matcher => matcher(internalPath) !== false)) return [];

  const paths = typeof localizedPaths === 'string' ? [localizedPaths] : Object.values(localizedPaths);
  return paths.map(path => match(path.replace(/\[([^\]]+)\]/g, ':$1'), {
    decode: decodeURIComponent,
    end: false,
  }));
});

const localePrefix = new RegExp(`^/(${routing.locales.join('|')})(?=/|$)`);

function parishLoginPath(pathname: string) {
  const locale = pathname.match(localePrefix)?.[1] ?? routing.defaultLocale;
  const path = pathname.replace(localePrefix, '') || '/';
  const parishPaths = routing.pathnames['/parishes/[id]'];
  const parishPattern = typeof parishPaths === 'string'
    ? parishPaths
    : parishPaths[locale as keyof typeof parishPaths] ?? '/parishes/[id]';
  const parishMatch = match(parishPattern.replace('[id]', ':id'), {
    decode: decodeURIComponent,
  })(path);

  if (!parishMatch) return null;

  const loginPaths = routing.pathnames['/parishes/[id]/login'];
  const loginPattern = typeof loginPaths === 'string'
    ? loginPaths
    : loginPaths[locale as keyof typeof loginPaths] ?? '/parishes/[id]/login';
  const id = encodeURIComponent(String(parishMatch.params.id));
  return `/${locale}${loginPattern.replace('[id]', id)}`;
}

function isProtected(pathname: string) {
  const path = pathname.replace(localePrefix, '') || '/';

  // This endpoint accepts anonymous parish drafts. Authentication happens
  // later, when the user resumes the submission with the returned token.
  if (/^\/parishes\/create\/api\/?$/.test(path)) return false;

  // Parish login pages must remain public. They are children of a protected
  // parish route, so the broad localized matcher would otherwise redirect
  // them repeatedly.
  if (/\/(?:hiditra|connexion|login)\/?$/.test(pathname)) return false;

  return [...protectedMatchers, ...localizedProtectedMatchers].some(matcher => matcher(path) !== false);
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
      url.pathname = parishLoginPath(pathname) ?? '/sign-in';
      url.searchParams.set("redirect", pathname);
      return setProviderCookie(NextResponse.redirect(new URL(url)));
    }
  }

  return setProviderCookie(intlMiddleware(request));
}
