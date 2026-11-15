import { Mail } from "lucide-react";
import Link from "next/link";

import { LogoEmblem } from "@/components/logo";
import { WhatsAppIcon } from "@/components/social-icons";
import { buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

/**
 * Dark green band "Une question reste sans réponse ?" with links to the contact
 * form and to WhatsApp. Shown at the bottom of the help and legal pages.
 */
export function HelpCta({ lang, className }: { lang: Locale; className?: string }) {
  const { content } = getDictionary(lang);

  return (
    <section
      aria-labelledby="help-cta-title"
      className={cn(
        "relative isolate overflow-hidden rounded-[var(--radius-card)] bg-brand-900 px-6 py-10 text-white sm:px-10 sm:py-12",
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam-light" />
      {/* the jasmine doorway of the logo, as a large watermark */}
      <LogoEmblem className="absolute -end-8 -bottom-10 -z-10 size-44 opacity-[0.12] sm:size-56" />

      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        <div className="max-w-xl">
          <h2 id="help-cta-title" className="text-2xl font-extrabold sm:text-[1.7rem]">
            {content.help.title}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-brand-100/80">{content.help.text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
          <Link href={localePath(lang, "/contact")} className={buttonStyles({ variant: "white", size: "lg" })}>
            <Mail aria-hidden="true" />
            {content.help.contact}
          </Link>
          <a
            href={`https://wa.me/${siteConfig.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonStyles({
              variant: "outline",
              size: "lg",
              className: "border-white/30 bg-transparent text-white hover:border-white/60 hover:bg-white/10",
            })}
          >
            <WhatsAppIcon />
            {content.help.whatsapp}
            <span className="sr-only">{content.shared.newTab}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
