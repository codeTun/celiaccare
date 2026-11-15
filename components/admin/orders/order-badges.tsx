import { MessageCircle, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { formatPhone } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderType } from "@/types";
import { ANONYMIZED_PHONE } from "@/types/admin-data";

import { ORDER_TYPE_STYLES } from "./order-labels";

/** "Épicerie" (green) or "Restaurant" (saffron) pill. */
export function OrderTypeBadge({ type, className }: { type: OrderType; className?: string }) {
  const style = ORDER_TYPE_STYLES[type] ?? { label: type, tone: "neutral" as const };
  return (
    <Badge tone={style.tone} className={className}>
      {style.label}
    </Badge>
  );
}

/** wa.me link of a Tunisian number stored as 8 digits. */
export function whatsappHref(phone: string) {
  return `https://wa.me/216${phone}`;
}

/**
 * A Tunisian phone number written "20 123 456", left-to-right, as a tel: link.
 * Anonymised numbers (retention rule) are shown as "—".
 */
export function PhoneNumber({ phone, className }: { phone: string; className?: string }) {
  if (!phone || phone === ANONYMIZED_PHONE) return <span className="text-ink-subtle">—</span>;
  return (
    <a
      href={`tel:+216${phone}`}
      dir="ltr"
      className={cn("whitespace-nowrap tabular underline-offset-4 hover:text-brand-700 hover:underline", className)}
    >
      {formatPhone(phone)}
    </a>
  );
}

/** "Appeler" + "WhatsApp" buttons for a customer or a delivery person. */
export function PhoneActions({ phone, className }: { phone: string; className?: string }) {
  if (!phone || phone === ANONYMIZED_PHONE) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <a href={`tel:+216${phone}`} className={buttonStyles({ variant: "outline", size: "sm" })}>
        <Phone aria-hidden="true" />
        Appeler
      </a>
      <a
        href={whatsappHref(phone)}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonStyles({ variant: "outline", size: "sm" })}
      >
        <MessageCircle aria-hidden="true" />
        WhatsApp
        <span className="sr-only"> (nouvel onglet)</span>
      </a>
    </div>
  );
}
