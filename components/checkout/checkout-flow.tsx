"use client";

import { ArrowLeft, LoaderCircle, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type SubmitEvent,
} from "react";
import { flushSync } from "react-dom";

import { useCart } from "@/components/cart/cart-provider";
import { Button, buttonStyles } from "@/components/ui/button";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CartDict } from "@/i18n/resources/fr/cart";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { MAX_ORDERS_PER_DAY, normalizeTunisianPhone } from "@/lib/tunisia";
import type { DeliveryZoneDTO, Locale } from "@/types";

import { CartBlockerAlert } from "./cart-blocker-alert";
import { CheckoutSteps } from "./checkout-steps";
import { canDeliverTo, findCartBlocker, findCartRestaurant, quoteDelivery } from "./delivery";
import { DeliveryForm, type DeliveryErrors } from "./delivery-form";
import { EmptyCart } from "./empty-cart";
import { OrderConfirmation } from "./order-confirmation";
import { OrderReview } from "./order-review";
import { OrderSummary } from "./order-summary";
import { RefusalAlert } from "./refusal-alert";
import { EMPTY_DELIVERY_VALUES, findDeliveryProblems, type DeliveryField, type DeliveryValues } from "./rules";
import { CheckoutSkeleton } from "./skeletons";
import type { CheckoutRestaurant, PlaceOrderAction, PlaceOrderState } from "./types";

export type CheckoutFlowProps = {
  lang: Locale;
  /** dict.checkout */
  texts: CheckoutDict;
  /** dict.cart */
  cartTexts: CartDict;
  /** Active shop delivery zones (getDeliveryZones()) */
  zones: DeliveryZoneDTO[];
  /** Delivery rules of the partner restaurants (toCheckoutRestaurants(...)) */
  restaurants: CheckoutRestaurant[];
  /**
   * The Server Action placeOrder of app/[lang]/commande/actions.ts, ALREADY bound to the language
   * by the page (placeOrder.bind(null, lang)). Never bind it here: see KNOWN-ISSUES (React 19).
   */
  placeOrder: PlaceOrderAction;
};

const INITIAL_STATE: PlaceOrderState = { status: "idle" };

/**
 * The checkout (/commande): 1) delivery details → 2) summary → 3) confirmation.
 *
 * Next.js keeps visited pages alive in the background (<Activity>): after an order, a visitor who
 * comes back to this page must find a fresh form, not the previous confirmation. Each order therefore
 * runs in its own <CheckoutRun>, and `restart()` replaces it with a new one (new key = fresh state).
 */
export function CheckoutFlow(props: CheckoutFlowProps) {
  const [run, setRun] = useState(0);
  const restart = useCallback(() => setRun((current) => current + 1), []);
  return <CheckoutRun key={run} {...props} onRestart={restart} />;
}

type Step = "details" | "review";

function CheckoutRun({
  lang,
  texts,
  cartTexts,
  zones,
  restaurants,
  placeOrder,
  onRestart,
}: CheckoutFlowProps & { onRestart: () => void }) {
  const { cart, ready, subtotal, remove, clear } = useCart();

  const [state, dispatch, isSending] = useActionState(placeOrder, INITIAL_STATE);

  const [step, setStep] = useState<Step>("details");
  const [values, setValues] = useState<DeliveryValues>(EMPTY_DELIVERY_VALUES);
  const [errors, setErrors] = useState<DeliveryErrors>({});
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  // The refusal message of the last answer is hidden once the visitor acts on it.
  const [dismissedState, setDismissedState] = useState<PlaceOrderState | null>(null);
  // The server answer already taken into account (see "after each answer" below).
  const [handledState, setHandledState] = useState(state);

  const honeypot = useRef(""); // value of the invisible anti-bot field of step 1
  const orderPlaced = useRef(false);
  const detailsHeading = useRef<HTMLHeadingElement>(null);
  const reviewHeading = useRef<HTMLHeadingElement>(null);

  const placedOrder = state.status === "success" ? (state.data?.order ?? null) : null;

  // After each answer of the server: invalid fields → back to step 1 with their messages.
  // (Adjusting state while rendering, as recommended by React, instead of an effect.)
  if (state !== handledState) {
    setHandledState(state);
    if (state.status === "error" && state.message === "INVALID" && state.fieldErrors) {
      setErrors(firstMessages(state.fieldErrors));
      setShowErrorSummary(true);
      setStep("details");
    }
  }

  // Once the order is saved, the cart is emptied (only once, even when this effect runs again).
  useEffect(() => {
    if (placedOrder && !orderPlaced.current) {
      orderPlaced.current = true;
      clear();
    }
  }, [placedOrder, clear]);

  // Layout effects run again when the page is shown again: start a new order after a placed one.
  useLayoutEffect(() => {
    if (orderPlaced.current) onRestart();
  }, [onRestart]);

  /* ---------------- Values derived from the cart ---------------- */

  const restaurant = findCartRestaurant(cart, restaurants);
  // A restaurant only delivers in its own governorate: it is chosen by default.
  const governorate = values.governorate || restaurant?.governorate || "";
  const quote = quoteDelivery(governorate, cart, zones, restaurant, subtotal);
  const blocker = findCartBlocker(cart, zones, restaurant, subtotal);
  const deliverable = (name: string) => canDeliverTo(name, cart, zones, restaurant);
  const merchant =
    cart.type === "RESTAURANT"
      ? interpolate(cartTexts.header.restaurant, { name: cart.restaurantName ?? "" })
      : cartTexts.header.shop;

  /* ---------------- Screens ---------------- */

  if (placedOrder) {
    return (
      <div>
        <CheckoutSteps current="done" texts={texts.steps} className="mb-8" />
        <OrderConfirmation
          lang={lang}
          texts={texts}
          order={placedOrder}
          firstName={values.fullName.trim().split(/\s+/)[0] ?? ""}
          phone={normalizeTunisianPhone(values.phone) ?? values.phone}
          paymentMethod={values.paymentMethod}
        />
      </div>
    );
  }

  if (!ready) return <CheckoutSkeleton label={texts.loading} />;

  if (cart.items.length === 0 || cart.type === null) return <EmptyCart lang={lang} texts={texts.empty} />;

  if (blocker) {
    return (
      <div className="mx-auto max-w-2xl">
        <CartBlockerAlert blocker={blocker} lang={lang} texts={cartTexts} restaurant={restaurant} subtotal={subtotal} />
        <Link
          href={localePath(lang, "/panier")}
          className={buttonStyles({ variant: "outline", className: "mt-6" })}
        >
          <ArrowLeft className="rtl:rotate-180" aria-hidden="true" />
          {texts.empty.backToCart}
        </Link>
      </div>
    );
  }

  /* ---------------- Handlers ---------------- */

  /** Fields still wrong, with their messages. */
  function validate(next: DeliveryValues): DeliveryErrors {
    const found: DeliveryErrors = {};
    for (const field of findDeliveryProblems({ ...next, governorate: next.governorate || governorate }, deliverable)) {
      found[field] = texts.errors[field];
    }
    return found;
  }

  function changeField<F extends DeliveryField>(field: F, value: DeliveryValues[F]) {
    const next = { ...values, [field]: value };
    setValues(next);
    // Once a field shows an error, re-check it at each key press so the error disappears as soon as it is fixed.
    if (errors[field]) setErrors((current) => ({ ...current, [field]: validate(next)[field] }));
  }

  function checkField(field: DeliveryField) {
    setErrors((current) => ({ ...current, [field]: validate(values)[field] }));
  }

  /** Shows a step and moves the keyboard focus (and the screen) to its title. */
  function goToStep(next: Step) {
    setDismissedState(state); // an old refusal message is no longer relevant
    flushSync(() => setStep(next));
    const heading = next === "review" ? reviewHeading.current : detailsHeading.current;
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start" });
  }

  /** Step 1 → step 2, only when every field is valid (EF-33). */
  function handleContinue(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const trap = new FormData(event.currentTarget).get("website");
    honeypot.current = typeof trap === "string" ? trap : "";
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      setShowErrorSummary(true);
      document.getElementById(`field-${firstInvalid}`)?.focus();
      return;
    }
    setShowErrorSummary(false);
    goToStep("review");
  }

  /** Step 2: sends the order to the server (prices are recomputed there, never trusted from here). */
  function handleConfirm() {
    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setShowErrorSummary(true);
      goToStep("details");
      return;
    }

    const formData = new FormData();
    formData.set("type", cart.type ?? "");
    formData.set("restaurantId", cart.type === "RESTAURANT" && cart.restaurantId ? String(cart.restaurantId) : "");
    // Only ids and quantities: the server reads names and prices from the database.
    formData.set("items", JSON.stringify(cart.items.map(({ kind, id, quantity }) => ({ kind, id, quantity }))));
    formData.set("fullName", values.fullName);
    formData.set("phone", values.phone);
    formData.set("governorate", governorate);
    formData.set("city", values.city);
    formData.set("street", values.street);
    formData.set("addressDetails", values.addressDetails);
    formData.set("note", values.note);
    formData.set("paymentMethod", values.paymentMethod);
    if (values.consent) formData.set("consent", "on");
    formData.set("website", honeypot.current);

    setDismissedState(null);
    startTransition(() => dispatch(formData));
  }

  const showRefusal = state.status === "error" && state !== dismissedState && !isSending;

  return (
    <div>
      <CheckoutSteps current={step} texts={texts.steps} className="mb-8" />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="min-w-0">
          {step === "details" ? (
            <DeliveryForm
              lang={lang}
              texts={texts}
              values={values}
              governorate={governorate}
              errors={errors}
              showErrorSummary={showErrorSummary && Object.values(errors).some(Boolean)}
              cartType={cart.type}
              zones={zones}
              restaurant={restaurant}
              quote={quote}
              headingRef={detailsHeading}
              onFieldChange={changeField}
              onFieldBlur={checkField}
              onSubmit={handleContinue}
            />
          ) : (
            <OrderReview
              lang={lang}
              texts={texts}
              values={values}
              governorate={governorate}
              items={cart.items}
              quote={quote}
              headingRef={reviewHeading}
              disabled={isSending}
              onEdit={() => goToStep("details")}
            />
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <OrderSummary
            lang={lang}
            texts={texts.summary}
            merchant={merchant}
            items={cart.items}
            showItems={step === "details"}
            subtotal={subtotal}
            quote={quote}
          >
            {step === "review" ? (
              <div className="mt-5 space-y-4">
                {showRefusal ? (
                  <RefusalAlert
                    message={state.message}
                    data={state.data}
                    lang={lang}
                    texts={texts.refusals}
                    cart={cart}
                    governorate={governorate}
                    restaurant={restaurant}
                    onRemoveItems={(keys) => {
                      keys.forEach(remove);
                      setDismissedState(state);
                    }}
                    onEditDetails={() => goToStep("details")}
                  />
                ) : null}
                <Button size="lg" className="w-full" onClick={handleConfirm} disabled={isSending} aria-busy={isSending || undefined}>
                  {isSending ? (
                    <LoaderCircle className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Lock aria-hidden="true" />
                  )}
                  {isSending ? texts.review.sending : texts.review.confirm}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => goToStep("details")} disabled={isSending}>
                  {texts.review.edit}
                </Button>
                <p className="text-center text-xs leading-relaxed text-ink-subtle">{texts.review.commitment}</p>
              </div>
            ) : (
              <div className="mt-5 flex gap-3 rounded-2xl bg-canvas p-4 text-xs leading-relaxed text-ink-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-ink">
                    {interpolate(cartTexts.dailyLimit.title, { max: MAX_ORDERS_PER_DAY })}
                  </p>
                  <p className="mt-0.5">{interpolate(cartTexts.dailyLimit.text, { max: MAX_ORDERS_PER_DAY })}</p>
                </div>
              </div>
            )}
          </OrderSummary>
        </aside>
      </div>
    </div>
  );
}

/** { phone: ["Numéro invalide"] } → { phone: "Numéro invalide" } (only the delivery fields). */
function firstMessages(fieldErrors: Record<string, string[] | undefined>): DeliveryErrors {
  const result: DeliveryErrors = {};
  for (const field of Object.keys(EMPTY_DELIVERY_VALUES) as DeliveryField[]) {
    const message = fieldErrors[field]?.[0];
    if (message) result[field] = message;
  }
  return result;
}
