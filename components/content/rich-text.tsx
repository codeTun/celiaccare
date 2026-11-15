import Link from "next/link";
import { Fragment } from "react";

import { localePath } from "@/i18n/config";
import type { Locale } from "@/types";

/* ==========================================================================
   Inline formatting for the texts written in data/*.ts:
     **important words**       -> <strong>
     [link text](/contact)     -> link; internal paths get the language: /fr/contact
     [site](https://...)       -> external link, opened in a new tab
     [e-mail](mailto:...)      -> e-mail or phone link
   ========================================================================== */

const BOLD = /^\*\*([^*]+)\*\*$/;
const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
// Splits a text around the markers, keeping the markers in the result.
const MARKERS = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;

export const richLinkStyles =
  "font-semibold text-brand-700 underline decoration-brand-300 decoration-from-font underline-offset-4 transition-colors hover:text-brand-800 hover:decoration-brand-600";

export function RichText({ text, lang }: { text: string; lang: Locale }) {
  const parts = text.split(MARKERS).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        const bold = BOLD.exec(part);
        if (bold) {
          return (
            <strong key={index} className="font-semibold text-ink">
              {bold[1]}
            </strong>
          );
        }

        const link = LINK.exec(part);
        if (link) {
          const [, label, href] = link;
          return <ContentLink key={index} href={href} label={label} lang={lang} />;
        }

        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}

function ContentLink({ href, label, lang }: { href: string; label: string; lang: Locale }) {
  // Internal page of the website: add the language and use Next.js navigation.
  if (href.startsWith("/")) {
    return (
      <Link href={localePath(lang, href)} className={richLinkStyles}>
        {label}
      </Link>
    );
  }
  // Another website: open it in a new tab.
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={richLinkStyles}>
        {label}
      </a>
    );
  }
  // mailto: and tel: links (always written left-to-right).
  return (
    <a href={href} dir="ltr" className={richLinkStyles}>
      {label}
    </a>
  );
}

/** The same text without the markers, for search engines (JSON-LD) and meta descriptions. */
export function toPlainText(text: string) {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");
}
