import {
  ArrowRight,
  Clock,
  Handshake,
  Mail,
  MapPin,
  MapPinPlus,
  PackageSearch,
  Phone,
  CircleQuestionMark,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/components/social-icons";
import { buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/**
 * Right-hand column of the contact page: our contact details (from
 * lib/site-config.ts), "Devenir partenaire" and "Proposer une adresse".
 */
export function ContactAside({ lang }: { lang: Locale }) {
  const { contact } = getDictionary(lang);
  // The partner and suggestion links open the form with the right topic already chosen.
  const formLink = (topic: "PARTNERSHIP" | "SUGGESTION") => `${localePath(lang, "/contact")}?sujet=${topic}#formulaire`;

  return (
    <div className="space-y-5">
      {/* Contact details */}
      <section aria-labelledby="contact-details-title" className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-6">
        <h2 id="contact-details-title" className="text-lg font-bold text-ink">
          {contact.details.title}
        </h2>
        <ul className="mt-3 divide-y divide-line">
          <DetailRow icon={Phone} label={contact.details.phone} href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}>
            <span dir="ltr">{siteConfig.phone}</span>
          </DetailRow>
          <DetailRow
            icon={WhatsAppIcon}
            label={contact.details.whatsapp}
            href={`https://wa.me/${siteConfig.whatsapp}`}
            external={contact.details.newTab}
          >
            {contact.details.whatsappText}
          </DetailRow>
          <DetailRow icon={Mail} label={contact.details.email} href={`mailto:${siteConfig.email}`}>
            <span dir="ltr">{siteConfig.email}</span>
          </DetailRow>
          <DetailRow icon={Clock} label={contact.details.hours}>
            {contact.details.hoursValue}
          </DetailRow>
          <DetailRow icon={MapPin} label={contact.details.location}>
            {contact.details.locationValue}
          </DetailRow>
        </ul>
      </section>

      {/* Become a partner */}
      <section
        aria-labelledby="contact-partner-title"
        className="relative isolate overflow-hidden rounded-[var(--radius-card)] bg-brand-900 p-6 text-white sm:p-7"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam-light" />
        <span className="grid size-11 place-items-center rounded-2xl bg-white/10 text-brand-200 ring-1 ring-white/15">
          <Handshake className="size-5" aria-hidden="true" />
        </span>
        <h2 id="contact-partner-title" className="mt-4 text-xl font-extrabold">
          {contact.partner.title}
        </h2>
        <p className="mt-2 text-[15px] leading-relaxed text-brand-100/85">{contact.partner.text}</p>
        <ol className="mt-5 space-y-3">
          {contact.partner.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-brand-50">
              <span className="grid size-6 shrink-0 place-items-center rounded-full bg-saffron-400 text-xs font-bold text-brand-950 tabular">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-white/10 pt-4 text-xs leading-relaxed text-brand-100/70">{contact.partner.note}</p>
        <Link href={formLink("PARTNERSHIP")} className={buttonStyles({ variant: "white", className: "mt-5 w-full sm:w-auto" })}>
          {contact.partner.cta}
          <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
        </Link>
      </section>

      {/* Suggest a place */}
      <section aria-labelledby="contact-suggest-title" className="rounded-[var(--radius-card)] border border-line bg-white p-6 shadow-soft">
        <div className="flex items-start gap-3.5">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
            <MapPinPlus className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="contact-suggest-title" className="text-lg font-bold text-ink">
              {contact.suggest.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{contact.suggest.text}</p>
          </div>
        </div>
        <Link href={formLink("SUGGESTION")} className={buttonStyles({ variant: "outline", className: "mt-5 w-full sm:w-auto" })}>
          {contact.suggest.cta}
          <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

/** Two shortcuts shown with the form: order tracking and the FAQ. */
export function ContactShortcuts({ lang }: { lang: Locale }) {
  const { contact } = getDictionary(lang);
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      <ShortcutCard
        href={localePath(lang, "/suivi")}
        icon={PackageSearch}
        title={contact.order.title}
        text={contact.order.text}
        cta={contact.order.cta}
      />
      <ShortcutCard
        href={localePath(lang, "/faq")}
        icon={CircleQuestionMark}
        title={contact.faq.title}
        text={contact.faq.text}
        cta={contact.faq.cta}
      />
    </ul>
  );
}

/** One line of the contact details: icon, small label and value (a link when `href` is given). */
function DetailRow({
  icon: Icon,
  label,
  href,
  external,
  children,
}: {
  icon: LucideIcon | typeof WhatsAppIcon;
  label: string;
  href?: string;
  /** For external links: the screen-reader text "(opens in a new tab)" */
  external?: string;
  children: ReactNode;
}) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="size-[18px]" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-ink-subtle">{label}</span>
        <span className={cn("block font-semibold break-words text-ink", href && "group-hover:text-brand-800")}>
          {children}
        </span>
      </span>
    </>
  );
  const rowStyles = "flex items-center gap-3.5 py-3";

  return (
    <li>
      {href ? (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(rowStyles, "group -mx-2 rounded-xl px-2 transition-colors hover:bg-canvas")}
        >
          {content}
          {external ? <span className="sr-only">{external}</span> : null}
        </a>
      ) : (
        <div className={rowStyles}>{content}</div>
      )}
    </li>
  );
}

function ShortcutCard({
  href,
  icon: Icon,
  title,
  text,
  cta,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-canvas/60 p-5 transition-colors hover:border-brand-200 hover:bg-brand-50/60"
      >
        <Icon className="size-5 text-brand-600" aria-hidden="true" />
        <span className="mt-3 font-bold text-ink">{title}</span>
        <span className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted">{text}</span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
          {cta}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
        </span>
      </Link>
    </li>
  );
}
