import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage, legalPageMetadata } from "@/components/content/legal-page";
import { isLocale } from "@/i18n/config";

/** Conditions générales d'utilisation (spec §6.5). Content: data/legal.ts (termsOfUse). */

export async function generateMetadata({ params }: PageProps<"/[lang]/conditions">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return legalPageMetadata(lang, "terms");
}

export default async function TermsOfUsePage({ params }: PageProps<"/[lang]/conditions">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalPage lang={lang} page="terms" />;
}
