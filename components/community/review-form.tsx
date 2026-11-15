"use client";

import { ShieldCheck } from "lucide-react";
import { useActionState, useId } from "react";

import { Alert } from "@/components/ui/alert";
import { HoneypotField, TextareaField, TextField } from "@/components/ui/form";
import { SubmitButton } from "@/components/ui/submit-button";
import type { CommunityDict } from "@/i18n/resources/fr/community";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/validators";

import { StarRatingInput } from "./star-rating-input";

const initialState: ActionState = { status: "idle" };

/**
 * "Donner mon avis" form (EF-22), shown by <ReviewsSection>.
 * The review is sent to the submitReview Server Action and saved as PENDING:
 * it is never shown right away, only after a moderator approves it.
 *
 * `action` is submitReview already bound to the language and the target by the
 * Server Component. It must NOT be bound here: a new action on every render makes
 * React's server rendering of a no-JavaScript submission wait forever.
 */
export function ReviewForm({
  action,
  labels,
  className,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  labels: CommunityDict["reviewForm"];
  className?: string;
}) {
  const id = useId();
  const [state, formAction] = useActionState(action, initialState);

  if (state.status === "success") {
    return (
      <div ref={focusOnMount} tabIndex={-1} className={cn("focus:outline-none", className)}>
        <Alert tone="success" title={state.message}>
          {labels.successText}
        </Alert>
      </div>
    );
  }

  // After an error, React empties the form: we refill it with what was sent.
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className={cn("relative flex flex-col gap-5", className)}>
      <TextField
        id={`${id}-name`}
        name="authorName"
        label={labels.name}
        hint={labels.nameHint}
        placeholder={labels.namePlaceholder}
        required
        minLength={2}
        maxLength={40}
        autoComplete="given-name"
        defaultValue={values.authorName}
        error={errors.authorName}
      />

      <StarRatingInput
        id={`${id}-rating`}
        name="rating"
        legend={labels.rating}
        options={labels.ratingOptions}
        words={labels.ratingWords}
        defaultValue={Number(values.rating) || 0}
        error={errors.rating}
      />

      <TextareaField
        id={`${id}-comment`}
        name="comment"
        label={labels.comment}
        hint={labels.commentHint}
        placeholder={labels.commentPlaceholder}
        required
        minLength={10}
        maxLength={1000}
        rows={5}
        defaultValue={values.comment}
        error={errors.comment}
      />

      <HoneypotField />

      {state.status === "error" && state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div>
        <SubmitButton className="w-full" pendingLabel={labels.sending}>
          {labels.submit}
        </SubmitButton>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-subtle">
          <ShieldCheck className="mt-px size-4 shrink-0 text-brand-600" aria-hidden="true" />
          {labels.moderationNote}
        </p>
      </div>
    </form>
  );
}

/** Moves the focus to the success message when it appears (screen readers read it). */
function focusOnMount(element: HTMLElement | null) {
  element?.focus();
}
