import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { isolate } from "@/components/checkout/text";
import { ContactAside, ContactShortcuts } from "@/components/contact/contact-aside";
import { ContactForm, type ContactFormProps, type OrderRequest } from "@/components/contact/contact-form";
import { ContactFormSkeleton } from "@/components/contact/contact-form-skeleton";
import { orderTargetFromParams, topicFromParam, type OrderRequestTarget } from "@/components/contact/contact-params";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { getProducerBySlug, getProducerSlugs } from "@/models/fetchers/producers";
import { getProductBySlug, getProductSlugs } from "@/models/fetchers/products";
import { getRestaurantBySlug, getRestaurantSlugs } from "@/models/fetchers/restaurants";
import type { Locale, MessageTopic } from "@/types";

import { sendContactMessage } from "./actions";

/**
 * Contact page (spec §5.7, EF-21 "Proposer une adresse"): the form, our contact
 * details and the partner / suggestion explanations. The messages are handled
 * in the admin panel. /contact?sujet=PARTNERSHIP opens the form on that topic, and
 * /contact?sujet=commande&artisan=lilydelights (also &restaurant=… or &produit=…: the
 * "Demander sur CeliacCare" buttons) opens it on "Une commande" with the subject already
 * written: every purchase goes through CeliacCare, so the visitor asks us and our team
 * contacts the business.
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

/**
 * Reads ?sujet= (e.g. PARTNERSHIP from the "Devenir partenaire" links, "commande") and ?artisan=,
 * ?restaurant= or ?produit= (a slug), and opens the form on that topic.
 */
async function ContactFormWithTopic({
  searchParams,
  ...props
}: Omit<ContactFormProps, "defaultTopic" | "orderRequest"> & Pick<PageProps<"/[lang]/contact">, "searchParams">) {
  const params = await searchParams;
  const target = orderTargetFromParams(params);
  // A business or product alone also means "I would like to order it".
  const topic: MessageTopic = topicFromParam(params.sujet) ?? (target ? "ORDER" : "GENERAL");

  // "Demander sur CeliacCare": subject written for the visitor, message hint and notice about this business.
  // Its name comes from the database, never from the URL; an unknown slug opens "Une commande" without them.
  const texts = props.labels.orderRequest;
  const found = topic === "ORDER" && target ? await orderTargetName(props.lang, target, texts.product) : null;
  // Isolated: a Latin name ending with "!" or ")" keeps its punctuation in place inside an Arabic sentence.
  const name = found ? isolate(found) : null;
  const orderRequest: OrderRequest | null =
    name && target
      ? {
          subject: interpolate(texts.subject, { name }),
          messagePlaceholder: interpolate(
            target.kind === "product" ? texts.productMessagePlaceholder : texts.messagePlaceholder,
            { name },
          ),
          notice: interpolate(texts.notice, { name }),
        }
      : null;

  // A new topic or business in the URL gives a fresh form already set on them.
  const key = `${topic}|${target ? `${target.kind}:${target.slug}` : ""}`;
  return <ContactForm key={key} {...props} defaultTopic={topic} orderRequest={orderRequest} />;
}

/**
 * Name shown for a "Demander sur CeliacCare" link: the published artisan or restaurant, or
 * "product (artisan)" (`productLabel`), read with the cached public fetchers. Null when the slug is
 * unknown or hidden. Only the site's own slugs are looked up, so made-up URLs never fill the cache.
 */
async function orderTargetName(locale: Locale, target: OrderRequestTarget, productLabel: string) {
  switch (target.kind) {
    case "artisan": {
      if (!(await getProducerSlugs()).includes(target.slug)) return null;
      return (await getProducerBySlug(locale, target.slug))?.name ?? null;
    }
    case "restaurant": {
      if (!(await getRestaurantSlugs()).includes(target.slug)) return null;
      return (await getRestaurantBySlug(locale, target.slug))?.name ?? null;
    }
    case "product": {
      if (!(await getProductSlugs()).includes(target.slug)) return null;
      const product = await getProductBySlug(locale, target.slug);
      return product ? interpolate(productLabel, { product: product.name, name: product.producerName }) : null;
    }
  }
}
