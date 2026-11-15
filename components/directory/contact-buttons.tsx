import { Globe, Phone } from "lucide-react";

import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/social-icons";
import { buttonStyles } from "@/components/ui/button";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { cn } from "@/lib/utils";

import type { SheetLabels } from "./labels";
import { facebookUrl, instagramUrl, telHref, websiteUrl, whatsappHref } from "./links";

/** How to reach a restaurant or an artisan (null = not known). */
export type ContactLinks = {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
};

const externalLink = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * "Appeler" and "WhatsApp" buttons + round buttons for the website and social networks.
 * `primary` paints one of them green (keep one primary button per view).
 */
export function ContactButtons({
  contact,
  common,
  labels,
  primary,
  className,
}: {
  contact: ContactLinks;
  common: CommonDict;
  labels: SheetLabels;
  primary?: "call" | "whatsapp";
  className?: string;
}) {
  const networkLabel = (network: string) => interpolate(labels.networkOf, { network, name: contact.name });

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {contact.phone ? (
        <a
          href={telHref(contact.phone)}
          className={buttonStyles({
            variant: primary === "call" ? "primary" : "outline",
            className: "flex-1 sm:flex-none",
          })}
        >
          <Phone aria-hidden="true" />
          {common.actions.call}
        </a>
      ) : null}
      {contact.whatsapp ? (
        <a
          href={whatsappHref(contact.whatsapp)}
          {...externalLink}
          className={buttonStyles({
            variant: primary === "whatsapp" ? "primary" : "outline",
            className: "flex-1 sm:flex-none",
          })}
        >
          <WhatsAppIcon className="size-4" />
          {common.actions.whatsapp}
        </a>
      ) : null}
      {contact.website ? (
        <a
          href={websiteUrl(contact.website)}
          {...externalLink}
          aria-label={networkLabel(common.actions.website)}
          title={common.actions.website}
          className={buttonStyles({ variant: "outline", size: "icon" })}
        >
          <Globe aria-hidden="true" />
        </a>
      ) : null}
      {contact.instagram ? (
        <a
          href={instagramUrl(contact.instagram)}
          {...externalLink}
          aria-label={networkLabel(labels.instagram)}
          title={labels.instagram}
          className={buttonStyles({ variant: "outline", size: "icon" })}
        >
          <InstagramIcon className="size-5" />
        </a>
      ) : null}
      {contact.facebook ? (
        <a
          href={facebookUrl(contact.facebook)}
          {...externalLink}
          aria-label={networkLabel(labels.facebook)}
          title={labels.facebook}
          className={buttonStyles({ variant: "outline", size: "icon" })}
        >
          <FacebookIcon className="size-5" />
        </a>
      ) : null}
    </div>
  );
}
