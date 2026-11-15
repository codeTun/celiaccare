import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage, legalPageMetadata } from "@/components/content/legal-page";
import { isLocale } from "@/i18n/config";

/** Politique de confidentialité — loi organique n° 2004-63 (spec §6.4). Content: data/legal.ts (privacyPolicy). */

export async function generateMetadata({ params }: PageProps<"/[lang]/confidentialite">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return legalPageMetadata(lang, "privacy");
}

export default async function PrivacyPolicyPage({ params }: PageProps<"/[lang]/confidentialite">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalPage lang={lang} page="privacy" />;
}
