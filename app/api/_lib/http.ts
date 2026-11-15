import "server-only";

import type { NextRequest } from "next/server";
import { z } from "zod";

import { LOCALES } from "@/types";

/* ==========================================================================
   Shared helpers of the public REST API (app/api/**).
   The folder starts with "_": Next.js never turns it into a URL.
   Every endpoint is read-only, returns JSON DTOs (public fields only) and reuses
   the cached fetchers of models/fetchers.
   ========================================================================== */

/** ?lang=fr|ar — French when missing. (Route handlers cannot read the [lang] of the website.) */
export const langParam = z.enum(LOCALES).default("fr");

/** A URL slug: "pain-de-riz". */
export const slugParam = z
  .string()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug.");

/** A comma-separated list of slugs: "riz,mais" -> ["riz", "mais"] (20 at most). */
export const slugListParam = z
  .string()
  .transform((value) =>
    value
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean),
  )
  .pipe(z.array(slugParam).max(20));

/** An amount in millimes (1 DT = 1000): "15000" -> 15000. */
export const millimesParam = z.coerce.number().int().min(0).max(100_000_000);

/** true / false written in a URL: "1", "true", "0", "false". */
export const booleanParam = z.enum(["1", "true", "0", "false"]).transform((value) => value === "1" || value === "true");

/** The query string as a plain object. Empty values are dropped: "?q=" means "no q". */
export function queryParams(request: NextRequest): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of request.nextUrl.searchParams) {
    if (value.trim() !== "") params[key] = value;
  }
  return params;
}

/** 400 — the query string is invalid; `fields` says which parameter and why. */
export function badRequestResponse(error: z.ZodError) {
  return Response.json({ error: "invalid_query", fields: z.flattenError(error).fieldErrors }, { status: 400 });
}

/** 404 — no public product / producer / restaurant with this slug. */
export function notFoundResponse() {
  return Response.json({ error: "not_found" }, { status: 404 });
}

/** Reads ?lang only (detail endpoints). */
export const langOnlyQuery = z.object({ lang: langParam });
