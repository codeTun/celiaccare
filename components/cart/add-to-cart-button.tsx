"use client";

import { Check, ShoppingBasket } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { interpolate } from "@/i18n/interpolate";

import { useCart, type AddToCartInput } from "./cart-provider";

export type AddToCartLabels = {
  add: string;
  added: string;
  unavailable: string;
  promptTitle: string;
  promptText: string; // contains {name}
  promptConfirm: string;
  promptCancel: string;
  close: string;
};

/**
 * "Add to cart" button for a product or a dish.
 * If the cart already holds items from another merchant, it asks before emptying it.
 * Labels come from the dictionary: see `cartLabels()` in components/cart/labels.ts.
 */
export function AddToCartButton({
  item,
  labels,
  disabled,
  variant = "primary",
  size = "md",
  iconOnly = false,
  className,
}: {
  item: AddToCartInput;
  labels: AddToCartLabels;
  disabled?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
}) {
  const { add, replaceWith } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [conflict, setConflict] = useState<string | null>(null);

  useEffect(() => {
    if (!justAdded) return;
    const timer = window.setTimeout(() => setJustAdded(false), 1600);
    return () => window.clearTimeout(timer);
  }, [justAdded]);

  function handleClick() {
    const result = add(item);
    if (result.ok) setJustAdded(true);
    else setConflict(result.currentMerchant);
  }

  const label = disabled ? labels.unavailable : justAdded ? labels.added : labels.add;
  // An icon-only button names its product ("Ajouter au panier : Makroudh"), so the buttons of a
  // product grid are not all read as the same "Ajouter au panier".
  const accessibleName = iconOnly ? `${label} : ${item.name}` : undefined;

  return (
    <>
      <Button
        variant={justAdded ? "secondary" : variant}
        size={iconOnly ? (size === "sm" ? "icon-sm" : "icon") : size}
        disabled={disabled}
        onClick={handleClick}
        className={className}
        aria-label={accessibleName}
      >
        {justAdded ? <Check aria-hidden="true" /> : <ShoppingBasket aria-hidden="true" />}
        {iconOnly ? null : <span>{label}</span>}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">
        {justAdded ? labels.added : ""}
      </span>
      <Dialog
        open={conflict !== null}
        onClose={() => setConflict(null)}
        title={labels.promptTitle}
        closeLabel={labels.close}
      >
        <p className="text-sm leading-relaxed text-ink-muted">
          {interpolate(labels.promptText, { name: conflict ?? "" })}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setConflict(null)}>
            {labels.promptCancel}
          </Button>
          <Button
            onClick={() => {
              replaceWith(item);
              setConflict(null);
              setJustAdded(true);
            }}
          >
            {labels.promptConfirm}
          </Button>
        </div>
      </Dialog>
    </>
  );
}
