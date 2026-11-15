import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ContactAside, ContactShortcuts } from "@/components/contact/contact-aside";
import { ContactForm, type ContactFormProps } from "@/components/contact/contact-form";
import { ContactFormSkeleton } from "@/components/contact/contact-form-skeleton";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { MESSAGE_TOPICS, type MessageTopic } from "@/types";

import { sendContactMessage } from "./actions";

/**
 * Contact page (spec §5.7, EF-21 "Proposer une adresse"): the form, our contact
 * details and the partner / suggestion explanations. The messages are handled
 * in the admin panel. /contact?sujet=PARTNERSHIP opens the form on that topic.
 */

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { contact } = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/contact", title: contact.meta.title, description: contact.meta.description });
}

export default async function ContactPage({ params, searchParams }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { common, contact } = getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        align="center"
        breadcrumbs={[{ label: common.nav.contact, href: "/contact" }]}
        eyebrow={contact.hero.eyebrow}
        title={contact.hero.title}
        description={contact.hero.description}
      />

      <Container className="py-12 sm:py-16">
        {/* Phones: form, contact details, shortcuts. Large screens: the shortcuts go under the form. */}
        <div className="grid gap-10 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-8">
          <section id="formulaire" aria-labelledby="contact-form-title" className="scroll-mt-24 lg:col-span-7 lg:scroll-mt-28">
            <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-8">
              <h2 id="contact-form-title" className="text-xl font-extrabold text-ink sm:text-2xl">
                {contact.form.title}
              </h2>
              <p className="mt-1.5 text-sm text-ink-muted">{contact.form.intro}</p>
              <div className="mt-6">
                {/* The topic comes from the URL (?sujet=...), which is only known when the page is requested. */}
                <Suspense fallback={<ContactFormSkeleton />}>
                  <ContactFormWithTopic
                    lang={lang}
                    searchParams={searchParams}
                    action={sendContactMessage.bind(null, lang)}
                    labels={contact.form}
                  />
                </Suspense>
              </div>
            </div>
          </section>

          <div className="lg:col-span-5 lg:row-span-2">
            <ContactAside lang={lang} />
          </div>

          <div className="lg:col-span-7 lg:self-start">
            <ContactShortcuts lang={lang} />
          </div>
        </div>
      </Container>
    </>
  );
}

/** Reads ?sujet= (e.g. PARTNERSHIP from the "Devenir partenaire" links) and opens the form on that topic. */
async function ContactFormWithTopic({
  searchParams,
  ...props
}: Omit<ContactFormProps, "defaultTopic"> & Pick<PageProps<"/[lang]/contact">, "searchParams">) {
  const { sujet } = await searchParams;
  const wanted = typeof sujet === "string" ? sujet.toUpperCase() : "";
  const topic: MessageTopic = MESSAGE_TOPICS.find((value) => value === wanted) ?? "GENERAL";

  // A new topic in the URL gives a fresh form already set on that topic.
  return <ContactForm key={topic} {...props} defaultTopic={topic} />;
}
