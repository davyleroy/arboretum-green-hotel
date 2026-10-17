"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import styles from "./EnquiryForm.module.css";

type Status = "idle" | "sending" | "sent" | "failed";
const TYPES = ["stay", "event", "dining"] as const;

export function EnquiryForm({ whatsappHref }: { whatsappHref: string }) {
  const t = useTranslations("contact");
  const tc = useTranslations("cta");
  const locale = useLocale();
  const params = useSearchParams();
  const [type, setType] = useState<(typeof TYPES)[number]>("stay");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const q = params.get("type");
    if (q && (TYPES as readonly string[]).includes(q)) setType(q as (typeof TYPES)[number]);
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (!data.name?.trim() || !data.phone?.trim()) {
      setError(t("required"));
      return;
    }
    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type, locale }),
      });
      setStatus(res.ok ? "sent" : "failed");
    } catch {
      setStatus("failed");
    }
  }

  if (status === "sent") {
    return <p className={styles.done} role="status">{t("sent")}</p>;
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <fieldset className={styles.types}>
        <legend className={styles.legend}>{t("type")}</legend>
        {TYPES.map((k) => (
          <label key={k} className={styles.type}>
            <input type="radio" name="typeChoice" value={k} checked={type === k} onChange={() => setType(k)} />
            <span>{t(k === "stay" ? "typeStay" : k === "event" ? "typeEvent" : "typeDining")}</span>
          </label>
        ))}
      </fieldset>

      <div className={styles.grid}>
        <Field label={t("name")} name="name" autoComplete="name" required />
        <Field label={t("phone")} name="phone" type="tel" autoComplete="tel" required />
        <Field label={t("emailField")} name="email" type="email" autoComplete="email" />
        <Field label={t("dates")} name="dates" placeholder="12 – 14 Nov" />
        <Field label={t("guests")} name="guests" type="number" inputMode="numeric" min={1} />
      </div>
      <label className={styles.field}>
        <span>{t("message")}</span>
        <textarea name="message" rows={4} maxLength={2000} />
      </label>

      {/* Honeypot: humans never see this field. */}
      <div aria-hidden className={styles.hp}>
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {status === "failed" && (
        <p className={styles.error} role="alert">
          {t("failed")} <a href={whatsappHref} target="_blank" rel="noopener noreferrer">{tc("whatsapp")}</a>
        </p>
      )}

      <button type="submit" className="btn" disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("send")}
      </button>
    </form>
  );
}

function Field({ label, ...input }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={styles.field}>
      <span>
        {label}
        {input.required && <span aria-hidden> *</span>}
      </span>
      <input {...input} aria-required={input.required || undefined} required={false} />
    </label>
  );
}
