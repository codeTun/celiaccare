import "server-only";

import { db } from "@/lib/prisma";
import { ModelError } from "@/models/errors";
import {
  applyImageChange,
  applyLogoChange,
  assertId,
  chooseSlug,
  rethrowSlugConflict,
} from "@/models/fetchers/admin/helpers";
import {
  assertRestaurantInput,
  isRestaurantSlugTaken,
  partnerSinceFor,
  restaurantColumns,
} from "@/models/posters/restaurants";
import type { ActiveToggleResult, RestaurantInput, SlugMutationResult } from "@/types/admin-data";

/**
 * ADMIN — update a partner restaurant. No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.restaurants, TAGS.restaurant(slug)
 * (+ previousSlug) and TAGS.stats.
 */

export async function updateRestaurant(id: number, input: RestaurantInput): Promise<SlugMutationResult> {
  assertId(id);
  assertRestaurantInput(input);
  const current = await db.orm.public.Restaurant.select("id", "slug", "imagePublicId", "logoPublicId", "partnerSince").first({
    id,
  });
  if (!current) throw new ModelError("NOT_FOUND", "Ce restaurant n'existe plus.");

  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "restaurant",
    isTaken: (candidate) => isRestaurantSlugTaken(candidate, id),
  });
  const image = applyImageChange(input.image, current.imagePublicId);
  const logo = applyLogoChange(input.logo, current.logoPublicId);

  try {
    const saved = await db.orm.public.Restaurant.where({ id }).update({
      slug,
      ...restaurantColumns(input, partnerSinceFor(input, current.partnerSince)),
      ...image.fields,
      ...logo.fields,
    });
    if (!saved) throw new ModelError("NOT_FOUND", "Ce restaurant n'existe plus."); // deleted meanwhile
  } catch (error) {
    rethrowSlugConflict(error);
  }

  return {
    id,
    slug,
    previousSlug: current.slug !== slug ? current.slug : null,
    imagesToDelete: [...image.imagesToDelete, ...logo.imagesToDelete],
  };
}

/** Show (true) or hide (false) the restaurant on the public site. */
export async function setRestaurantActive(id: number, isActive: boolean): Promise<ActiveToggleResult> {
  assertId(id);
  const row = await db.orm.public.Restaurant.where({ id }).select("id", "slug", "isActive").update({ isActive });
  if (!row) throw new ModelError("NOT_FOUND", "Ce restaurant n'existe plus.");
  return { id: row.id, slug: row.slug, isActive: row.isActive };
}
