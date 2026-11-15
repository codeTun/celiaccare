import type { ReactNode } from "react";

import type { Locale } from "@/types";

/**
 * A database text that only exists in French (e.g. "blé et orge", "Visite sur place").
 * On Arabic pages it is marked lang="fr" (screen readers switch to a French voice)
 * and isolated from the right-to-left sentence around it.
 */
export function FrenchText({ locale, children }: { locale: Locale; children: ReactNode }) {
  return locale === "ar" ? <bdi lang="fr">{children}</bdi> : children;
}
