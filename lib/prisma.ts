import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";

import type { Contract } from "@/prisma/contract.d";
import contractJson from "@/prisma/contract.json" with { type: "json" };

/**
 * The single database client of the app (Prisma ORM 8 + PostgreSQL).
 *   import { db } from "@/lib/prisma";
 *   const product = await db.orm.public.Product.first({ slug });
 *
 * - Only server code may use it (models/, scripts). Components never import it.
 * - `next dev` reloads modules often: we keep ONE client per process on
 *   `globalThis`, keyed by the contract hash so a re-emitted contract gets a
 *   fresh client without restarting the dev server.
 * - The connection pool opens lazily, at the first query.
 */
export const contract = contractFromJson<Contract>(contractJson);

function createDb() {
  return postgres({
    contract,
    url: process.env.DATABASE_URL,
    poolOptions: { connectionTimeoutMillis: 10_000, idleTimeoutMillis: 30_000 },
  });
}

export type Db = ReturnType<typeof createDb>;

const key = `${contract.storage.storageHash}:${contract.execution.executionHash}`;
const globalForDb = globalThis as unknown as { __celiaccareDb?: { key: string; db: Db } };

function getDb(): Db {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  if (globalForDb.__celiaccareDb?.key === key) return globalForDb.__celiaccareDb.db;
  const stale = globalForDb.__celiaccareDb?.db;
  const client = createDb();
  if (process.env.NODE_ENV !== "production") globalForDb.__celiaccareDb = { key, db: client };
  if (stale) void stale.close();
  // Open the connection pool now, outside any cached function: otherwise the first
  // cached queries of a page would all wait on the same "connecting" promise.
  void warmUp(client);
  return client;
}

async function warmUp(client: Db) {
  try {
    await client.orm.public.Category.select("id").limit(1).all();
  } catch {
    // database not reachable yet: the first real query will report the error
  }
}

export const db: Db = getDb();
