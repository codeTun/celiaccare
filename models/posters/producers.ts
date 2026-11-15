import "server-only";

import { and } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { isGovernorate } from "@/lib/tunisia";
import { ModelError } from "@/models/errors";
import { applyImageChange, assertVerification, chooseSlug, rethrowSlugConflict } from "@/models/fetchers/admin/helpers";
import type { ProducerInput, SlugMutationResult } from "@/types/admin-data";

/**
 * ADMIN — create a producer (small business). No auth check here: the Server Action calls
 * requireAdmin() first, then refreshes TAGS.producers, TAGS.producer(slug), TAGS.products, TAGS.stats.
 */

/** Is this slug already used by another producer? (`exceptId` = the producer being edited) */
export async function isProducerSlugTaken(slug: string, exceptId?: number) {
  const row = await db.orm.public.Producer.select("id")
    .where((p) => (exceptId === undefined ? p.slug.eq(slug) : and(p.slug.eq(slug), p.id.neq(exceptId))))
    .first();
  return row !== null;
}

/** Checks shared by create and update: governorate, verification date and source (spec 6.1). */
export function assertProducerInput(input: ProducerInput) {
  if (!isGovernorate(input.governorate)) {
    throw new ModelError("INVALID_GOVERNORATE", "Choisissez un gouvernorat de la liste.");
  }
  assertVerification(input.verifiedAt, input.verificationSource);
}

/** The columns written by create and update (everything except slug and photo). */
export function producerColumns(input: ProducerInput) {
  return {
    name: input.name,
    type: input.type,
    description: input.description,
    descriptionAr: input.descriptionAr,
    city: input.city,
    governorate: input.governorate,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    phone: input.phone,
    whatsapp: input.whatsapp,
    email: input.email,
    website: input.website,
    instagram: input.instagram,
    facebook: input.facebook,
    openingHours: input.openingHours,
    guaranteeLevel: input.guaranteeLevel,
    dedicatedSpace: input.dedicatedSpace,
    dedicatedUtensils: input.dedicatedUtensils,
    trainedStaff: input.trainedStaff,
    verificationSource: input.verificationSource.trim(),
    verifiedAt: input.verifiedAt,
    isActive: input.isActive,
  };
}

export async function createProducer(input: ProducerInput): Promise<SlugMutationResult> {
  assertProducerInput(input);
  const slug = await chooseSlug({
    requested: input.slug,
    name: input.name,
    fallback: "artisan",
    isTaken: (candidate) => isProducerSlugTaken(candidate),
  });
  const image = applyImageChange(input.image, null);

  try {
    const row = await db.orm.public.Producer.create({ slug, ...producerColumns(input), ...image.fields });
    return { id: row.id, slug: row.slug, previousSlug: null, imagesToDelete: [] };
  } catch (error) {
    rethrowSlugConflict(error);
  }
}
