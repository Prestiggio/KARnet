import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.01,
  tunnel: "/api/glitchtip-tunnel",
  beforeSend(event) {
    if (event.request?.cookies) delete event.request.cookies
    if (event.request?.headers) {
      delete event.request.headers.Cookie
      delete event.request.headers.Authorization
    }
    return event
  }
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
