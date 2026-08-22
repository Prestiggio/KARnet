import { NextRequest, NextResponse } from "next/server";

if (!process.env.SENTRY_DSN) {
  throw new Error("SENTRY_DSN environment variable is not set");
}
const DSN = new URL(process.env.SENTRY_DSN);

export async function POST(req: NextRequest) {
  const projectId = DSN.pathname.replace("/", "");
  const url = `${DSN.protocol}//${DSN.host}/api/${projectId}/envelope/?sentry_key=${DSN.username}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=UTF-8" },
    body: await req.text(),
  });

  return NextResponse.json({ status: response.ok ? "ok" : "error" }, { status: response.status });
}
