import type { NextRequest } from "next/server";

import { badRequestResponse, langOnlyQuery, notFoundResponse, queryParams, slugParam } from "@/app/api/_lib/http";
import { getProducerBySlug } from "@/models/fetchers/producers";

/** GET /api/producers/boulangerie-ennour?lang=fr — one producer sheet with its public products. */
export async function GET(request: NextRequest, ctx: RouteContext<"/api/producers/[slug]">) {
  const query = langOnlyQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  const { slug } = await ctx.params;
  if (!slugParam.safeParse(slug).success) return notFoundResponse();

  const producer = await getProducerBySlug(query.data.lang, slug);
  return producer ? Response.json(producer) : notFoundResponse();
}
