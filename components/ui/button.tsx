import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "white" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon" | "icon-sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800",
  secondary: "bg-brand-50 text-brand-800 hover:bg-brand-100 active:bg-brand-200",
  outline: "border border-line-strong bg-white text-ink hover:border-brand-300 hover:bg-brand-50",
  ghost: "text-ink-muted hover:bg-brand-50 hover:text-brand-800",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
  white: "bg-white text-brand-800 shadow-sm hover:bg-brand-50",
  link: "h-auto px-0 text-brand-700 underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm [&_svg]:size-4",
  md: "h-11 px-5 text-sm [&_svg]:size-4",
  lg: "h-12 px-7 text-base [&_svg]:size-5",
  icon: "size-11 [&_svg]:size-5",
  "icon-sm": "size-9 [&_svg]:size-4",
};

/** Class names of a button — also usable on a <Link> to make it look like a button. */
export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(base, variants[variant], variant === "link" ? "" : sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonStyles({ variant, size, className })} {...props} />;
}
