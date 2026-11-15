import { VEHICLE_LABELS } from "@/components/admin/delivery/delivery-labels";
import type { AdminDelivererRow } from "@/types/admin-data";

import type { DelivererOption } from "./assign-deliverer-form";

/** "Sfax, Gabès, Médenine, Gafsa…" — the zone is free text and can be long. */
function shorten(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Label of a deliverer in the select: "Sami Trabelsi · Moto · Tunis · 2 en cours". */
function delivererLabel(deliverer: AdminDelivererRow) {
  const parts = [deliverer.name, VEHICLE_LABELS[deliverer.vehicle] ?? deliverer.vehicle];
  if (deliverer.zone) parts.push(shorten(deliverer.zone, 28));
  parts.push(deliverer.activeOrderCount > 0 ? `${deliverer.activeOrderCount} en cours` : "disponible");
  return parts.join(" · ");
}

/**
 * Choices of the deliverer select (AssignDelivererForm): the ACTIVE deliverers, plus the current
 * one of the order when it was deactivated since, so the select always shows the truth.
 */
export function delivererOptions(deliverers: AdminDelivererRow[], currentId: number | null): DelivererOption[] {
  return deliverers
    .filter((deliverer) => deliverer.isActive || deliverer.id === currentId)
    .map((deliverer) => ({
      id: deliverer.id,
      label: deliverer.isActive ? delivererLabel(deliverer) : `${deliverer.name} (désactivé)`,
    }));
}
