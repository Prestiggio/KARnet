import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Loosely validates Malagasy phone numbers:
// accepts +261 32/33/34/37/38 XX XXX XX, or the local 0XX XX XXX XX form,
// tolerating spaces/dots/dashes as separators.
const MG_PHONE_RE = /^(?:\+261|0)\s?3[2-9](?:[\s.-]?\d){7}$/;

interface SubscribePayload {
  phone?: string;
  name?: string;
  email?: string;
  consent?: boolean;
  // honeypot — real users never fill this hidden field
  company?: string;
}

export async function POST(request: Request) {
  let payload: SubscribePayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  // Honeypot tripped — silently pretend success so bots don't learn anything
  if (payload.company) {
    return NextResponse.json({ ok: true });
  }

  const phone = (payload.phone ?? "").trim();
  const consent = payload.consent === true;

  if (!phone || !MG_PHONE_RE.test(phone)) {
    return NextResponse.json(
      { ok: false, error: "invalid_phone" },
      { status: 422 }
    );
  }

  if (!consent) {
    return NextResponse.json(
      { ok: false, error: "consent_required" },
      { status: 422 }
    );
  }

  // TODO: wire this up to the real subscriber store (e.g. Directus,
  // a CRM, or an SMS/newsletter provider) once the backend is ready.
  // For now this endpoint validates input and acknowledges receipt so
  // the landing page is fully functional standalone.
  console.log("[karnet] new subscriber", {
    phone,
    name: payload.name?.trim() || null,
    email: payload.email?.trim() || null,
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
