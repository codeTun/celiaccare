"use client";

import { LoaderCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Button, type ButtonSize, type ButtonVariant } from "./button";

type SubmitButtonProps = Omit<ComponentProps<"button">, "type"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pendingLabel?: ReactNode;
};

/** A submit button that shows a spinner while its <form> is being sent. */
export function SubmitButton({ children, pendingLabel, disabled, ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending || undefined} {...props}>
      {pending ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
