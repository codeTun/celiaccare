import { Headset, Mail, MessagesSquare, Phone } from "lucide-react";
import Link from "next/link";

import { WhatsAppIcon } from "@/components/social-icons";
import { buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/**
 * "Une question sur votre commande ? Contactez CeliacCare", on the checkout, the confirmation and the
 * tracking page: CeliacCare's OWN contacts (lib/site-config.ts) as buttons (call, WhatsApp, e-mail,
 * contact form). Every order is followed by CeliacCare, never by the business directly.
 * No hooks: usable in Server and Client Components.
 */
export function OrderHelp({
  lang,
  texts,
  text,
  id,
  headingLevel = 3,
  className,
}: {
  lang: Locale;
  /** dict.checkout.help */
  texts: CheckoutDict["help"];
  /** texts.checkoutText (before ordering) or texts.orderText (confirmation, tracking) */
  text: string;
  /** id of the title (unique in the page) */
  id: string;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const button = buttonStyles({ variant: "outline", size: "sm" });

  return (
    <section aria-labelledby={id} className={cn("rounded-2xl border border-line bg-canvas/60 p-5", className)}>
      <Heading id={id} className="flex items-center gap-2 text-base font-bold text-ink">
        <Headset className="size-5 shrink-0 text-brand-700" aria-hidden="true" />
        {texts.title}
      </Heading>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{text}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        <li>
          <a
            href={`tel:${siteConfig.phone.replace(/\s/g, "")}`}
            aria-label={`${texts.call} ${siteConfig.phone}`}
            className={button}
          >
            <Phone aria-hidden="true" />
            <span dir="ltr">{siteConfig.phone}</span>
          </a>
        </li>
        <li>
          <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className={button}>
            <WhatsAppIcon />
            {texts.whatsapp}
          </a>
        </li>
        <li>
          <a href={`mailto:${siteConfig.email}`} aria-label={`${texts.email} ${siteConfig.email}`} className={button}>
            <Mail aria-hidden="true" />
            <span dir="ltr">{siteConfig.email}</span>
          </a>
        </li>
        <li>
          <Link href={`${localePath(lang, "/contact")}?sujet=commande#formulaire`} className={button}>
            <MessagesSquare aria-hidden="true" />
            {texts.form}
          </Link>
        </li>
      </ul>
    </section>
  );
}
