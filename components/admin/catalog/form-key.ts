import "server-only";

import { createHash } from "node:crypto";

/**
 * Short fingerprint of the saved values of a sheet, used as the React `key` of its
 * edit form: when the data changes (e.g. a quick toggle in the list), a page kept
 * mounted by Next.js rebuilds its form from the fresh values instead of stale ones.
 */
export function formKey(data: unknown): string {
  return createHash("sha1").update(JSON.stringify(data)).digest("base64url").slice(0, 16);
}
