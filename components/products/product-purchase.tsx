"use client";

import { Minus, Plus } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { AddToCartButton, type AddToCartLabels } from "@/components/cart/add-to-cart-button";
import { MAX_QUANTITY, type AddToCartInput } from "@/components/cart/cart-provider";
import { cn } from "@/lib/utils";

/* ==========================================================================
   "Add to cart" area of the product sheet: a quantity stepper + the button,
   and the same button in a bar stuck to the bottom of the screen on phones.
   Both share the chosen quantity through <ProductPurchaseProvider>.
   ========================================================================== */

type PurchaseState = {
  quantity: number;
  setQuantity: (quantity: number) => void;
  /** true while the main button is on screen: the phone bar hides then */
  mainButtonVisible: boolean;
  /** Ref of the main purchase box (watched to show or hide the phone bar) */
  mainBoxRef: (element: HTMLElement | null) => void;
};

const PurchaseContext = createContext<PurchaseState | null>(null);

function usePurchase(): PurchaseState {
  const state = useContext(PurchaseContext);
  if (!state) throw new Error("Use the product purchase components inside <ProductPurchaseProvider>.");
  return state;
}

/** Wraps the whole product sheet (Server Components can be passed as children). */
export function ProductPurchaseProvider({ children }: { children: ReactNode }) {
  const [quantity, setQuantity] = useState(1);
  const [mainButtonVisible, setMainButtonVisible] = useState(true);
  const [mainBox, setMainBox] = useState<HTMLElement | null>(null);

  // Watch whether the main purchase box is visible on screen.
  useEffect(() => {
    if (!mainBox) return;
    const observer = new IntersectionObserver(([entry]) => setMainButtonVisible(entry.isIntersecting));
    observer.observe(mainBox);
    return () => observer.disconnect();
  }, [mainBox]);

  return (
    <PurchaseContext.Provider
      value={{
        quantity,
        setQuantity: (value) => setQuantity(Math.min(MAX_QUANTITY, Math.max(1, value))),
        mainButtonVisible,
        mainBoxRef: setMainBox,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  );
}

export type QuantityLabels = { quantity: string; decrease: string; increase: string };

/** − 2 + */
function QuantityStepper({ labels, disabled, size = "lg" }: { labels: QuantityLabels; disabled?: boolean; size?: "md" | "lg" }) {
  const { quantity, setQuantity } = usePurchase();
  const buttonClass = cn(
    "grid shrink-0 place-items-center rounded-full text-ink transition-colors hover:bg-brand-50 hover:text-brand-800 disabled:pointer-events-none disabled:opacity-40",
    size === "lg" ? "size-11" : "size-9",
  );
  return (
    <div
      role="group"
      aria-label={labels.quantity}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-line-strong bg-white p-0.5",
        disabled && "opacity-50",
      )}
    >
      <button
        type="button"
        className={buttonClass}
        onClick={() => setQuantity(quantity - 1)}
        disabled={disabled || quantity <= 1}
        aria-label={labels.decrease}
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <output aria-live="polite" className="w-8 text-center text-base font-bold text-ink tabular">
        {quantity}
      </output>
      <button
        type="button"
        className={buttonClass}
        onClick={() => setQuantity(quantity + 1)}
        disabled={disabled || quantity >= MAX_QUANTITY}
        aria-label={labels.increase}
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

type PurchaseProps = {
  /** The product, as stored in the cart (the quantity comes from the stepper) */
  item: Omit<AddToCartInput, "quantity">;
  cartLabels: AddToCartLabels;
  quantityLabels: QuantityLabels;
  disabled?: boolean;
};

/** Quantity + "Ajouter au panier", under the price. */
export function ProductPurchaseBox({ item, cartLabels, quantityLabels, disabled, className }: PurchaseProps & { className?: string }) {
  const { quantity, mainBoxRef } = usePurchase();
  return (
    <div ref={mainBoxRef} className={cn("flex flex-wrap items-center gap-3", className)}>
      <QuantityStepper labels={quantityLabels} disabled={disabled} />
      <AddToCartButton
        item={{ ...item, quantity }}
        labels={cartLabels}
        disabled={disabled}
        size="lg"
        className="min-w-0 flex-1 sm:flex-none sm:px-10"
      />
    </div>
  );
}

/**
 * Bar stuck to the bottom of the screen on phones and tablets, shown while the main button
 * is scrolled away. Put it as the LAST child of the sheet: it then stops above the footer.
 */
export function ProductStickyBar({
  item,
  cartLabels,
  quantityLabels,
  disabled,
  price,
  unit,
}: PurchaseProps & {
  /** Price already formatted, e.g. "12,500 DT" */
  price: string;
  unit: string | null;
}) {
  const { quantity, mainButtonVisible } = usePurchase();
  const hidden = mainButtonVisible;
  return (
    <div
      aria-hidden={hidden || undefined}
      inert={hidden}
      className={cn(
        "sticky bottom-0 z-30 border-t border-line bg-white/95 shadow-[0_-8px_24px_rgb(15_31_23/0.08)] backdrop-blur transition duration-200 motion-reduce:transition-none lg:hidden",
        hidden ? "pointer-events-none translate-y-full opacity-0" : "translate-y-0 opacity-100",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
          <p className="text-sm leading-tight">
            <span className="font-bold text-ink tabular">{price}</span>
            {unit ? <span className="text-ink-subtle"> · {unit}</span> : null}
          </p>
        </div>
        <QuantityStepper labels={quantityLabels} disabled={disabled} size="md" />
        <AddToCartButton item={{ ...item, quantity }} labels={cartLabels} disabled={disabled} iconOnly size="md" />
      </div>
    </div>
  );
}
