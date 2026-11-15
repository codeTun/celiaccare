import type { CommonDict } from "@/i18n/resources/fr/common";

import type { AddToCartLabels } from "./add-to-cart-button";

/** Build the labels of <AddToCartButton> from the common dictionary. */
export function cartLabels(common: CommonDict): AddToCartLabels {
  return {
    add: common.actions.addToCart,
    added: common.actions.added,
    unavailable: common.labels.unavailable,
    promptTitle: common.cartPrompt.title,
    promptText: common.cartPrompt.text,
    promptConfirm: common.cartPrompt.confirm,
    promptCancel: common.cartPrompt.cancel,
    close: common.actions.close,
  };
}
