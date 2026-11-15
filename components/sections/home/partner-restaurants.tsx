import { ChefHat } from "lucide-react";
import Link from "next/link";

import { RestaurantCard } from "@/components/cards/restaurant-card";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import type { Locale, RestaurantCardDTO } from "@/types";

/**
 * Partner restaurants ("restaurants conventionnés", online ordering), from getPartnerRestaurants.
 * Up to 3 cards: the third one is hidden on tablets (2 columns) to avoid a lonely card.
 */
export function PartnerRestaurants({
  lang,
  common,
  home,
  restaurants,
}: {
  lang: Locale;
  common: CommonDict;
  home: HomeDict;
  restaurants: RestaurantCardDTO[];
}) {
  const restaurantsHref = localePath(lang, "/restaurants");

  return (
    <section className="bg-canvas py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow={home.restaurants.eyebrow}
          title={home.restaurants.title}
          description={home.restaurants.description}
          action={restaurants.length > 0 ? { href: restaurantsHref, label: home.restaurants.seeAll } : undefined}
        />

        {restaurants.length === 0 ? (
          <EmptyState
            className="mt-8 bg-white sm:mt-10"
            icon={<ChefHat aria-hidden="true" />}
            title={home.restaurants.emptyTitle}
            description={home.restaurants.emptyText}
            action={
              <Link
                href={`${localePath(lang, "/contact")}?sujet=SUGGESTION`}
                className={buttonStyles({ variant: "outline" })}
              >
                {home.restaurants.emptyAction}
              </Link>
            }
          />
        ) : (
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {restaurants.slice(0, 3).map((restaurant, index) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                locale={lang}
                common={common}
                className={index === 2 ? "sm:max-lg:hidden" : undefined}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
