"use client";

import { Star } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type StarRatingInputProps = {
  /** Base id, used for the error message */
  id: string;
  /** Name of the form field: the form sends "1" to "5" */
  name: string;
  /** Visible label of the group, e.g. "Votre note" */
  legend: string;
  /** Screen-reader label of each star: ["1 étoile", …, "5 étoiles"] */
  options: string[];
  /** Word shown next to the stars: ["Décevant", …, "Excellent"] */
  words: string[];
  /** Note chosen before (to refill the form after an error), 0 = none */
  defaultValue?: number;
  error?: string | string[] | null;
  required?: boolean;
};

/**
 * Star rating from 1 to 5 for forms.
 * Each star is a real (visually hidden) radio button, so it works with the keyboard
 * out of the box: Tab reaches the group, the arrow keys change the note.
 */
export function StarRatingInput({
  id,
  name,
  legend,
  options,
  words,
  defaultValue = 0,
  error,
  required = true,
}: StarRatingInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [hovered, setHovered] = useState(0);
  // While the mouse is over the stars we preview that note, otherwise we show the chosen one.
  const shown = hovered || value;
  const message = Array.isArray(error) ? error[0] : error;
  const errorId = `${id}-error`;

  return (
    <fieldset aria-describedby={message ? errorId : undefined}>
      <legend className="text-sm font-semibold text-ink">
        {legend}
        {required ? (
          <span className="ms-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </legend>

      <div className="mt-1 flex items-center gap-3">
        <div className="-ms-1.5 flex" onMouseLeave={() => setHovered(0)}>
          {options.map((label, index) => {
            const star = index + 1;
            return (
              <label
                key={star}
                onMouseEnter={() => setHovered(star)}
                className="relative grid size-11 cursor-pointer place-items-center rounded-full transition-colors hover:bg-saffron-50 has-focus-visible:ring-2 has-focus-visible:ring-brand-600"
              >
                <input
                  type="radio"
                  name={name}
                  value={star}
                  required={required}
                  defaultChecked={defaultValue === star}
                  onChange={() => setValue(star)}
                  className="sr-only"
                />
                <Star
                  aria-hidden="true"
                  strokeWidth={1.5}
                  className={cn(
                    "size-7 transition-transform duration-150",
                    // outlines keep a 3:1 contrast on white (WCAG 1.4.11), selected or not
                    star <= shown ? "fill-saffron-400 text-saffron-700" : "text-ink-subtle",
                    star === hovered && "scale-110",
                  )}
                />
                <span className="sr-only">{label}</span>
              </label>
            );
          })}
        </div>
        {/* The chosen note in words ("Très bien"); screen readers already hear "4 étoiles". */}
        <span aria-hidden="true" className="text-sm font-semibold text-ink-muted">
          {shown > 0 ? words[shown - 1] : null}
        </span>
      </div>

      {message ? (
        <p id={errorId} role="alert" className="mt-1 text-xs font-medium text-red-600">
          {message}
        </p>
      ) : null}
    </fieldset>
  );
}
