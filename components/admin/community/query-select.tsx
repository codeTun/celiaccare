"use client";

import Form from "next/form";

import { firstParam, paramValues, type AdminQuery } from "@/components/admin/query-string";
import { SelectOptions } from "@/components/admin/select-fields";
import { Select } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * A filter <select> of an admin list that changes the URL (?topic=ORDER, ?governorate=Sfax...)
 * as soon as a value is chosen. The other params of the list are kept; the page goes back to 1.
 * Without JavaScript, an "OK" button sends the choice.
 *
 * @example
 * <QuerySelect basePath="/admin/messages" query={query} name="topic" label="Sujet"
 *   options={MESSAGE_TOPIC_LABELS} placeholder="Tous les sujets" />
 */
export function QuerySelect({
  basePath,
  query,
  name,
  label,
  options,
  placeholder,
  className,
}: {
  basePath: string;
  query?: AdminQuery;
  /** Name of the search param. */
  name: string;
  /** Accessible name of the select. */
  label: string;
  options: Record<string, string> | { value: string; label: string }[];
  /** First option = no filter (empty value). */
  placeholder: string;
  className?: string;
}) {
  const current = firstParam(query?.[name]) ?? "";
  const kept = Object.entries(query ?? {}).filter(([key]) => key !== name && key !== "page" && key !== "ok");
  const id = `filter-${name}`;

  return (
    <Form action={basePath} className={cn("flex items-center gap-2", className)}>
      {kept.flatMap(([key, value]) =>
        paramValues(value).map((item, index) => <input key={`${key}-${index}`} type="hidden" name={key} value={item} />),
      )}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Select
        // A new URL (e.g. "Réinitialiser") must show its own value: remount when it changes.
        key={current}
        id={id}
        name={name}
        defaultValue={current}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className={cn("h-10 min-w-44 rounded-full text-sm", current && "border-brand-300 bg-brand-50/60 font-semibold")}
      >
        <SelectOptions options={options} placeholder={placeholder} />
      </Select>
      <noscript>
        <button
          type="submit"
          className="h-10 rounded-full bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
        >
          OK
        </button>
      </noscript>
    </Form>
  );
}
