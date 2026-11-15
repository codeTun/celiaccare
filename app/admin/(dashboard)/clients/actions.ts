"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { getIpHash } from "@/lib/request";
import { siteConfig } from "@/lib/site-config";
import { tunisianPhone, type ActionState } from "@/lib/validators";
import { ModelError } from "@/models/errors";
import { purgeOldAntiAbuseData } from "@/models/deleters/order-attempts";
import { upsertPhoneRule } from "@/models/posters/phone-rules";
import { anonymizeOldOrders } from "@/models/puters/orders";

/* ==========================================================================
   Server Actions of the Clients page: quick block of a number (from the
   customers list or the refused attempts journal, spec EF-38 / EF-39) and the
   personal data clean-up (spec 6.4, law n° 2004-63).
   ========================================================================== */

/** Where the quick block was clicked: written in the reason of the rule. */
const BLOCK_SOURCES = {
  attempts: "Bloqué depuis le journal des tentatives refusées.",
  customers: "Bloqué depuis la liste des clients.",
} as const;

const blockSourceSchema = z.enum(["attempts", "customers"]);

/**
 * Block a number in one click (ConfirmDeleteButton):
 * `blockPhoneAction.bind(null, attempt.phone, "attempts")`. An existing rule of this
 * number (e.g. an exception) is replaced. Stays on the page: its badge becomes "Bloqué".
 */
export async function blockPhoneAction(phone: string, source: string): Promise<ActionState> {
  const admin = await requireAdmin();
  const parsedPhone = tunisianPhone.safeParse(phone);
  const parsedSource = blockSourceSchema.safeParse(source);
  if (!parsedPhone.success || !parsedSource.success) {
    refresh();
    return { status: "error", message: "Numéro invalide." };
  }

  let rule;
  try {
    rule = await upsertPhoneRule({
      phone: parsedPhone.data,
      type: "BLOCKED",
      maxPerDay: null,
      reason: BLOCK_SOURCES[parsedSource.data],
      expiresAt: null,
    });
  } catch (error) {
    if (!(error instanceof ModelError)) console.error("[admin/clients] block failed", error);
    refresh();
    return { status: "error", message: error instanceof ModelError ? error.message : "error" };
  }

  await logAdminAction(admin, rule.created ? "create" : "update", "phoneRule", rule.id, `${rule.phone} : blocage rapide`, await getIpHash());
  refresh();
  return { status: "success", message: "Numéro bloqué." };
}

/**
 * Personal data retention (spec 6.4): for orders delivered or cancelled more than
 * `deliveryDataRetentionDays` days ago, replace the name, phone and address; delete the
 * refused attempts and daily counters older than that. Amounts stay for the statistics.
 */
export async function anonymizeOldDataAction(): Promise<ActionState> {
  const admin = await requireAdmin();
  const days = siteConfig.deliveryDataRetentionDays;

  let orders;
  let purged;
  try {
    orders = await anonymizeOldOrders(days);
    purged = await purgeOldAntiAbuseData(days);
  } catch (error) {
    console.error("[admin/clients] anonymization failed", error);
    refresh();
    return { status: "error", message: "Le nettoyage a échoué. Réessayez dans un instant." };
  }

  await logAdminAction(
    admin,
    "anonymize",
    "order",
    null,
    `Plus de ${days} jours : ${orders} commande(s) anonymisée(s), ${purged.attempts} tentative(s) et ${purged.counters} compteur(s) supprimés`,
    await getIpHash(),
  );
  redirect("/admin/clients?ok=anonymized");
}
