"use client";

import { ChevronRight, Clock, Mail, Menu, Phone, X, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";

import { LanguageSwitcher } from "@/components/language-switcher";
import { Logo } from "@/components/logo";
import { SearchForm } from "@/components/search-form";
import { WhatsAppIcon } from "@/components/social-icons";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/** A menu link. `href` already contains the language, e.g. "/fr/produits". */
export type NavLink = { href: string; label: string; icon: LucideIcon };

/**
 * Is this menu link the current page, or one of its sub-pages?
 * "/fr/produits" is active on "/fr/produits" and on "/fr/produits/couscous-de-mais".
 * The home link ("/fr") is only active on the home page itself.
 */
export function isActivePath(pathname: string, href: string) {
  const isHomeLink = href.split("/").filter(Boolean).length === 1;
  if (isHomeLink) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** aria-current value: "page" on the page itself, "true" on its sub-pages. */
export function ariaCurrent(pathname: string | null, href: string): "page" | "true" | undefined {
  if (pathname === null || !isActivePath(pathname, href)) return undefined;
  return pathname === href ? "page" : "true";
}

type MobileNavProps = {
  lang: Locale;
  /** Main links (home, products, restaurants...) */
  links: NavLink[];
  /** Help links (guide, FAQ, order tracking) */
  helpLinks: NavLink[];
  /** Texts of the navigation: common.nav from the dictionary */
  labels: CommonDict["nav"];
  /** Classes of the hamburger button (e.g. "lg:hidden") */
  className?: string;
};

/**
 * Hamburger button + slide-over menu for phones and tablets.
 * Built on the native <dialog> element: the browser traps the focus inside,
 * closes it with Escape (or the Android back gesture) and gives the focus back
 * to the button. It also closes on a click outside, on a link and on navigation.
 */
export function MobileNav({ lang, links, helpLinks, labels, className }: MobileNavProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = useCallback(() => dialogRef.current?.close(), []);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
        className={cn(
          "grid size-11 place-items-center rounded-full text-ink transition-colors hover:bg-brand-50 hover:text-brand-800",
          className,
        )}
      >
        <Menu className="size-6" aria-hidden="true" />
        <span className="sr-only">{labels.openMenu}</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label={labels.menu}
        // A click on the dimmed backdrop (outside the panel) closes the menu.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className={cn(
          // a full-height panel stuck to the end side of the screen (right in French, left in Arabic)
          "fixed inset-y-0 start-auto end-0 m-0 h-dvh max-h-none w-[min(24rem,calc(100vw-2.5rem))] max-w-none overflow-hidden border-0 bg-white p-0 text-ink shadow-lift",
          "backdrop:bg-brand-950/40 backdrop:backdrop-blur-[2px]",
          // slides in from the side (no animation for people who prefer reduced motion)
          "transition-transform duration-300 ease-out starting:open:translate-x-full rtl:starting:open:-translate-x-full motion-reduce:transition-none",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line ps-5 pe-3">
            <Logo />
            <button
              type="button"
              onClick={close}
              className="grid size-11 place-items-center rounded-full text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
            >
              <X className="size-6" aria-hidden="true" />
              <span className="sr-only">{labels.closeMenu}</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-8">
            <SearchForm
              lang={lang}
              label={labels.search}
              placeholder={labels.searchPlaceholder}
              submitLabel={labels.search}
              onSubmit={close}
            />

            <nav aria-label={labels.mainNavigation} className="mt-5">
              <Suspense fallback={<MainLinks links={links} pathname={null} onNavigate={close} />}>
                <ActiveMainLinks links={links} onNavigate={close} />
              </Suspense>
            </nav>

            <SectionTitle className="mt-7">{labels.helpTitle}</SectionTitle>
            <ul className="mt-2 grid gap-0.5">
              {helpLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={close}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
                  >
                    <Icon className="size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            <SectionTitle className="mt-7">{labels.language}</SectionTitle>
            <LanguageSwitcher
              lang={lang}
              label={labels.language}
              title={labels.switchTo}
              variant="full"
              onNavigate={close}
              className="mt-3"
            />

            <div className="mt-8 rounded-[var(--radius-card)] bg-canvas p-4">
              <SectionTitle>{labels.contactTitle}</SectionTitle>
              <ul className="mt-3 grid gap-1 text-sm">
                <li>
                  <ContactRow href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} icon={Phone}>
                    <span dir="ltr">{siteConfig.phone}</span>
                  </ContactRow>
                </li>
                <li>
                  <ContactRow href={`https://wa.me/${siteConfig.whatsapp}`} icon={WhatsAppIcon} external>
                    {labels.whatsapp}
                  </ContactRow>
                </li>
                <li>
                  <ContactRow href={`mailto:${siteConfig.email}`} icon={Mail}>
                    <span dir="ltr">{siteConfig.email}</span>
                  </ContactRow>
                </li>
                <li className="flex items-center gap-3 px-2 py-2 text-ink-muted">
                  <Clock className="size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
                  <span>
                    <span className="sr-only">{labels.hours} : </span>
                    {/* the opening hours in lib/site-config.ts are written in French */}
                    <span>{lang === "ar" ? siteConfig.openingHoursAr : siteConfig.openingHours}</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Suspense fallback={null}>
          <CloseOnNavigation onNavigate={close} />
        </Suspense>
      </dialog>
    </>
  );
}

function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-bold tracking-[0.14em] text-brand-700 uppercase rtl:tracking-normal", className)}>
      {children}
    </p>
  );
}

function MainLinks({
  links,
  pathname,
  onNavigate,
}: {
  links: NavLink[];
  pathname: string | null;
  onNavigate: () => void;
}) {
  return (
    <ul className="grid gap-1">
      {links.map(({ href, label, icon: Icon }) => {
        const current = ariaCurrent(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={current}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-base font-semibold transition-colors",
                current ? "bg-brand-50 text-brand-800" : "text-ink hover:bg-canvas",
              )}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl",
                  current ? "bg-white text-brand-700 shadow-soft" : "bg-canvas text-brand-700",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
              </span>
              {label}
              <ChevronRight className="ms-auto size-4 text-ink-subtle rtl:rotate-180" aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** usePathname() is only known in the browser for some pages: it must sit inside <Suspense>. */
function ActiveMainLinks({ links, onNavigate }: { links: NavLink[]; onNavigate: () => void }) {
  const pathname = usePathname();
  return <MainLinks links={links} pathname={pathname} onNavigate={onNavigate} />;
}

function ContactRow({
  href,
  icon: Icon,
  external = false,
  children,
}: {
  href: string;
  icon: LucideIcon | typeof WhatsAppIcon;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-3 rounded-xl px-2 py-2 font-medium text-ink transition-colors hover:bg-white hover:text-brand-800"
    >
      <Icon className="size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
      {children}
    </a>
  );
}

/** Closes the menu whenever the page changes (links, search, browser back/forward). */
function CloseOnNavigation({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  useEffect(() => {
    onNavigate();
  }, [pathname, query, onNavigate]);
  return null;
}
