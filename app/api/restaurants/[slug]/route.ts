import type { NextRequest } from "next/server";

import { badRequestResponse, langOnlyQuery, notFoundResponse, queryParams, slugParam } from "@/app/api/_lib/http";
import { getRestaurantBySlug } from "@/models/fetchers/restaurants";

/** GET /api/restaurants/le-jardin?lang=ar — one restaurant sheet with its menu and latest reviews. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/restaurants/[slug]">) {
  const query = langOnlyQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  const { slug } = await ctx.params;
  if (!slugParam.safeParse(slug).success) return notFoundResponse();

  const restaurant = await getRestaurantBySlug(query.data.lang, slug);
  return restaurant ? Response.json(restaurant) : notFoundResponse();
}
