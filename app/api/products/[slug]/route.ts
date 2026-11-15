import type { NextRequest } from "next/server";

import { badRequestResponse, langOnlyQuery, notFoundResponse, queryParams, slugParam } from "@/app/api/_lib/http";
import { getProductBySlug } from "@/models/fetchers/products";

/** GET /api/products/pain-de-riz?lang=fr — one product sheet (ingredients, producer, latest reviews). */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/products/[slug]">) {
  const query = langOnlyQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  const { slug } = await ctx.params;
  if (!slugParam.safeParse(slug).success) return notFoundResponse();

  const product = await getProductBySlug(query.data.lang, slug);
  return product ? Response.json(product) : notFoundResponse();
}
