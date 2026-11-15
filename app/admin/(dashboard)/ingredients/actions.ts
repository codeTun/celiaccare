"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import {
  answer,
  echoValues,
  invalidState,
  modelErrorState,
  refreshTags,
  zodFieldErrors,
} from "@/components/admin/catalog/action-helpers";
import { auditLabel } from "@/components/admin/catalog/labels";
import { optionalSlug } from "@/components/admin/catalog/schemas";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { getIpHash } from "@/lib/request";
import { checkbox, formDataToObject, idSchema, optionalText, requiredText, type ActionState } from "@/lib/validators";
import { deleteIngredient } from "@/models/deleters/ingredients";
import { createIngredient } from "@/models/posters/ingredients";
import { updateIngredient } from "@/models/puters/ingredients";
import type { IngredientDeleteResult, IngredientInput, IngredientMutationResult } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the "Ingrédients" pages. Each one starts with requireAdmin().
   Ingredient names and allergens appear on product AND dish sheets, so every
   change refreshes ingredients, products and restaurants (lib/cache-tags.ts).
   ========================================================================== */

const LIST_PATH = "/admin/ingredients";

const ingredientSchema = z.object({
  name: requiredText(80),
  slug: optionalSlug,
  nameAr: optionalText(80),
  isAllergen: checkbox,
});

type IngredientForm = { ok: true; input: IngredientInput; values: Record<string, string> } | { ok: false; state: ActionState };

function readIngredientForm(formData: FormData): IngredientForm {
  const values = echoValues(formData);
  const parsed = ingredientSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { ok: false, state: invalidState(zodFieldErrors(parsed.error), values) };
  return { ok: true, input: parsed.data, values };
}

function refreshIngredientPages() {
  refreshTags(TAGS.ingredients, TAGS.products, TAGS.restaurants);
}

/** Create an ingredient (from the quick-add card of the list or from /nouveau). */
export async function createIngredientAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = readIngredientForm(formData);
  if (!form.ok) return answer(form.state);

  let result: IngredientMutationResult;
  try {
    result = await createIngredient(form.input);
  } catch (error) {
    return answer(modelErrorState(error, form.values));
  }

  const details = `${auditLabel(form.input.name, result.slug)}${form.input.isAllergen ? ", allergène" : ""}`;
  await logAdminAction(admin, "create", "ingredient", result.id, details, await getIpHash());
  refreshIngredientPages();
  redirect(`${LIST_PATH}?ok=created`);
}

/** Bound on the server: `updateIngredientAction.bind(null, ingredient.id)`. */
export async function updateIngredientAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const ingredientId = idSchema.safeParse(id);
  if (!ingredientId.success) return answer({ status: "error", message: "Ingrédient introuvable." });

  const form = readIngredientForm(formData);
  if (!form.ok) return answer(form.state);

  let result: IngredientMutationResult;
  try {
    result = await updateIngredient(ingredientId.data, form.input);
  } catch (error) {
    return answer(modelErrorState(error, form.values));
  }

  const details = [
    auditLabel(form.input.name, result.slug),
    form.input.isAllergen ? "allergène" : null,
    result.previousSlug ? `ancien slug : ${result.previousSlug}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  await logAdminAction(admin, "update", "ingredient", result.id, details, await getIpHash());
  refreshIngredientPages();
  redirect(`${LIST_PATH}?ok=updated`);
}

/**
 * Delete an ingredient (ConfirmDeleteButton, bound on the server). It disappears from
 * every product and dish that contained it (the model also updates their search text).
 */
export async function deleteIngredientAction(id: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const ingredientId = idSchema.safeParse(id);
  if (!ingredientId.success) return answer({ status: "error", message: "Ingrédient introuvable." });

  let result: IngredientDeleteResult;
  try {
    result = await deleteIngredient(ingredientId.data);
  } catch (error) {
    return answer(modelErrorState(error));
  }

  const details = `${result.slug} (retiré de ${result.productCount} produit(s) et ${result.dishCount} plat(s))`;
  await logAdminAction(admin, "delete", "ingredient", result.id, details, await getIpHash());
  refreshIngredientPages();
  redirect(`${LIST_PATH}?ok=deleted`);
}
