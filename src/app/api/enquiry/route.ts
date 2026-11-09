import { NextResponse } from "next/server";

/**
 * Enquiry endpoint (PRD R5). Emails the hotel through Resend when
 * RESEND_API_KEY and ENQUIRY_TO are set; in the demo it only logs.
 */
const MAX = { name: 120, phone: 40, email: 160, dates: 80, guests: 6, message: 2000 } as const;
const TYPES = new Set(["stay", "event", "dining"]);

// Payload cap keeps a request flood from exhausting server memory before validation.
const MAX_BODY_BYTES = 4096;

// In-memory sliding-window rate limit, 5 requests per 60s per client IP. Resets on every
// Vercel cold start; good enough to deter spam, not a defense against a determined attacker.
// Cap the map to 1000 entries so an IP-spoofing flood can't exhaust memory either.
const WINDOW_MS = 60_000;
const MAX_HITS = 5;
const MAX_KEYS = 1000;
const hits = new Map<string, number[]>();

function ratelimit(key: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);
  if (recent.length >= MAX_HITS) {
    const oldest = recent[0];
    return { allowed: false, retryAfter: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)) };
  }
  recent.push(now);
  hits.set(key, recent);
  // Evict the oldest key if the map grew past the cap.
  if (hits.size > MAX_KEYS) {
    const firstKey = hits.keys().next().value;
    if (firstKey !== undefined) hits.delete(firstKey);
  }
  return { allowed: true, retryAfter: 0 };
}

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = ratelimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  // Body size cap before JSON.parse so a 10MB payload can't allocate memory.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot filled in: pretend success, send nothing.
  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const field = (k: keyof typeof MAX) => String(body[k] ?? "").trim().slice(0, MAX[k]);
  const enquiry = {
    type: TYPES.has(String(body.type)) ? String(body.type) : "stay",
    locale: String(body.locale ?? "en").slice(0, 5),
    ref: /^AG-[A-Z]-[2-9A-Z]{4}$/.test(String(body.ref)) ? String(body.ref) : "AG-D-WEB0",
    name: field("name"),
    phone: field("phone"),
    email: field("email"),
    dates: field("dates"),
    guests: field("guests"),
    message: field("message"),
  };
  if (!enquiry.name || !enquiry.phone) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.ENQUIRY_TO;
  if (!key || !to) {
    console.log("[enquiry:demo]", enquiry);
    return NextResponse.json({ ok: true, demo: true });
  }

  const text = [
    `New ${enquiry.type} enquiry (site language: ${enquiry.locale})`,
    `Booking reference: ${enquiry.ref}`,
    "",
    `Name: ${enquiry.name}`,
    `Phone: ${enquiry.phone}`,
    `Email: ${enquiry.email || "-"}`,
    `Dates: ${enquiry.dates || "-"}`,
    `Guests: ${enquiry.guests || "-"}`,
    "",
    enquiry.message || "(no message)",
  ].join("\n");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ENQUIRY_FROM ?? "Arboretum Website <onboarding@resend.dev>",
      to: [to],
      reply_to: enquiry.email || undefined,
      subject: `Website enquiry · ${enquiry.type} · ${enquiry.name} · ${enquiry.ref}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[enquiry] email failed", res.status, await res.text());
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
