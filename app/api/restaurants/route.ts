import type { NextRequest } from "next/server";
import { z } from "zod";

import { badRequestResponse, booleanParam, langParam, queryParams } from "@/app/api/_lib/http";
import { GOVERNORATE_VALUES } from "@/lib/tunisia";
import { getRestaurants } from "@/models/fetchers/restaurants";
import { GUARANTEE_LEVELS } from "@/types";

const restaurantsQuery = z.object({
  lang: langParam,
  q: z.string().trim().max(100).optional(),
  governorate: z.enum(GOVERNORATE_VALUES).optional(),
  guarantee: z.enum(GUARANTEE_LEVELS).optional(),
  partnerOnly: booleanParam.optional(),
});

/**
 * GET /api/restaurants — gluten-free friendly restaurants, partners (online ordering) first.
 * Example: /api/restaurants?lang=fr&q=tunis&governorate=Tunis&partnerOnly=1
 */
export async function GET(request: NextRequest) {
  const query = restaurantsQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  const { lang, ...filters } = query.data;
  return Response.json(await getRestaurants(lang, filters));
}
