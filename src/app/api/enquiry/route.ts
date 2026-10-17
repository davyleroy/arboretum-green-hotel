import { NextResponse } from "next/server";

/**
 * Enquiry endpoint (PRD R5). Emails the hotel through Resend when
 * RESEND_API_KEY and ENQUIRY_TO are set; in the demo it only logs.
 */
const MAX = { name: 120, phone: 40, email: 160, dates: 80, guests: 6, message: 2000 } as const;
const TYPES = new Set(["stay", "event", "dining"]);

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
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
      subject: `Website enquiry · ${enquiry.type} · ${enquiry.name}`,
      text,
    }),
  });

  if (!res.ok) {
    console.error("[enquiry] email failed", res.status, await res.text());
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
