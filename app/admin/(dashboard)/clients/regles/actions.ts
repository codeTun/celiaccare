"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { tunisDayKey } from "@/lib/tunisia";
import {
  formDataToObject,
  idSchema,
  requiredText,
  submittedValues,
  tunisianPhone,
  validationError,
  type ActionState,
} from "@/lib/validators";
import { ModelError } from "@/models/errors";
import { deletePhoneRule } from "@/models/deleters/phone-rules";
import { MAX_EXCEPTION_PER_DAY, upsertPhoneRule } from "@/models/posters/phone-rules";
import { updatePhoneRule } from "@/models/puters/phone-rules";
import { PHONE_RULE_TYPES } from "@/types";

/* ==========================================================================
   Server Actions of the phone rules (spec EF-39): block an abusive number or
   allow a justified exception to the 3-orders-per-day limit.
   requireAdmin() first, zod validation, audit log. The checkout reads the rules
   without cache: nothing to refresh.
   ========================================================================== */

const RULES_PATH = "/admin/clients/regles";

/**
 * "2026-12-31" → the last millisecond of that day in Tunis, so the rule still applies all day.
 * Tunisia stays at UTC+1 all year (no daylight saving time since 2009).
 */
function endOfTunisDay(day: string) {
  return new Date(`${day}T23:59:59.999+01:00`);
}

const maxPerDaySchema = z.coerce
  .number({ error: "Indiquez un nombre." })
  .int("Indiquez un nombre entier.")
  .min(1, "Au moins 1 commande par jour.")
  .max(MAX_EXCEPTION_PER_DAY, `Au plus ${MAX_EXCEPTION_PER_DAY} commandes par jour.`);

/** Type, daily limit (exceptions only), reason and optional end date — shared by create and update. */
const ruleFieldsSchema = z
  .object({
    type: z.enum(PHONE_RULE_TYPES, { error: "Choisissez le type de règle." }),
    maxPerDay: z.string().trim().optional(),
    reason: requiredText(300),
    expiresAt: z.string().trim().optional(),
  })
  .transform((data, ctx) => {
    let maxPerDay: number | null = null;
    if (data.type === "EXCEPTION") {
      const parsed = maxPerDaySchema.safeParse(data.maxPerDay ?? "");
      if (!parsed.success) {
        ctx.addIssue({ code: "custom", path: ["maxPerDay"], message: parsed.error.issues[0]?.message ?? "Nombre invalide." });
        return z.NEVER;
      }
      maxPerDay = parsed.data;
    }

    let expiresAt: Date | null = null;
    if (data.expiresAt) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data.expiresAt) || Number.isNaN(Date.parse(data.expiresAt))) {
        ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Date invalide." });
        return z.NEVER;
      }
      // "YYYY-MM-DD" strings compare like dates.
      if (data.expiresAt < tunisDayKey()) {
        ctx.addIssue({ code: "custom", path: ["expiresAt"], message: "Choisissez aujourd'hui ou une date à venir." });
        return z.NEVER;
      }
      expiresAt = endOfTunisDay(data.expiresAt);
    }

    return { type: data.type, maxPerDay, reason: data.reason, expiresAt };
  });

const newRuleSchema = z.object({ phone: tunisianPhone }).and(ruleFieldsSchema);

/** Model errors → message under the right field (or at the top of the form / in the dialog). */
const KNOWN_ERRORS: Record<string, { field?: string; message: string }> = {
  INVALID_PHONE: { field: "phone", message: "Numéro tunisien invalide (8 chiffres)." },
  INVALID_MAX_PER_DAY: { field: "maxPerDay", message: `Entre 1 et ${MAX_EXCEPTION_PER_DAY} commandes par jour.` },
  INVALID_EXPIRES_AT: { field: "expiresAt", message: "Date invalide." },
  NOT_FOUND: { message: "Cette règle n'existe plus." },
  INVALID_ID: { message: "Règle introuvable." },
};

/** Answer the form (with the typed values) and refresh the page data. */
function answer(state: ActionState): ActionState {
  refresh();
  return state;
}

function failure(error: unknown, formData?: FormData): ActionState {
  const values = formData ? submittedValues(formData) : undefined;
  if (error instanceof ModelError) {
    const known = KNOWN_ERRORS[error.code];
    if (known?.field) return answer({ status: "error", message: "invalid", fieldErrors: { [known.field]: [known.message] }, values });
    return answer({ status: "error", message: known?.message ?? error.message, values });
  }
  console.error("[admin/regles] action failed", error);
  return answer({ status: "error", message: "error", values });
}

/** Short text for the audit log: "blocage" or "exception (6/jour)". */
function describeRule(type: string, maxPerDay: number | null) {
  if (type !== "EXCEPTION") return "blocage";
  return maxPerDay ? `exception (${maxPerDay}/jour)` : "exception";
}

/** New rule. A number has at most one rule: an existing one is replaced. */
export async function createPhoneRuleAction(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsed = newRuleSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let rule;
  try {
    rule = await upsertPhoneRule(parsed.data);
  } catch (error) {
    return failure(error, formData);
  }

  await logAdminAction(
    admin,
    rule.created ? "create" : "update",
    "phoneRule",
    rule.id,
    `${rule.phone} : ${describeRule(rule.type, parsed.data.maxPerDay)}`,
    await getIpHash(),
  );
  redirect(`${RULES_PATH}?ok=${rule.created ? "created" : "replaced"}`);
}

/** Bound on the server: `updatePhoneRuleAction.bind(null, rule.id)`. The number does not change. */
export async function updatePhoneRuleAction(ruleId: number, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(ruleId);
  if (!id.success) return answer({ status: "error", message: "Règle introuvable." });
  const parsed = ruleFieldsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return answer(validationError(parsed.error, formData));

  let rule;
  try {
    rule = await updatePhoneRule(id.data, parsed.data);
  } catch (error) {
    return failure(error, formData);
  }

  await logAdminAction(
    admin,
    "update",
    "phoneRule",
    rule.id,
    `${rule.phone} : ${describeRule(rule.type, parsed.data.maxPerDay)}`,
    await getIpHash(),
  );
  redirect(`${RULES_PATH}?ok=updated`);
}

/** ConfirmDeleteButton: `deletePhoneRuleAction.bind(null, rule.id)`. The number goes back to the normal limit. */
export async function deletePhoneRuleAction(ruleId: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(ruleId);
  if (!id.success) return answer({ status: "error", message: "Règle introuvable." });

  let rule;
  try {
    rule = await deletePhoneRule(id.data);
  } catch (error) {
    return failure(error);
  }

  await logAdminAction(admin, "delete", "phoneRule", rule.id, `${rule.phone} : ${describeRule(rule.type, null)}`, await getIpHash());
  redirect(`${RULES_PATH}?ok=deleted`);
}
