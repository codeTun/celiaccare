"use client";

import {
  BookOpen,
  CircleQuestionMark,
  HeartHandshake,
  House,
  MessageCircle,
  Search,
  ShoppingBasket,
  Store,
  Truck,
  UtensilsCrossed,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useRef } from "react";

import { CartButton } from "@/components/cart/cart-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { ariaCurrent, MobileNav, type NavLink } from "@/components/mobile-nav";
import { SearchForm } from "@/components/search-form";
import { Container } from "@/components/ui/container";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type NavbarProps = {
  lang: Locale;
  /** Texts of the navigation: common.nav from the dictionary */
  labels: CommonDict["nav"];
  /** Texts of the cart icon: common.cartButton from the dictionary */
  cartLabels: CommonDict["cartButton"];
};

const iconButtonStyles =
  "grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-brand-50 hover:text-brand-800";

/**
 * Sticky header of the public website: logo, main links (desktop), search,
 * language switch, cart and the hamburger menu (phones and tablets).
 * URLs use French slugs in both languages: /fr/produits and /ar/produits.
 */
export function Navbar({ lang, labels, cartLabels }: NavbarProps) {
  const links: NavLink[] = [
    { href: localePath(lang, "/produits"), label: labels.products, icon: ShoppingBasket },
    { href: localePath(lang, "/restaurants"), label: labels.restaurants, icon: UtensilsCrossed },
    { href: localePath(lang, "/artisans"), label: labels.producers, icon: Store },
    { href: localePath(lang, "/a-propos"), label: labels.about, icon: HeartHandshake },
    { href: localePath(lang, "/contact"), label: labels.contact, icon: MessageCircle },
  ];
  const helpLinks: NavLink[] = [
    { href: localePath(lang, "/guide-sans-gluten"), label: labels.guide, icon: BookOpen },
    { href: localePath(lang, "/faq"), label: labels.faq, icon: CircleQuestionMark },
    { href: localePath(lang, "/suivi"), label: labels.track, icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-lg backdrop-saturate-150">
      <Container className="flex h-16 items-center gap-2 lg:h-[4.5rem] lg:gap-6">
        <Link href={localePath(lang)} aria-label={labels.homeLink} className="shrink-0 rounded-xl">
          <Logo />
        </Link>

        <nav aria-label={labels.mainNavigation} className="hidden flex-1 justify-center lg:flex">
          {/* usePathname() is only known in the browser for some pages: keep it inside <Suspense> */}
          <Suspense fallback={<DesktopLinks links={links} pathname={null} />}>
            <ActiveDesktopLinks links={links} />
          </Suspense>
        </nav>

        {/* no gap under 340 px: logo + 3 round buttons need every pixel of a 320 px screen */}
        <div className="ms-auto flex items-center gap-0 min-[340px]:gap-0.5 sm:gap-1 lg:ms-0">
          <SearchButton lang={lang} labels={labels} />
          <LanguageSwitcher
            lang={lang}
            label={labels.language}
            title={labels.switchTo}
            className="me-1 hidden sm:inline-flex"
          />
          <CartButton href={localePath(lang, "/panier")} label={cartLabels.label} countLabel={cartLabels.items} />
          <MobileNav
            lang={lang}
            links={[{ href: localePath(lang), label: labels.home, icon: House }, ...links]}
            helpLinks={helpLinks}
            labels={labels}
            className="lg:hidden"
          />
        </div>
      </Container>
    </header>
  );
}

function DesktopLinks({ links, pathname }: { links: NavLink[]; pathname: string | null }) {
  return (
    <ul className="flex items-center gap-1">
      {links.map((link) => {
        const current = ariaCurrent(pathname, link.href);
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={current}
              className={cn(
                "relative inline-flex h-10 items-center rounded-full px-3.5 text-[15px] font-semibold whitespace-nowrap transition-colors xl:px-4",
                current ? "text-brand-700" : "text-ink-muted hover:bg-canvas hover:text-ink",
              )}
            >
              {link.label}
              {/* a small "door stud" under the current section */}
              <span
                aria-hidden="true"
                className={cn(
                  "absolute inset-x-0 bottom-0.5 mx-auto size-1.5 rounded-full bg-brand-500 transition-opacity",
                  current ? "opacity-100" : "opacity-0",
                )}
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ActiveDesktopLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  return <DesktopLinks links={links} pathname={pathname} />;
}

const SEARCH_PANEL_ID = "site-search-panel";

// Older browsers (e.g. iOS 16) don't know popovers: there the search button and panel
// are simply hidden instead of breaking the header (phones still have the menu's search box).
const hiddenWithoutPopovers = "not-supports-[selector(:popover-open)]:hidden";

/**
 * Magnifier button that opens a search bar right under the header.
 * It uses the browser's native "popover": it closes with Escape or a click
 * outside without extra code, and the button announces itself as expanded.
 */
function SearchButton({ lang, labels }: { lang: Locale; labels: CommonDict["nav"] }) {
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <button type="button" popoverTarget={SEARCH_PANEL_ID} className={cn(iconButtonStyles, hiddenWithoutPopovers)}>
        <Search className="size-[21px]" aria-hidden="true" />
        <span className="sr-only">{labels.search}</span>
      </button>
      <div
        ref={panelRef}
        id={SEARCH_PANEL_ID}
        popover="auto"
        onToggle={(event) => {
          // put the cursor in the search field as soon as the panel opens
          if (event.newState === "open") panelRef.current?.querySelector("input")?.focus();
        }}
        className={cn(
          "inset-x-0 top-16 bottom-auto m-0 w-full max-w-none border-0 bg-white p-0 text-ink shadow-lift lg:top-[4.5rem]",
          hiddenWithoutPopovers,
        )}
      >
        <Container className="py-4 sm:py-5">
          <SearchForm
            lang={lang}
            label={labels.search}
            placeholder={labels.searchPlaceholder}
            submitLabel={labels.search}
            onSubmit={() => panelRef.current?.hidePopover()}
            className="mx-auto max-w-2xl"
          />
        </Container>
      </div>
    </>
  );
}
