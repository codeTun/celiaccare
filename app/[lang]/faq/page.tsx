import { ArrowRight, BookOpen, Globe, Handshake, LockKeyhole, Mail, ShieldCheck, Truck, type LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Accordion } from "@/components/content/accordion";
import { OpenDetailsFromHash } from "@/components/content/open-details-from-hash";
import { RichText, toPlainText } from "@/components/content/rich-text";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { WhatsAppIcon } from "@/components/social-icons";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { faq, type FaqGroupId } from "@/data/faq";
import { isLocale, localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { faqJsonLd, pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

/** FAQ (spec §5.7): questions grouped by theme, with the FAQPage structured data for Google. */

const groupIcons: Record<FaqGroupId, LucideIcon> = {
  site: Globe,
  commandes: Truck,
  garantie: ShieldCheck,
  partenaires: Handshake,
  donnees: LockKeyhole,
};

export async function generateMetadata({ params }: PageProps<"/[lang]/faq">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { content } = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/faq", title: content.faq.metaTitle, description: content.faq.metaDescription });
}

export default async function FaqPage({ params }: PageProps<"/[lang]/faq">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { common, content } = getDictionary(lang);
  const groups = faq[lang];

  // Every question and its answer as plain text, for Google's FAQ rich results.
  const structuredData = faqJsonLd(
    groups.flatMap((group) =>
      group.items.map((item) => ({ question: item.question, answer: item.answer.map(toPlainText).join(" ") })),
    ),
  );

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: common.nav.faq, href: "/faq" }]}
        eyebrow={common.nav.helpTitle}
        title={content.faq.title}
        description={content.faq.description}
      >
        {/* Shortcuts to the themes */}
        <nav aria-label={content.faq.topics}>
          <ul className="flex flex-wrap gap-2">
            {groups.map((group) => {
              const Icon = groupIcons[group.id];
              return (
                <li key={group.id}>
                  <a
                    href={`#${group.id}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-soft ring-1 ring-line transition-colors hover:bg-brand-50 hover:text-brand-800 hover:ring-brand-200"
                  >
                    <Icon className="size-4 text-brand-600" aria-hidden="true" />
                    {group.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </PageHero>

      <Container className="py-12 sm:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:gap-20">
          {/* Questions, theme by theme */}
          <div className="space-y-14">
            {groups.map((group) => {
              const Icon = groupIcons[group.id];
              return (
                <section
                  key={group.id}
                  id={group.id}
                  aria-labelledby={`${group.id}-title`}
                  className="scroll-mt-24 lg:scroll-mt-28"
                >
                  <div className="mb-5 flex items-center gap-3.5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <div>
                      <h2 id={`${group.id}-title`} className="text-xl font-extrabold text-ink sm:text-2xl">
                        {group.title}
                      </h2>
                      <p className="text-sm text-ink-subtle">
                        {interpolate(content.faq.questionCount, { count: group.items.length })}
                      </p>
                    </div>
                  </div>
                  <Accordion
                    items={group.items.map((item) => ({
                      id: item.id,
                      title: item.question,
                      content: item.answer.map((paragraph) => (
                        <p key={paragraph}>
                          <RichText text={paragraph} lang={lang} />
                        </p>
                      )),
                    }))}
                  />
                </section>
              );
            })}
          </div>

          {/* Side column: the guide, then the contact options */}
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-brand-100 bg-brand-50/70 p-6">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam opacity-60" />
              <span className="grid size-11 place-items-center rounded-2xl bg-white text-brand-700 shadow-soft">
                <BookOpen className="size-5" aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-ink">{content.faq.guideTitle}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{content.faq.guideText}</p>
              <Link
                href={localePath(lang, "/guide-sans-gluten")}
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
              >
                {content.faq.guideCta}
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-soft">
              <h2 className="text-lg font-bold text-ink">{content.faq.contactTitle}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{content.faq.contactText}</p>
              <div className="mt-5 flex flex-col gap-2.5">
                <Link href={localePath(lang, "/contact")} className={buttonStyles({ className: "w-full" })}>
                  <Mail aria-hidden="true" />
                  {content.faq.contactCta}
                </Link>
                <a
                  href={`https://wa.me/${siteConfig.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonStyles({ variant: "outline", className: "w-full" })}
                >
                  <WhatsAppIcon />
                  {common.nav.whatsapp}
                  <span className="sr-only">{content.shared.newTab}</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      <JsonLd data={structuredData} />
      {/* /faq#paiement: opens the question the link points to */}
      <OpenDetailsFromHash />
    </>
  );
}
