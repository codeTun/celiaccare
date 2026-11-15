import type { BadgeTone } from "@/components/ui/badge";
import type { OrderStatus, OrderType, PaymentMethod } from "@/types";
import { ORDER_STATUS_TRANSITIONS } from "@/types/admin-data";

/* ==========================================================================
   French texts of the orders back office, shared by the pages, the Server
   Actions (flash codes) and the client components. No server-only code here.
   ========================================================================== */

export const ORDER_TYPE_STYLES: Record<OrderType, { label: string; tone: BadgeTone }> = {
  SHOP: { label: "Épicerie", tone: "brand" },
  RESTAURANT: { label: "Restaurant", tone: "saffron" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: "Espèces à la livraison",
  CARD_ON_DELIVERY: "Carte bancaire à la livraison",
};

/** Labels of the status filter tabs of the orders list (plural: they name groups of orders). */
export const ORDER_STATUS_TAB_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmées",
  PREPARING: "En préparation",
  OUT_FOR_DELIVERY: "En livraison",
  DELIVERED: "Livrées",
  CANCELLED: "Annulées",
};

/** A status the admin can move an order TO (every status except the first one, PENDING). */
export type OrderTargetStatus = Exclude<OrderStatus, "PENDING">;

type StatusAction = {
  /** Text of the button. */
  label: string;
  pendingLabel: string;
  /** ?ok=<code> after the change (see ORDER_FLASH_MESSAGES). */
  flashCode: string;
  flashMessage: string;
};

/** The buttons that move an order forward (or cancel it), in the order of the life cycle. */
export const ORDER_STATUS_ACTIONS: Record<OrderTargetStatus, StatusAction> = {
  CONFIRMED: {
    label: "Confirmer",
    pendingLabel: "Confirmation…",
    flashCode: "confirmee",
    flashMessage: "Commande confirmée. Pensez à prévenir le commerçant et à assigner un livreur.",
  },
  PREPARING: {
    label: "Mettre en préparation",
    pendingLabel: "Mise à jour…",
    flashCode: "en-preparation",
    flashMessage: "La commande est en préparation.",
  },
  OUT_FOR_DELIVERY: {
    label: "Expédier",
    pendingLabel: "Expédition…",
    flashCode: "expediee",
    flashMessage: "La commande est partie avec le livreur.",
  },
  DELIVERED: {
    label: "Marquer livrée",
    pendingLabel: "Mise à jour…",
    flashCode: "livree",
    flashMessage: "Commande marquée comme livrée.",
  },
  CANCELLED: {
    label: "Annuler la commande",
    pendingLabel: "Annulation…",
    flashCode: "annulee",
    flashMessage: "La commande a été annulée.",
  },
};

/** Messages of FlashMessage on the order pages and the delivery board (?ok=<code>). */
export const ORDER_FLASH_MESSAGES: Record<string, string> = {
  ...Object.fromEntries(Object.values(ORDER_STATUS_ACTIONS).map((action) => [action.flashCode, action.flashMessage])),
  "livreur-assigne": "Le livreur a été assigné à la commande.",
  "livreur-retire": "La commande n'a plus de livreur.",
};

/** The next step of an order in its normal life cycle (never CANCELLED), or null when it is finished. */
export function nextForwardStatus(status: OrderStatus): OrderTargetStatus | null {
  const next = ORDER_STATUS_TRANSITIONS[status].find((candidate) => candidate !== "CANCELLED");
  return next && next !== "PENDING" ? next : null;
}

/** Where a status / deliverer change sends the admin back: the order page or the delivery board. */
export const ORDER_RETURN_TARGETS = ["detail", "board"] as const;
export type OrderReturnTarget = (typeof ORDER_RETURN_TARGETS)[number];
