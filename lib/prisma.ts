import postgres from "@prisma/orm-postgres/runtime";
import { contractFromJson } from "@prisma/orm-postgres/static";
import { Pool } from "pg";

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
 * - The pool is SMALL on purpose (DATABASE_POOL_MAX, 5 by default). Hosted databases accept
 *   few connections in total (Prisma Postgres: 50), and every build worker and every
 *   serverless instance on Vercel has its own pool. Too many connections = "remaining
 *   connection slots are reserved" errors and a failed build (see next.config.ts `cpus`).
 * - The pool belongs to us, not to Prisma: scripts end with `await closeDb()`.
 */
export const contract = contractFromJson<Contract>(contractJson);

const POOL_MAX = Number(process.env.DATABASE_POOL_MAX) || 5;

function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: POOL_MAX,
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
  });
  // The database can drop an idle connection (restart, network): log it, never crash the server.
  pool.on("error", (error) => console.error("[db] idle connection closed:", error.message));
  return pool;
}

function createDb(pool: Pool) {
  // Prisma still applies its session settings to every connection of a pool we give it.
  return postgres({ contract, pg: pool });
}

export type Db = ReturnType<typeof createDb>;

type DbInstance = { key: string; db: Db; pool: Pool };

const key = `${contract.storage.storageHash}:${contract.execution.executionHash}`;
const globalForDb = globalThis as unknown as { __celiaccareDb?: DbInstance };

function getInstance(): DbInstance {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  }
  if (globalForDb.__celiaccareDb?.key === key) return globalForDb.__celiaccareDb;
  const stale = globalForDb.__celiaccareDb;
  const pool = createPool();
  const instance: DbInstance = { key, db: createDb(pool), pool };
  if (process.env.NODE_ENV !== "production") globalForDb.__celiaccareDb = instance;
  if (stale) void closeInstance(stale).catch(() => undefined);
  // Open the connection pool now, outside any cached function: otherwise the first
  // cached queries of a page would all wait on the same "connecting" promise.
  void warmUp(instance.db);
  return instance;
}

async function warmUp(client: Db) {
  try {
    await client.orm.public.Category.select("id").limit(1).all();
  } catch {
    // database not reachable yet: the first real query will report the error
  }
}

async function closeInstance(instance: DbInstance) {
  await instance.db.close(); // waits for the queries already running
  await instance.pool.end(); // then closes the connections
}

const instance = getInstance();

export const db: Db = instance.db;

/** For scripts (seed, admin:create): close the database so Node can exit. */
export function closeDb(): Promise<void> {
  return closeInstance(instance);
}
