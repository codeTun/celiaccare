"use client";

import { useActionState, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { FormActions, FormMessage } from "@/components/admin/admin-form";
import { idleState, type ActionState } from "@/lib/validators";

import { valuesKey } from "./form-values";

/** Signature of the create / update Server Actions (update ones are bound to the id on the server). */
export type CatalogFormAction = (prevState: ActionState, formData: FormData) => Promise<ActionState>;

type CatalogFormProps = {
  /** e.g. createProductAction, or updateProductAction.bind(null, id) — bound in a SERVER Component. */
  action: CatalogFormAction;
  /** Where "Annuler" goes (the list). No link when omitted (e.g. a quick-add card). */
  cancelHref?: string;
  submitLabel: string;
  pendingLabel?: string;
  /** "page" (default): sticky action bar at the bottom. "card": compact form (fields + button on one line). */
  variant?: "page" | "card";
  /** The fields. Receives the last answer of the action (errors + submitted values). */
  children: (state: ActionState) => ReactNode;
};

/**
 * The frame of every catalogue form (create and edit pages):
 * error message at the top, the fields, and the sticky "Annuler / Enregistrer" bar.
 *
 * - On success the action redirects to the list (?ok=…), where a FlashMessage confirms.
 * - On error the fields are rebuilt with the values sent back by the action, and the
 *   first wrong field gets the focus.
 * - Next.js keeps visited pages mounted but hidden (Activity): every time the page is
 *   hidden (after a save, or when the admin leaves), the form starts again from the
 *   saved values, so a stale draft or message never shows up on the next visit.
 */
export function CatalogForm(props: CatalogFormProps) {
  const [visit, setVisit] = useState(0);
  useLayoutEffect(() => () => setVisit((count) => count + 1), []);
  return <CatalogFormBody key={visit} {...props} />;
}

function CatalogFormBody({ action, cancelHref, submitLabel, pendingLabel, variant = "page", children }: CatalogFormProps) {
  const [state, formAction] = useActionState(action, idleState);
  const formRef = useRef<HTMLFormElement>(null);

  // After an error: go to the first wrong field (or group of boxes), or to the message when no field is concerned.
  useEffect(() => {
    if (state.status !== "error") return;
    const form = formRef.current;
    const wrong = form?.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true']");
    const target = wrong?.matches("[data-invalid]") ? wrong.querySelector<HTMLElement>("input:not([disabled])") : wrong;
    if (target) target.focus();
    else form?.querySelector("[role='alert']")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={variant === "card" ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start" : "space-y-6"}
    >
      <FormMessage state={state} className={variant === "card" ? "lg:col-span-2" : undefined} />
      <div key={valuesKey(state.values)} className={variant === "card" ? "min-w-0" : "space-y-6"}>
        {children(state)}
      </div>
      <FormActions
        cancelHref={cancelHref}
        submitLabel={submitLabel}
        pendingLabel={pendingLabel}
        sticky={variant === "page"}
        // card: the button sits on the same line as the inputs (below their labels)
        className={variant === "card" ? "border-0 bg-transparent p-0 shadow-none backdrop-blur-none lg:mt-[1.65rem]" : undefined}
      />
    </form>
  );
}
