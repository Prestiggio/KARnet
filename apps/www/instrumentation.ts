export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError: typeof import("@sentry/nextjs").captureRequestError = async (
  ...args
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(...args);
};