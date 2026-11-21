import { Fragment } from "react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cartLabels } from "@/components/cart/labels";
import { OrderRequestBox } from "@/components/directory/order-request";
import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { Price } from "@/components/ui/price";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { RestaurantsDict } from "@/i18n/resources/fr/restaurants";
import { cn } from "@/lib/utils";
import type { DishCourse, DishDTO, Locale, RestaurantDetailDTO } from "@/types";

/** Placeholder icon (lib/icons.ts) of a dish without photo, by course. */
const COURSE_ICONS: Record<DishCourse, string> = {
  STARTER: "salad",
  MAIN: "meals",
  DESSERT: "pastry",
  DRINK: "drinks",
};

/** Anchor of a menu section: "#carte-starter". */
const sectionId = (course: DishCourse) => `carte-${course.toLowerCase()}`;

/**
 * The gluten-free menu of a restaurant, by course (starters, mains, desserts, drinks).
 * Partner restaurants (`canOrder`) get an "Ajouter" button on each available dish;
 * the others only show their dishes. Without any dish online, the section holds the
 * "Demander sur CeliacCare" box (the page then leaves out its own box above the menu).
 */
export function RestaurantMenu({
  restaurant,
  canOrder,
  locale,
  common,
  dict,
}: {
  restaurant: RestaurantDetailDTO;
  /** Partner restaurant: dishes can be added to the cart */
  canOrder: boolean;
  locale: Locale;
  common: CommonDict;
  dict: RestaurantsDict;
}) {
  const { menu } = restaurant;

  return (
    <section id="carte" aria-labelledby="carte-title" className="scroll-mt-24">
      <h2 id="carte-title" className="text-2xl font-extrabold text-ink sm:text-3xl">
        {dict.menu.title}
      </h2>
      {menu.length > 0 ? (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          {dict.menu.intro}
          {canOrder ? ` ${dict.menu.orderHint}` : ""}
        </p>
      ) : null}

      {menu.length === 0 ? (
        // No dish online yet: the visitor asks CeliacCare for them, never the restaurant directly.
        <>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">{dict.menu.emptyText}</p>
          <OrderRequestBox
            target={{ kind: "restaurant", slug: restaurant.slug }}
            locale={locale}
            texts={common.ordering}
            headingLevel={3}
            className="mt-6"
          />
        </>
      ) : (
        <>
          {/* Quick links to each course; stays under the navbar while scrolling the menu */}
          {menu.length > 1 ? (
            <nav
              aria-label={dict.menu.sectionsLabel}
              className="sticky top-16 z-20 -mx-4 mt-5 border-b border-line bg-white/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:top-[4.5rem] lg:mx-0 lg:px-0"
            >
              <ul className="flex gap-2 overflow-x-auto scrollbar-none">
                {menu.map((section) => (
                  <li key={section.course} className="shrink-0">
                    <a
                      href={`#${sectionId(section.course)}`}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800"
                    >
                      {common.courses[section.course]}
                      <span className="text-xs text-ink-subtle tabular">{section.dishes.length}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <div className="mt-6 space-y-10">
            {menu.map((section) => (
              <section
                key={section.course}
                id={sectionId(section.course)}
                aria-labelledby={`${sectionId(section.course)}-title`}
                className="scroll-mt-36"
              >
                <h3
                  id={`${sectionId(section.course)}-title`}
                  className="flex items-center gap-3 text-lg font-bold text-ink"
                >
                  {common.courses[section.course]}
                  <span className="studs h-1.5 flex-1 opacity-70" aria-hidden="true" />
                </h3>
                <ul className="mt-4 grid gap-3">
                  {section.dishes.map((dish) => (
                    <li key={dish.id}>
                      <DishCard
                        dish={dish}
                        restaurant={restaurant}
                        canOrder={canOrder}
                        locale={locale}
                        common={common}
                        dict={dict}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/** One dish: photo, name, price, description, ingredients (allergens highlighted), add button. */
function DishCard({
  dish,
  restaurant,
  canOrder,
  locale,
  common,
  dict,
}: {
  dish: DishDTO;
  restaurant: RestaurantDetailDTO;
  canOrder: boolean;
  locale: Locale;
  common: CommonDict;
  dict: RestaurantsDict;
}) {
  return (
    <article
      className={cn(
        "flex gap-3.5 rounded-2xl border border-line bg-white p-3 transition-colors hover:border-brand-200 sm:gap-4 sm:p-4",
        !dish.isAvailable && "bg-canvas/70",
      )}
    >
      <CloudImage
        src={dish.imageUrl}
        alt={dish.name}
        fallbackIcon={COURSE_ICONS[dish.course]}
        sizes="(min-width: 640px) 112px, 88px"
        rounded="rounded-xl"
        className={cn("size-22 shrink-0 sm:size-28", !dish.isAvailable && "opacity-60 grayscale")}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-[15px] leading-snug font-bold text-ink">{dish.name}</h4>
          <Price value={dish.price} locale={locale} className="shrink-0 text-[15px] text-ink" />
        </div>

        {dish.description ? (
          <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-ink-muted">{dish.description}</p>
        ) : null}

        {dish.ingredients.length > 0 ? (
          <p className="mt-2 text-xs leading-relaxed text-ink-subtle">
            <span className="font-semibold text-ink-muted">{dict.menu.ingredients}</span>{" "}
            {dish.ingredients.map((ingredient, index) => (
              <Fragment key={ingredient.id}>
                {index > 0 ? (locale === "ar" ? "، " : ", ") : null}
                {ingredient.isAllergen ? (
                  <mark className="rounded bg-saffron-50 px-1 font-semibold text-saffron-700 ring-1 ring-saffron-100">
                    {ingredient.name}
                    <span className="sr-only"> ({dict.menu.allergen})</span>
                  </mark>
                ) : (
                  ingredient.name
                )}
              </Fragment>
            ))}
          </p>
        ) : null}

        {/* Unavailable dish: a badge only. Available dish of a partner restaurant: the add button. */}
        {!dish.isAvailable ? (
          <div className="mt-auto pt-3">
            <Badge tone="neutral">{dict.menu.unavailable}</Badge>
          </div>
        ) : canOrder ? (
          <div className="mt-auto flex justify-end pt-3">
            <AddToCartButton
              size="sm"
              variant="secondary"
              labels={{ ...cartLabels(common), add: dict.menu.add }}
              item={{
                kind: "DISH",
                id: dish.id,
                name: dish.name,
                price: dish.price,
                imageUrl: dish.imageUrl,
                merchantName: restaurant.name,
                href: `/restaurants/${restaurant.slug}`,
                restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
              }}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
