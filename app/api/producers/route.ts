import type { NextRequest } from "next/server";
import { z } from "zod";

import { badRequestResponse, langParam, queryParams } from "@/app/api/_lib/http";
import { GOVERNORATE_VALUES } from "@/lib/tunisia";
import { getProducers } from "@/models/fetchers/producers";
import { GUARANTEE_LEVELS, PRODUCER_TYPES } from "@/types";

const producersQuery = z.object({
  lang: langParam,
  q: z.string().trim().max(100).optional(),
  type: z.enum(PRODUCER_TYPES).optional(),
  governorate: z.enum(GOVERNORATE_VALUES).optional(),
  guarantee: z.enum(GUARANTEE_LEVELS).optional(),
});

/**
 * GET /api/producers — the small businesses directory.
 * Example: /api/producers?lang=fr&q=sfax&type=BAKERY&governorate=Sfax&guarantee=CERTIFIED
 */
export async function GET(request: NextRequest) {
  const query = producersQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  const { lang, ...filters } = query.data;
  return Response.json(await getProducers(lang, filters));
}
