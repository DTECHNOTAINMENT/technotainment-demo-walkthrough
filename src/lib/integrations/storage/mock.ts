/**
 * Mock StorageProvider — docs/INTEGRATIONS.md §4. No S3/R2 account needed:
 * maps keys onto local "/public"-style paths and keeps put bodies in memory so
 * the full upload→serve flow is testable offline. Deterministic.
 */
import type { StorageProvider } from "./types";

/** In-memory object store (per process) — stand-in for the bucket. */
const objects = new Map<string, { body: Uint8Array | string; contentType: string }>();

/** Local public path prefix (served from /public in dev). */
const PUBLIC_PREFIX = "/uploads";

function publicUrl(key: string): string {
  return `${PUBLIC_PREFIX}/${key.replace(/^\/+/, "")}`;
}

export const mockStorage: StorageProvider = {
  async getUploadUrl({ key }) {
    // Client "uploads" to a local mock endpoint; key is echoed back.
    return { uploadUrl: `/api/mock/storage?key=${encodeURIComponent(key)}`, key };
  },

  getPublicUrl(key) {
    return publicUrl(key);
  },

  async put({ key, body, contentType }) {
    objects.set(key, { body, contentType });
    return { key };
  },

  async delete(key) {
    objects.delete(key);
  },
};
