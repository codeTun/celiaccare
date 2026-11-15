import type { NextRequest } from "next/server";

import { badRequestResponse, langOnlyQuery, queryParams } from "@/app/api/_lib/http";
import { getCategories } from "@/models/fetchers/categories";

/** GET /api/categories?lang=fr — every category with its number of public products. */
export async function GET(request: NextRequest) {
  const query = langOnlyQuery.safeParse(queryParams(request));
  if (!query.success) return badRequestResponse(query.error);

  return Response.json(await getCategories(query.data.lang));
}
