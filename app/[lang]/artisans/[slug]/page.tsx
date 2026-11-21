import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductCard } from "@/components/cards/product-card";
import { InfoSheet } from "@/components/directory/info-sheet";
import { MapEmbed } from "@/components/directory/map-embed";
import { OrderRequestBox } from "@/components/directory/order-request";
import { SheetReport } from "@/components/directory/sheet-report";
import { DetailPageSkeleton } from "@/components/directory/skeletons";
import { JsonLd } from "@/components/json-ld";
import { ProducerHeader } from "@/components/producers/producer-header";
import { Alert } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import { pageMetadata, producerJsonLd } from "@/lib/seo";
import { getProducerBySlug, getProducerSlugs } from "@/models/fetchers/producers";

/* /fr/artisans/[slug] — one small business: its story, its sheet (spec 5.2),
   its products and the "Signaler une erreur" button. Every purchase goes through
   CeliacCare: no contact of the business, but "Commander / Demander sur CeliacCare". */

type ArtisanPageProps = PageProps<"/[lang]/artisans/[slug]">;

/** Pages built in advance: one per published artisan (at least one item, Cache Components rule). */
export async function generateStaticParams() {
  const slugs = await getProducerSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: ArtisanPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const producer = await getProducerBySlug(lang, slug);
  const { common, producers: dict } = getDictionary(lang);
  if (!producer) return { title: common.states.notFoundTitle, robots: { index: false } };

  const values = { name: producer.name, city: producer.city, type: common.producerTypes[producer.type] };
  return pageMetadata({
    locale: lang,
    path: `/artisans/${producer.slug}`,
    title: interpolate(dict.meta.detailTitle, values),
    description: interpolate(dict.meta.detailDescription, values),
    image: producer.imageUrl
      ? (cloudinaryUrl(producer.imageUrl, { width: 1200, height: 630, crop: "fill" }) ?? producer.imageUrl)
      : null,
  });
}

export default function ArtisanPage({ params }: ArtisanPageProps) {
  // The slug is URL data: it is read inside <Suspense> (Cache Components rule).
  return (
    <Suspense fallback={<DetailPageSkeleton variant="producer" />}>
      <ArtisanContent params={params} />
    </Suspense>
  );
}

async function ArtisanContent({ params }: Pick<ArtisanPageProps, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const producer = await getProducerBySlug(lang, slug);
  if (!producer) notFound();

  const dict = getDictionary(lang);
  const { common, producers: texts } = dict;
  // Something can be added to the cart; otherwise the visitor asks CeliacCare (OrderRequestBox).
  const canOrder = producer.products.some((product) => product.isAvailable);

  return (
    <>
      <JsonLd data={producerJsonLd(producer, lang)} />

      <ProducerHeader producer={producer} canOrder={canOrder} locale={lang} common={common} dict={texts} />

      <Container className="py-10 sm:py-14">
        {/* Mobile: story, products, then the sheet and the map. Large screens: the sheet in a side column. */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-12">
            {producer.description ? (
              <section aria-labelledby="story-title">
                <h2 id="story-title" className="text-2xl font-extrabold text-ink sm:text-3xl">
                  {interpolate(texts.page.story, { name: producer.name })}
                </h2>
                <span className="studs mt-3 block h-1.5 w-16" aria-hidden="true" />
                <p className="mt-5 max-w-3xl text-base leading-relaxed whitespace-pre-line text-ink-muted">
                  {producer.description}
                </p>
              </section>
            ) : null}

            <section id="produits" aria-labelledby="products-title" className="scroll-mt-24">
              <h2 id="products-title" className="text-2xl font-extrabold text-ink sm:text-3xl">
                {interpolate(texts.page.productsTitle, { name: producer.name })}
              </h2>
              {canOrder ? (
                <p className="mt-2 text-sm text-ink-muted">{texts.page.productsText}</p>
              ) : (
                // Nothing to order on the site yet: the visitor asks CeliacCare, never the business directly.
                <OrderRequestBox
                  target={{ kind: "artisan", slug: producer.slug }}
                  locale={lang}
                  texts={common.ordering}
                  headingLevel={3}
                  className="mt-6"
                />
              )}
              {producer.products.length > 0 ? (
                <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
                  {producer.products.map((product) => (
                    <li key={product.id} className="flex">
                      <ProductCard product={product} locale={lang} common={common} className="w-full" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            {/* Spec 6.5: visible warning on every sheet */}
            <Alert tone="warning" title={common.disclaimer.title}>
              {common.disclaimer.text}
            </Alert>
          </div>

          <aside className="min-w-0 space-y-6">
            <InfoSheet
              place={producer}
              practices={[
                { label: common.practices.dedicatedSpace, ok: producer.dedicatedSpace },
                { label: common.practices.dedicatedUtensils, ok: producer.dedicatedUtensils },
                { label: common.practices.trainedStaff, ok: producer.trainedStaff },
              ]}
              locale={lang}
              common={common}
              labels={texts.sheet}
              footer={
                <SheetReport
                  locale={lang}
                  target={{ type: "PRODUCER", id: producer.id, name: producer.name }}
                  labels={texts.sheet}
                  community={dict.community}
                  closeLabel={common.actions.close}
                />
              }
            />
            <MapEmbed place={producer} locale={lang} common={common} labels={texts.sheet} />
          </aside>
        </div>
      </Container>
    </>
  );
}
