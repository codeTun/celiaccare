import { ShoppingBasket, UtensilsCrossed } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { localePath } from "@/i18n/config";
import type { Locale } from "@/types";

/** "Your cart is empty" with links to the products and the restaurants (cart page and checkout). */
export function EmptyCart({
  lang,
  texts,
}: {
  lang: Locale;
  texts: { title: string; text: string; products: string; restaurants: string };
}) {
  return (
    <EmptyState
      icon={<ShoppingBasket aria-hidden="true" />}
      title={texts.title}
      description={texts.text}
      className="py-16"
      action={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={localePath(lang, "/produits")} className={buttonStyles({ size: "lg" })}>
            <ShoppingBasket aria-hidden="true" />
            {texts.products}
          </Link>
          <Link href={localePath(lang, "/restaurants")} className={buttonStyles({ variant: "outline", size: "lg" })}>
            <UtensilsCrossed aria-hidden="true" />
            {texts.restaurants}
          </Link>
        </div>
      }
    />
  );
}
