import { definePrismaConfig } from "prisma/config";
import { defineConfig as ormConfig } from "@prisma/orm-postgres/config";

// Load variables from .env (Node.js built-in). In production the variables
// come from the hosting platform, so a missing .env file is not an error.
try {
  process.loadEnvFile(".env");
} catch {
  // no .env file — use the real environment variables
}

/**
 * Prisma 8 configuration.
 * - The data contract (our database schema) lives in prisma/contract.prisma.
 * - After editing it, run: pnpm db:emit  (regenerates contract.json + contract.d.ts)
 * - Then apply it to your local database: pnpm db:push
 */
export default definePrismaConfig({
  skills: {
    agents: ["claude"],
  },
  orm: ormConfig({
    contract: "./prisma/contract.prisma",
    db: {
      connection: process.env.DATABASE_URL!,
    },
    migrations: { dir: "prisma/migrations" },
  }),
});
