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
import { assertProducerInput, isProducerSlugTaken, producerColumns } from "@/models/posters/producers";
import type { ActiveToggleResult, ProducerInput, SlugMutationResult } from "@/types/admin-data";

import { refreshProductSearchText } from "./products";

/**
 * ADMIN — update a producer (small business). No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.producers, TAGS.producer(slug) (+ previousSlug),
 * TAGS.products and TAGS.stats.
 */

export async function updateProducer(id: number, input: ProducerInput): Promise<SlugMutationResult> {
  assertId(id);
  assertProducerInput(input);
  const current = await db.orm.public.Producer.select("id", "slug", "name", "imagePublicId", "logoPublicId").first({ id });
  if (!current) throw new ModelError("NOT_FOUND", "Cet artisan n'existe plus.");

  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "artisan",
    isTaken: (candidate) => isProducerSlugTaken(candidate, id),
  });
  const image = applyImageChange(input.image, current.imagePublicId);
  const logo = applyLogoChange(input.logo, current.logoPublicId);

  try {
    await db.transaction(async (tx) => {
      const saved = await tx.orm.public.Producer.where({ id }).update({
        slug,
        ...producerColumns(input),
        ...image.fields,
        ...logo.fields,
      });
      if (!saved) throw new ModelError("NOT_FOUND", "Cet artisan n'existe plus."); // deleted meanwhile
      // The producer name is part of the search text of its products.
      if (current.name !== input.name) await refreshProductSearchText({ producerId: id }, tx);
    });
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

/** Show (true) or hide (false) the producer on the public site. */
export async function setProducerActive(id: number, isActive: boolean): Promise<ActiveToggleResult> {
  assertId(id);
  const row = await db.orm.public.Producer.where({ id }).select("id", "slug", "isActive").update({ isActive });
  if (!row) throw new ModelError("NOT_FOUND", "Cet artisan n'existe plus.");
  return { id: row.id, slug: row.slug, isActive: row.isActive };
}
