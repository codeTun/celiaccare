import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage, legalPageMetadata } from "@/components/content/legal-page";
import { isLocale } from "@/i18n/config";

/** Mentions légales (spec §6.4). Content: data/legal.ts (legalNotice). */

export async function generateMetadata({ params }: PageProps<"/[lang]/mentions-legales">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return legalPageMetadata(lang, "notice");
}

export default async function LegalNoticePage({ params }: PageProps<"/[lang]/mentions-legales">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return <LegalPage lang={lang} page="notice" />;
}
