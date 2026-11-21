import "server-only";

import { all, and, or, type Condition } from "@prisma/orm-postgres/orm-client";

import { db } from "@/lib/prisma";
import { needsReview } from "@/lib/utils";
import type { AdminProducerFilters, AdminProducerForm, AdminProducerRow } from "@/types/admin-data";

import { containsPattern, isValidId, toDateInput, toIso } from "./helpers";

/**
 * ADMIN — producers (small businesses: bakeries, shops, home sellers...). Never cached.
 * Call requireAdmin() before using these functions.
 */

/** Producers (A → Z) matching the filters, with their number of products. */
export async function listProducers(filters: AdminProducerFilters = {}): Promise<AdminProducerRow[]> {
  const q = filters.q?.trim();

  const rows = await db.orm.public.Producer.select(
    "id",
    "slug",
    "name",
    "type",
    "city",
    "governorate",
    "guaranteeLevel",
    "phone",
    "imageUrl",
    "isActive",
    "verificationSource",
    "verifiedAt",
    "updatedAt",
  )
    .where((p) => {
      const conditions: Condition[] = [];
      if (q) {
        const pattern = containsPattern(q);
        conditions.push(or(p.name.ilike(pattern), p.city.ilike(pattern), p.slug.ilike(pattern)));
      }
      if (filters.type) conditions.push(p.type.eq(filters.type));
      if (filters.governorate) conditions.push(p.governorate.eq(filters.governorate));
      if (filters.active !== undefined) conditions.push(p.isActive.eq(filters.active));
      return conditions.length > 0 ? and(...conditions) : all();
    })
    .include("products", (products) => products.count())
    .orderBy([(p) => p.name.asc(), (p) => p.id.asc()])
    .all();

  const now = new Date();
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    city: row.city,
    governorate: row.governorate,
    guaranteeLevel: row.guaranteeLevel,
    phone: row.phone,
    imageUrl: row.imageUrl,
    isActive: row.isActive,
    verificationSource: row.verificationSource,
    verifiedAt: toIso(row.verifiedAt),
    needsReview: needsReview(row.verifiedAt, now),
    productCount: row.products,
    updatedAt: toIso(row.updatedAt),
  }));
}

/** One producer, to pre-fill its edit form. null when it does not exist. */
export async function getProducer(id: number): Promise<AdminProducerForm | null> {
  if (!isValidId(id)) return null;
  const row = await db.orm.public.Producer.first({ id });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: row.description,
    descriptionAr: row.descriptionAr,
    city: row.city,
    governorate: row.governorate,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    instagram: row.instagram,
    facebook: row.facebook,
    openingHours: row.openingHours,
    guaranteeLevel: row.guaranteeLevel,
    dedicatedSpace: row.dedicatedSpace,
    dedicatedUtensils: row.dedicatedUtensils,
    trainedStaff: row.trainedStaff,
    verificationSource: row.verificationSource,
    verifiedAt: toDateInput(row.verifiedAt),
    imageUrl: row.imageUrl,
    logoUrl: row.logoUrl,
    isActive: row.isActive,
  };
}
