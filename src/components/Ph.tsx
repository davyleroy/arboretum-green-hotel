import { useTranslations } from "next-intl";

/** Marks a fact that the hotel still has to confirm. Shown with a dotted underline in demo mode. */
export function Ph({ on = true, children }: { on?: boolean; children: React.ReactNode }) {
  const t = useTranslations("ph");
  if (!on) return <>{children}</>;
  return (
    <span className="ph" title={t("title")}>
      {children}
      <span className="sr-only"> ({t("title")})</span>
    </span>
  );
}
