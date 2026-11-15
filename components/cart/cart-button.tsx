"use client";

import { ShoppingBasket } from "lucide-react";
import Link from "next/link";

import { interpolate } from "@/i18n/interpolate";
import { cn } from "@/lib/utils";

import { useCart } from "./cart-provider";

/** Cart icon with the number of items, shown in the navbar. */
export function CartButton({
  href,
  label,
  countLabel,
  className,
}: {
  href: string;
  label: string;
  countLabel: string; // "{count} article(s) dans le panier"
  className?: string;
}) {
  const { count, ready } = useCart();
  const shown = ready ? count : 0;
  return (
    <Link
      href={href}
      className={cn(
        "relative grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-brand-50 hover:text-brand-800",
        className,
      )}
      aria-label={shown > 0 ? interpolate(countLabel, { count: shown }) : label}
    >
      <ShoppingBasket className="size-[22px]" aria-hidden="true" />
      {shown > 0 ? (
        <span className="absolute -end-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-saffron-400 px-1 text-[11px] leading-5 font-bold text-brand-950 tabular">
          {shown > 99 ? "99+" : shown}
        </span>
      ) : null}
    </Link>
  );
}
