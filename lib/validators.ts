import { z } from "zod";

import { parsePriceToMillimes } from "@/lib/format";
import { isGovernorate, normalizeTunisianPhone } from "@/lib/tunisia";

/* ==========================================================================
   Shared validation helpers (zod v4).
   Every form is validated on the SERVER (in its Server Action) with a schema
   built from these pieces — never trust what the browser sends.
   ========================================================================== */

/** What every form Server Action returns to its form (used with React's useActionState). */
export type ActionState<TData = unknown> = {
  status: "idle" | "success" | "error";
  /** Message key or text to display at the top of the form */
  message?: string;
  /** Errors per field: { phone: ["Numéro invalide"] } */
  fieldErrors?: Record<string, string[] | undefined>;
  /** The submitted values, to refill the form after an error (React resets forms after an action) */
  values?: Record<string, string>;
  data?: TData;
};

export const idleState: ActionState = { status: "idle" };

/**
 * Turn a FormData into a plain object.
 * Keys listed in `arrayKeys` keep all their values (e.g. several checked ingredients).
 */
export function formDataToObject(formData: FormData, arrayKeys: string[] = []) {
  const result: Record<string, string | string[]> = {};
  for (const key of new Set(formData.keys())) {
    if (key.startsWith("$ACTION")) continue; // internal Next.js fields
    const all = formData.getAll(key).filter((v): v is string => typeof v === "string");
    result[key] = arrayKeys.includes(key) ? all : (all[0] ?? "");
  }
  return result;
}

/** Only the text values, to send them back to the form after an error. */
export function submittedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION") && !(key in values)) values[key] = value;
  }
  return values;
}

/** Build an error ActionState from a zod error. */
export function validationError(error: z.ZodError, formData?: FormData, message = "invalid"): ActionState<never> {
  return {
    status: "error",
    message,
    fieldErrors: z.flattenError(error).fieldErrors as Record<string, string[] | undefined>,
    values: formData ? submittedValues(formData) : undefined,
  };
}

/* --------------------------------------------------------------------------
   Reusable field schemas
   -------------------------------------------------------------------------- */

/** Required text, trimmed. */
export const requiredText = (max = 200, min = 1) =>
  z
    .string()
    .trim()
    .min(min, min <= 1 ? "Ce champ est obligatoire." : `Au moins ${min} caractères.`)
    .max(max, `Maximum ${max} caractères.`);

/** Optional text: "" becomes null. */
export const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `Maximum ${max} caractères.`)
    .optional()
    .transform((v) => v || null);

/** Optional e-mail: "" becomes null. */
export const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v.toLowerCase() : null))
  .refine((v) => v === null || z.email().safeParse(v).success, "Adresse e-mail invalide.");

/** Optional URL (https://...): "" becomes null. */
export const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/[^\s]+$/i.test(v), "Lien invalide (il doit commencer par https://).");

/** Tunisian phone (EF-31): returns the 8 normalised digits. */
export const tunisianPhone = z
  .string()
  .trim()
  .transform((v, ctx) => {
    const phone = normalizeTunisianPhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Numéro tunisien invalide (8 chiffres, ex. 20 123 456)." });
      return z.NEVER;
    }
    return phone;
  });

/** Optional Tunisian phone: "" becomes null. */
export const optionalTunisianPhone = z
  .string()
  .trim()
  .optional()
  .transform((v, ctx) => {
    if (!v) return null;
    const phone = normalizeTunisianPhone(v);
    if (!phone) {
      ctx.addIssue({ code: "custom", message: "Numéro tunisien invalide (8 chiffres)." });
      return z.NEVER;
    }
    return phone;
  });

/** One of the 24 governorates. */
export const governorate = z
  .string()
  .trim()
  .refine((v) => isGovernorate(v), "Choisissez un gouvernorat.");

/** Price typed in dinars ("12,5") -> millimes (12500). */
export const priceInDinars = z.string().transform((v, ctx) => {
  const millimes = parsePriceToMillimes(v);
  if (millimes === null || millimes < 0) {
    ctx.addIssue({ code: "custom", message: "Prix invalide (ex. 12,500)." });
    return z.NEVER;
  }
  return millimes;
});

/** Optional price in dinars: "" becomes null. */
export const optionalPriceInDinars = z
  .string()
  .optional()
  .transform((v, ctx) => {
    if (!v?.trim()) return null;
    const millimes = parsePriceToMillimes(v);
    if (millimes === null || millimes < 0) {
      ctx.addIssue({ code: "custom", message: "Montant invalide." });
      return z.NEVER;
    }
    return millimes;
  });

/** HTML checkbox: "on" when checked, missing when not. */
export const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on" || v === "true" || v === "1");

/** Positive integer id coming from a form or the URL. */
export const idSchema = z.coerce.number().int().positive();

/** A list of ids from several checkboxes with the same name. */
export const idList = z
  .array(z.coerce.number().int().positive())
  .optional()
  .transform((v) => Array.from(new Set(v ?? [])));

/** Date typed in an <input type="date"> ("2026-11-15") -> Date. */
export const dateInput = z
  .string()
  .trim()
  .refine((v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)), "Date invalide.")
  .transform((v) => new Date(`${v}T12:00:00Z`));

/** URL slug: lowercase letters, digits and dashes. */
export const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Uniquement des minuscules, chiffres et tirets.")
  .max(80);

/** Hidden anti-bot field: must stay empty. */
export const honeypot = z.string().max(0).optional();
