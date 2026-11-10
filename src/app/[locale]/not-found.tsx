import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tn = useTranslations("nav");
  return (
    <section className="section" style={{ paddingTop: 160 }}>
      <div className="wrap" style={{ maxWidth: 720 }}>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: "12px 0 24px" }}>{t("title")}</h1>
        <p className="lead" style={{ marginBottom: 32 }}>{t("text")}</p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", gap: 24, flexWrap: "wrap" }}>
          <li><Link href="/" className="textlink">{tn("home")}</Link></li>
          <li><Link href="/stay" className="textlink">{tn("stay")}</Link></li>
          <li><Link href="/contact" className="textlink">{tn("contact")}</Link></li>
        </ul>
        <p style={{ marginTop: 40, color: "var(--ink-600)" }}>
          {t("bookingLabel")}{" "}
          <Link href="/stay" className="textlink">{t("bookingCta")}</Link>
        </p>
      </div>
    </section>
  );
}
