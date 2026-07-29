"use client";

import { useId, useState, type FormEvent } from "react";

type Status = "idle" | "loading" | "success" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  invalid_phone:
    "Tsy mety ny laharana finday. Ohatra: 034 12 345 67 na +261 34 12 345 67.",
  consent_required: "Ilaina ny fanekenao mba handraisana ny hafatra.",
  invalid_json: "Nisy olana teknika. Andramo indray azafady.",
  default: "Tsy voarindra ny fisoratana anarana. Andramo indray azafady.",
};

export default function SubscribeForm() {
  const phoneId = useId();
  const nameId = useId();
  const consentId = useId();
  const statusId = useId();
  const hintId = useId();

  const [status, setStatus] = useState<Status>("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setErrorCode(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      phone: String(data.get("phone") ?? ""),
      name: String(data.get("name") ?? ""),
      consent: data.get("consent") === "on",
      // honeypot field — left empty by real visitors
      company: String(data.get("company") ?? ""),
    };

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };

      if (json.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorCode(json.error ?? "default");
      }
    } catch {
      setStatus("error");
      setErrorCode("default");
    }
  }

  if (status === "success") {
    return (
      <div
        role="status"
        id={statusId}
        className="rounded-xl border border-gold/40 bg-burgundy-deep/40 px-5 py-4 text-cream"
      >
        <p className="font-display text-lg font-semibold">
          Misaotra! Voasoratra ianao.
        </p>
        <p className="mt-1 text-sm text-cream/80">
          Ho voalohany hahafantatra ny fivoaran&rsquo;ny KaRNet ianao, ary
          hisantatra amin&rsquo;ny andrana ara-teknika amin&rsquo;ny alalan&rsquo;ny SMS.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-md"
      aria-describedby={hintId}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <label htmlFor={phoneId} className="sr-only">
            Laharana finday
          </label>
          <input
            id={phoneId}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="034 12 345 67"
            aria-required="true"
            aria-invalid={errorCode === "invalid_phone"}
            aria-describedby={hintId}
            className="w-full rounded-lg border-2 border-cream/30 bg-cream px-4 py-3 text-base text-ink placeholder:text-ink/65 focus:border-gold focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center rounded-lg bg-gold px-6 py-3 font-display font-semibold text-burgundy-deep transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-70 sm:shrink-0"
        >
          {status === "loading" ? "Alefa…" : "Manaraka"}
        </button>
      </div>

      {/* Optional name — improves personalization, never required */}
      <div className="mt-3">
        <label htmlFor={nameId} className="sr-only">
          Anarana (tsy voatery)
        </label>
        <input
          id={nameId}
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Anaranao (tsy voatery)"
          className="w-full rounded-lg border-2 border-cream/20 bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-cream/60 focus:border-gold focus:outline-none"
        />
      </div>

      {/* Honeypot — hidden from sighted and AT users, catches simple bots */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Aza fenoina ity saha ity</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="mt-3 flex items-start gap-2.5">
        <input
          id={consentId}
          name="consent"
          type="checkbox"
          required
          aria-required="true"
          className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-cream/60 bg-transparent accent-gold"
        />
        <label htmlFor={consentId} className="text-xs leading-snug text-cream/75">
          Manaiky aho fa handray hafatra avy amin&rsquo;ny KaRNet
          amin&rsquo;ny alalan&rsquo;ny SMS na antso.
        </label>
      </div>

      <p id={hintId} className="mt-2 text-xs text-cream/60">
        Laharana Malagasy: ohatra 034 12 345 67 na +261 34 12 345 67.
      </p>

      <div aria-live="polite" className="mt-2">
        {status === "error" && (
          <p id={statusId} role="alert" className="text-sm font-medium text-gold-bright">
            {ERROR_MESSAGES[errorCode ?? "default"] ?? ERROR_MESSAGES.default}
          </p>
        )}
      </div>
    </form>
  );
}
