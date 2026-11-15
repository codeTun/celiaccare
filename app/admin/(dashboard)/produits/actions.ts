"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  answer,
  deletePhotos,
  echoValues,
  hasFieldErrors,
  invalidState,
  isModelError,
  modelErrorState,
  refreshTags,
  saveWithPhoto,
  withPhotoErrors,
  zodFieldErrors,
  type FieldErrors,
} from "@/components/admin/catalog/action-helpers";
import { auditLabel, PHOTO_SKIPPED_CODE } from "@/components/admin/catalog/labels";
import { optionalSlug, productPrice, requiredId, verificationDate } from "@/components/admin/catalog/schemas";
import { logAdminAction } from "@/lib/audit";
import { requireAdmin } from "@/lib/auth/session";
import { TAGS } from "@/lib/cache-tags";
import { getIpHash } from "@/lib/request";
import { checkbox, formDataToObject, idList, idSchema, optionalText, requiredText, type ActionState } from "@/lib/validators";
import { deleteProduct } from "@/models/deleters/products";
import { createProduct } from "@/models/posters/products";
import { setProductActive, setProductAvailable, setProductFeatured, updateProduct } from "@/models/puters/products";
import { GUARANTEE_LEVELS } from "@/types";
import type { ProductDeleteResult, ProductInput } from "@/types/admin-data";

/* ==========================================================================
   Server Actions of the "Produits" pages. Each one starts with requireAdmin(),
   validates everything (zod), writes an audit log line and refreshes the public
   pages (lib/cache-tags.ts: product → products, product(slug) old AND new,
   categories, producers, producer(slug), stats). The search text of the product
   is recomputed by the model.
   ========================================================================== */

const LIST_PATH = "/admin/produits";

const productSchema = z.object({
  // Informations
  name: requiredText(120),
  slug: optionalSlug,
  description: requiredText(3000),
  unit: optionalText(60),
  price: productPrice,
  categoryId: requiredId("Choisissez une catégorie."),
  producerId: requiredId("Choisissez l'artisan qui fabrique ou vend ce produit."),
  // Ingrédients (spec 5.3: ingredients and allergens on every product sheet)
  ingredientIds: idList
    .refine((ids) => ids.length > 0, "Cochez au moins un ingrédient.")
    .refine((ids) => ids.length <= 80, "80 ingrédients maximum."),
  // Garantie
  guaranteeLevel: z.enum(GUARANTEE_LEVELS, { error: "Choisissez le niveau de garantie." }),
  certification: optionalText(200),
  mayContain: optionalText(300),
  // Vérification (spec 6.1)
  verifiedAt: verificationDate,
  // Version arabe
  nameAr: optionalText(120),
  descriptionAr: optionalText(3000),
  // Publication
  isActive: checkbox,
  isFeatured: checkbox,
  isAvailable: checkbox,
});

type ProductForm =
  | { ok: true; input: Omit<ProductInput, "image">; values: Record<string, string> }
  | { ok: false; state: ActionState };

/** Read and check the form (fields + photo). Nothing is saved or uploaded here. */
function readProductForm(formData: FormData): ProductForm {
  const values = echoValues(formData, ["ingredientIds"]);
  const raw = formDataToObject(formData, ["ingredientIds"]);
  const parsed = productSchema.safeParse(raw);

  let fieldErrors: FieldErrors = zodFieldErrors(parsed.error);
  // A "certified" product must say by whom (spec 5.3: organisme et numéro).
  if (raw.guaranteeLevel === "CERTIFIED" && !String(raw.certification ?? "").trim()) {
    fieldErrors = { ...fieldErrors, certification: ["Obligatoire pour un produit certifié : organisme et numéro."] };
  }
  fieldErrors = withPhotoErrors(fieldErrors, formData);

  if (!parsed.success || hasFieldErrors(fieldErrors)) return { ok: false, state: invalidState(fieldErrors, values) };
  return { ok: true, input: parsed.data, values };
}

/** Refresh every public page that shows this product. */
function refreshProductPages(slugs: (string | null | undefined)[], producerSlugs: (string | null | undefined)[]) {
  refreshTags(
    TAGS.products,
    ...slugs.map((slug) => (slug ? TAGS.product(slug) : null)),
    TAGS.categories,
    TAGS.producers,
    ...producerSlugs.map((slug) => (slug ? TAGS.producer(slug) : null)),
    TAGS.stats,
  );
}

export async function createProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const form = readProductForm(formData);
  if (!form.ok) return answer(form.state);

  const saved = await saveWithPhoto(formData, "products", form.values, (image) => createProduct({ ...form.input, image }));
  if (!saved.ok) return answer(saved.state);

  const { result } = saved;
  await logAdminAction(admin, "create", "product", result.id, auditLabel(form.input.name, result.slug), await getIpHash());
  refreshProductPages([result.slug], result.producerSlugs);
  redirect(`${LIST_PATH}?ok=${saved.photoSkipped ? PHOTO_SKIPPED_CODE : "created"}`);
}

/** Bound on the server: `updateProductAction.bind(null, product.id)`. */
export async function updateProductAction(id: number, _prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(id);
  if (!productId.success) return answer({ status: "error", message: "Produit introuvable." });

  const form = readProductForm(formData);
  if (!form.ok) return answer(form.state);

  const saved = await saveWithPhoto(formData, "products", form.values, (image) =>
    updateProduct(productId.data, { ...form.input, image }),
  );
  if (!saved.ok) return answer(saved.state);

  const { result } = saved;
  const details = result.previousSlug
    ? `${auditLabel(form.input.name, result.slug)}, ancien slug : ${result.previousSlug}`
    : auditLabel(form.input.name, result.slug);
  await logAdminAction(admin, "update", "product", result.id, details, await getIpHash());
  refreshProductPages([result.slug, result.previousSlug], result.producerSlugs);
  redirect(`${LIST_PATH}?ok=${saved.photoSkipped ? PHOTO_SKIPPED_CODE : "updated"}`);
}

/* --------------------------------------------------------------------------
   Quick toggles of the products table (actif / vedette / disponible)
   -------------------------------------------------------------------------- */

const PRODUCT_FLAGS = ["isActive", "isFeatured", "isAvailable"] as const;
type ProductFlag = (typeof PRODUCT_FLAGS)[number];

const FLAG_SETTERS = { isActive: setProductActive, isFeatured: setProductFeatured, isAvailable: setProductAvailable };

/** Audit text of each flag: [when set to false, when set to true]. */
const FLAG_AUDIT: Record<ProductFlag, [string, string]> = {
  isActive: ["masqué du site", "affiché sur le site"],
  isFeatured: ["retiré de la vedette", "mis en vedette"],
  isAvailable: ["marqué indisponible", "marqué disponible"],
};

const toggleSchema = z.object({ id: idSchema, flag: z.enum(PRODUCT_FLAGS), value: z.boolean() });

/**
 * Switch one flag of a product from the list (QuickToggle, bound on the server:
 * `toggleProductFlagAction.bind(null, product.id, "isFeatured", true)`). The list is refreshed in place.
 */
export async function toggleProductFlagAction(id: number, flag: ProductFlag, value: boolean): Promise<void> {
  const admin = await requireAdmin();
  const parsed = toggleSchema.safeParse({ id, flag, value });
  if (parsed.success) {
    const { data } = parsed;
    try {
      const result = await FLAG_SETTERS[data.flag](data.id, data.value);
      const details = `${result.slug} : ${FLAG_AUDIT[data.flag][data.value ? 1 : 0]}`;
      await logAdminAction(admin, "status", "product", result.id, details, await getIpHash());
      refreshProductPages([result.slug], [result.producerSlug]);
    } catch (error) {
      // Deleted in the meantime (ModelError NOT_FOUND): the refreshed list simply no longer shows it.
      if (!isModelError(error)) throw error;
    }
  }
  refresh();
}

/**
 * Delete a product (ConfirmDeleteButton, bound on the server). Its reviews and ingredient
 * links go with it; past orders keep their lines (name and price were copied).
 */
export async function deleteProductAction(id: number): Promise<ActionState> {
  const admin = await requireAdmin();
  const productId = idSchema.safeParse(id);
  if (!productId.success) return answer({ status: "error", message: "Produit introuvable." });

  let result: ProductDeleteResult;
  try {
    result = await deleteProduct(productId.data);
  } catch (error) {
    return answer(modelErrorState(error));
  }

  await deletePhotos(result.imagesToDelete);
  await logAdminAction(admin, "delete", "product", result.id, result.slug, await getIpHash());
  refreshProductPages([result.slug], [result.producerSlug]);
  redirect(`${LIST_PATH}?ok=deleted`);
}
