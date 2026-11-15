import { Clock, Info, Mail, Phone, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { CurrentYear } from "@/components/current-year";
import { Logo } from "@/components/logo";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social-icons";
import { Container } from "@/components/ui/container";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

type FooterColumn = { title: string; links: { label: string; href: string }[] };

/**
 * Dark green footer of the public website: mission, links, contact details,
 * the medical disclaimer (spec §6.5) and the copyright line.
 * Contact details and social networks come from lib/site-config.ts.
 */
export function Footer({ lang, common }: { lang: Locale; common: CommonDict }) {
  const path = (to: string) => localePath(lang, to);

  const columns: FooterColumn[] = [
    {
      title: common.footer.explore,
      links: [
        { label: common.nav.products, href: path("/produits") },
        { label: common.nav.restaurants, href: path("/restaurants") },
        { label: common.nav.producers, href: path("/artisans") },
        { label: common.nav.about, href: path("/a-propos") },
      ],
    },
    {
      title: common.footer.help,
      links: [
        { label: common.nav.faq, href: path("/faq") },
        { label: common.nav.guide, href: path("/guide-sans-gluten") },
        { label: common.nav.track, href: path("/suivi") },
        { label: common.nav.contact, href: path("/contact") },
        // the contact form opens with the right subject already chosen
        { label: common.footer.becomePartner, href: `${path("/contact")}?sujet=PARTNERSHIP` },
        { label: common.footer.suggestPlace, href: `${path("/contact")}?sujet=SUGGESTION` },
      ],
    },
    {
      title: common.footer.legal,
      links: [
        { label: common.footer.legalNotice, href: path("/mentions-legales") },
        { label: common.footer.privacy, href: path("/confidentialite") },
        { label: common.footer.terms, href: path("/conditions") },
      ],
    },
  ];

  // Only the social networks filled in lib/site-config.ts are shown.
  const socialLinks = [
    { url: siteConfig.instagram, label: common.footer.onInstagram, icon: InstagramIcon },
    { url: siteConfig.facebook, label: common.footer.onFacebook, icon: FacebookIcon },
  ].filter((social) => social.url !== "");

  return (
    <footer className="bg-brand-950 bg-khatam-light text-brand-100">
      <Container className="pt-14 pb-8 sm:pt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand and mission */}
          <div className="lg:col-span-3">
            <Link href={path("/")} aria-label={common.nav.homeLink} className="inline-flex rounded-xl">
              <Logo tone="light" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-100/75">{common.footer.aboutText}</p>
            {socialLinks.length > 0 ? (
              <div className="mt-6">
                <p className="text-xs font-semibold text-brand-200/80">{common.footer.followUs}</p>
                <ul className="mt-3 flex gap-2">
                  {socialLinks.map(({ url, label, icon: Icon }) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="grid size-10 place-items-center rounded-full bg-white/[0.07] text-brand-100 transition-colors hover:bg-white/15 hover:text-white"
                      >
                        <Icon className="size-[18px]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:col-span-6">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <ColumnTitle>{column.title}</ColumnTitle>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-brand-100/75 underline-offset-4 transition-colors hover:text-white hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <ColumnTitle>{common.footer.contactUs}</ColumnTitle>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <ContactItem href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} icon={Phone}>
                  <span className="sr-only">{common.labels.phone} : </span>
                  <span dir="ltr">{siteConfig.phone}</span>
                </ContactItem>
              </li>
              <li>
                <ContactItem href={`https://wa.me/${siteConfig.whatsapp}`} icon={WhatsAppIcon} external>
                  {common.footer.whatsappCta}
                </ContactItem>
              </li>
              <li>
                <ContactItem href={`mailto:${siteConfig.email}`} icon={Mail}>
                  <span className="sr-only">{common.labels.email} : </span>
                  <span dir="ltr">{siteConfig.email}</span>
                </ContactItem>
              </li>
              <li>
                <ContactItem icon={Clock}>
                  <span className="sr-only">{common.labels.hours} : </span>
                  {/* the opening hours in lib/site-config.ts are written in French */}
                  <span>{lang === "ar" ? siteConfig.openingHoursAr : siteConfig.openingHours}</span>
                </ContactItem>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical disclaimer, visible on every page (spec §6.5) */}
        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs leading-relaxed text-brand-100/75 sm:p-5">
          <Info className="mt-px size-4 shrink-0 text-saffron-300" aria-hidden="true" />
          <div>
            <p className="font-semibold text-white">{common.disclaimer.title}</p>
            <p className="mt-0.5">{common.disclaimer.text}</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-brand-100/65 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}. {common.footer.rights}
          </p>
          <p className="inline-flex items-center gap-2">
            <JasmineFlower className="size-4" />
            {common.footer.madeIn}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function ColumnTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xs font-bold tracking-[0.14em] text-white uppercase rtl:tracking-normal">{children}</h2>
  );
}

/** One line of the contact list: an icon and a link (or plain text without `href`). */
function ContactItem({
  href,
  icon: Icon,
  external = false,
  children,
}: {
  href?: string;
  icon: LucideIcon | typeof WhatsAppIcon;
  external?: boolean;
  children: ReactNode;
}) {
  const content = (
    <>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.07] text-brand-200">
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <span>{children}</span>
    </>
  );
  const styles = "flex items-center gap-3 py-0.5";

  if (!href) return <div className={cn(styles, "text-brand-100/75")}>{content}</div>;
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(styles, "text-brand-100/85 transition-colors hover:text-white")}
    >
      {content}
    </a>
  );
}

/** Tiny jasmine flower (Tunisia's flower, from the logo) next to "Fait avec soin en Tunisie". */
function JasmineFlower({ className }: { className?: string }) {
  return (
    <svg viewBox="-16 -16 32 32" className={className} aria-hidden="true">
      <g fill="#ffffff">
        {[0, 1, 2, 3, 4].map((petal) => (
          <path
            key={petal}
            d="M0 0C-5.4-2.4-6.6-10.6-.9-14 3.4-11.6 4.6-4.2 0 0Z"
            transform={`rotate(${petal * 72 - 8})`}
          />
        ))}
      </g>
      <circle r="2.8" fill="#F2B93B" />
    </svg>
  );
}
