import type { NextRequest } from "next/server";
import { z } from "zod";

import {
  badRequestResponse,
  langParam,
  millimesParam,
  queryParams,
  slugListParam,
  slugParam,
} from "@/app/api/_lib/http";
import { getProducts, PRODUCT_SORTS } from "@/models/fetchers/products";
import { GUARANTEE_LEVELS } from "@/types";

const productsQuery = z
  .object({
    lang: langParam,
    q: z.string().trim().max(100).optional(),
    category: slugParam.optional(),
    ingredients: slugListParam.optional(), // must contain ALL of them
    exclude: slugListParam.optional(), // must contain NONE of them (allergens)
    guarantee: z.enum(GUARANTEE_LEVELS).optional(),
    minPrice: millimesParam.optional(),
    maxPrice: millimesParam.optional(),
    producer: slugParam.optional(),
    sort: z.enum(PRODUCT_SORTS).optional(),
    page: z.coerce.number().int().min(1).max(10_000).optional(),
  })
  .refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
    path: ["maxPrice"],
    message: "maxPrice must be greater than or equal to minPrice.",
  });

/**
 * GET /api/products — the catalogue, 12 products per page.
 * Example: /api/products?lang=ar&q=pain&category=pains&ingredients=riz,mais&exclude=lait&sort=price-asc&page=2
 * Prices (minPrice, maxPrice and in the results) are in millimes: 1 DT = 1000.
 */
export async function GET(request: NextRequest) {
  const query = productsQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  const { lang, ...filters } = query.data;
  return Response.json(await getProducts(lang, filters));
}
