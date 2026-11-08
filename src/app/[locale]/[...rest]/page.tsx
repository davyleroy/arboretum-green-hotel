import { notFound } from "next/navigation";

// Catch-all under a locale so unmatched paths trigger the localized not-found UI
// in src/app/[locale]/not-found.tsx rather than Next's default error page.
export default function CatchAll() {
  notFound();
}
