import { CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

/** Short reassuring points under a page title: "✓ Livraison à domicile  ✓ Paiement à la livraison". */
export function HeroHighlights({ items, className }: { items: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2.5", className)}>
      {items.map((item) => (
        <li key={item} className="flex items-center gap-2 text-sm font-semibold text-ink">
          <CircleCheck className="size-[18px] shrink-0 text-brand-600" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
