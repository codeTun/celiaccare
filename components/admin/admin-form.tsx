import { Check } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { buttonStyles } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/validators";

/* ==========================================================================
   Building blocks of the admin forms (create / edit pages).

   Bind the Server Action ONCE, in the SERVER Component, and pass it down as a prop.
   Never call `.bind()` inside a Client Component render: with a form sent before
   JavaScript loads, React's SSR loops forever (see KNOWN-ISSUES-AND-GOTCHAS.md).

   @example
   // page.tsx (Server Component)
   <ProductForm action={updateProductAction.bind(null, product.id)} product={product} />

   // product-form.tsx ("use client")
   export function ProductForm({ action, product }: {
     action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
     product: AdminProductDetail;
   }) {
     const [state, formAction] = useActionState(action, idleState); // never action.bind(...) here
     return (
       <form action={formAction} className="space-y-6">
         <FormMessage state={state} />
         <FormSection title="Informations">
           <FormGrid>
             <TextField name="name" label="Nom" required defaultValue={state.values?.name ?? product.name}
               error={state.fieldErrors?.name} />
             <MoneyField name="price" label="Prix" required defaultMillimes={product.price}
               defaultValue={state.values?.price} error={state.fieldErrors?.price} />
             <TextareaField name="description" label="Description" wrapperClassName="sm:col-span-2" />
           </FormGrid>
         </FormSection>
         <FormActions cancelHref="/admin/produits" />
       </form>
     );
   }
   ========================================================================== */

/** Responsive grid of fields: 1 column on phones, `columns` from `sm`. Use "sm:col-span-2" for a wide field. */
export function FormGrid({
  children,
  columns = 2,
  className,
}: {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-5",
        columns === 2 && "sm:grid-cols-2",
        columns === 3 && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Bottom bar of a form: optional extra actions (start side), "Annuler" link and the
 * submit button with its spinner. Sticky by default: always reachable on long forms.
 * Must be placed INSIDE the <form>.
 */
export function FormActions({
  cancelHref,
  cancelLabel = "Annuler",
  submitLabel = "Enregistrer",
  pendingLabel = "Enregistrement…",
  children,
  sticky = true,
  className,
}: {
  cancelHref?: string;
  cancelLabel?: string;
  submitLabel?: ReactNode;
  pendingLabel?: ReactNode;
  /** Extra buttons shown on the start side (e.g. a ConfirmDeleteButton). */
  children?: ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-end",
        sticky && "sticky bottom-4 z-20 shadow-lift",
        className,
      )}
    >
      {children ? <div className="flex flex-wrap items-center gap-2 sm:me-auto">{children}</div> : null}
      {cancelHref ? (
        <Link href={cancelHref} className={buttonStyles({ variant: "outline" })}>
          {cancelLabel}
        </Link>
      ) : null}
      <SubmitButton pendingLabel={pendingLabel}>
        <Check aria-hidden="true" />
        {submitLabel}
      </SubmitButton>
    </div>
  );
}

/** Text shown when a Server Action returns the generic "invalid" message of validationError(). */
const GENERIC_MESSAGES: Record<string, string> = {
  invalid: "Certains champs sont invalides : corrigez-les puis réessayez.",
  error: "L'enregistrement a échoué. Réessayez dans un instant.",
};

/**
 * The message of an ActionState (lib/validators.ts) at the top of a form:
 * red Alert for "error", green Alert for "success", nothing for "idle".
 */
export function FormMessage({
  state,
  successFallback = "Modifications enregistrées.",
  className,
}: {
  state: ActionState;
  successFallback?: string;
  className?: string;
}) {
  if (state.status === "error") {
    let text = GENERIC_MESSAGES.error;
    if (state.message) text = Object.hasOwn(GENERIC_MESSAGES, state.message) ? GENERIC_MESSAGES[state.message] : state.message;
    return (
      <Alert tone="error" className={className}>
        {text}
      </Alert>
    );
  }
  if (state.status === "success") {
    return (
      <Alert tone="success" className={className}>
        {state.message ?? successFallback}
      </Alert>
    );
  }
  return null;
}
