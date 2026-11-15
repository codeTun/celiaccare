import { connection } from "next/server";

import { pingDatabase } from "@/models/fetchers/stats";

/**
 * GET /api/health — is the website able to reach its database?
 * 200 { ok: true, db: "up" } or 503 { ok: false, db: "down" } (for uptime monitors).
 */
export async function GET() {
  // Always answer at request time (never a copy made during `next build`).
  await connection();

  const headers = { "Cache-Control": "no-store" };
  try {
    await pingDatabase();
    return Response.json({ ok: true, db: "up" }, { headers });
  } catch (error) {
    console.error("[health] database ping failed", error);
    return Response.json({ ok: false, db: "down" }, { status: 503, headers });
  }
}
