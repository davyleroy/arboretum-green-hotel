import { redirect } from "next/navigation";

// Root-level fallback for paths that bypass next-intl middleware (shouldn't happen in
// normal browsing, but if it does we send the visitor to the default locale rather
// than Next's generic error page).
export default function RootNotFound() {
  redirect("/en");
}
