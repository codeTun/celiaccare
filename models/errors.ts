import "server-only";

/**
 * Database error helpers. Postgres errors from Prisma 8 are "SqlQueryError"
 * objects carrying the Postgres error code in `sqlState`:
 *   23505 = unique violation (e.g. slug already used)
 *   23503 / 23001 = foreign key / restrict violation (e.g. deleting a category that still has products)
 *   23514 = check violation
 */
type PgError = Error & { name: "SqlQueryError"; sqlState?: string; constraint?: string; detail?: string };

export function isPgError(error: unknown): error is PgError {
  return error instanceof Error && error.name === "SqlQueryError";
}

export function isUniqueViolation(error: unknown, constraint?: string) {
  return isPgError(error) && error.sqlState === "23505" && (!constraint || error.constraint === constraint);
}

/** 23503 foreign_key_violation, or 23001 restrict_violation (onDelete: Restrict, e.g. a category that still has products). */
export function isForeignKeyViolation(error: unknown) {
  return isPgError(error) && (error.sqlState === "23503" || error.sqlState === "23001");
}

/** Thrown by models for expected business errors, e.g. new ModelError("SLUG_TAKEN"). */
export class ModelError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "ModelError";
  }
}
