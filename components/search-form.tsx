"use client";

import { ArrowRight, Search } from "lucide-react";
import Form from "next/form";
import { useId } from "react";

import { localePath } from "@/i18n/config";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

export type SearchFormProps = {
  lang: Locale;
  /** Label read by screen readers (the field has no visible label), e.g. common.nav.search */
  label: string;
  /** e.g. common.nav.searchPlaceholder */
  placeholder: string;
  /** Text of the submit button, e.g. common.actions.search */
  submitLabel: string;
  /** Text already in the field (e.g. the current search on the products page) */
  defaultValue?: string;
  /** "lg" = taller field, for page heroes */
  size?: "md" | "lg";
  /** Called when the form is sent (used to close the menu or the search panel) */
  onSubmit?: () => void;
  className?: string;
};

/**
 * Product search box. It sends a normal GET request to /{lang}/produits?q=...
 * (next/form turns it into a fast client-side navigation, and it still works
 * without JavaScript). Used in the navbar, the mobile menu and inner pages.
 */
export function SearchForm({
  lang,
  label,
  placeholder,
  submitLabel,
  defaultValue,
  size = "md",
  onSubmit,
  className,
}: SearchFormProps) {
  const inputId = useId();

  return (
    <Form
      action={localePath(lang, "/produits")}
      role="search"
      onSubmit={onSubmit}
      className={cn("relative flex w-full items-center", className)}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <Search
        className={cn(
          "pointer-events-none absolute start-4 text-ink-subtle",
          size === "lg" ? "size-5" : "size-[18px]",
        )}
        aria-hidden="true"
      />
      <input
        id={inputId}
        type="search"
        name="q"
        required
        maxLength={100}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "w-full min-w-0 rounded-full border border-line-strong bg-white ps-11 text-[15px] text-ink shadow-xs transition placeholder:text-ink-subtle",
          "focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none",
          // leave room for the button inside the field (round on phones, with text from "sm")
          size === "lg" ? "h-14 pe-16 sm:pe-32 sm:text-base" : "h-12 pe-14 sm:pe-28",
          // hide the browser's own "clear" cross, it would sit under our button
          "[&::-webkit-search-cancel-button]:appearance-none",
        )}
      />
      <button
        type="submit"
        className={cn(
          "absolute end-1.5 inline-flex items-center justify-center rounded-full bg-brand-600 font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800",
          size === "lg" ? "size-11 text-[15px] sm:w-auto sm:px-5" : "size-9 text-sm sm:w-auto sm:px-4",
        )}
      >
        {/* phones: an arrow (the text stays readable by screen readers); larger screens: the text */}
        <ArrowRight className="size-[18px] sm:hidden rtl:rotate-180" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">{submitLabel}</span>
      </button>
    </Form>
  );
}
