import { ShoppingBasket } from "lucide-react";
import Link from "next/link";

import { ProductCard } from "@/components/cards/product-card";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import type { Locale, ProductCardDTO } from "@/types";

/**
 * Featured products (from getFeaturedProducts, up to 8).
 * 6 are shown on phones and tablets (3 rows of 2, or 2 rows of 3), 8 on wide screens (2 rows of 4).
 */
export function FeaturedProducts({
  lang,
  common,
  home,
  products,
}: {
  lang: Locale;
  common: CommonDict;
  home: HomeDict;
  products: ProductCardDTO[];
}) {
  const productsHref = localePath(lang, "/produits");

  return (
    <section>
      <Container>
        <SectionHeading
          eyebrow={home.featured.eyebrow}
          title={home.featured.title}
          description={home.featured.description}
          action={products.length > 0 ? { href: productsHref, label: home.featured.seeAll } : undefined}
        />

        {products.length === 0 ? (
          <EmptyState
            className="mt-8 sm:mt-10"
            icon={<ShoppingBasket aria-hidden="true" />}
            title={home.featured.emptyTitle}
            description={home.featured.emptyText}
            action={
              <Link
                href={`${localePath(lang, "/contact")}?sujet=SUGGESTION`}
                className={buttonStyles({ variant: "outline" })}
              >
                {home.featured.emptyAction}
              </Link>
            }
          />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                locale={lang}
                common={common}
                className={index >= 6 ? "hidden xl:flex" : undefined}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
