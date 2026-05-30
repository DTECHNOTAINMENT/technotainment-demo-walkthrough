/**
 * Real StorageProvider adapter — S3-compatible (Cloudflare R2 in dev, AWS S3 in
 * prod, SAME adapter — docs/INFRASTRUCTURE.md, docs/DECISIONS.md §1). Selected when
 * STORAGE_ACCESS_KEY_ID is present (with STORAGE_SECRET_ACCESS_KEY, STORAGE_BUCKET,
 * STORAGE_ENDPOINT/STORAGE_REGION).
 *
 * Phase 6 real implementation:
 *   // import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
 *   // import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
 *   // getUploadUrl → getSignedUrl(PutObjectCommand); getPublicUrl → CDN base + key.
 */
import type { StorageProvider } from "./types";

const NOT_IMPL = "s3/r2 storage adapter not yet implemented — Phase 6";

export const s3Storage: StorageProvider = {
  async getUploadUrl() {
    throw new Error(NOT_IMPL);
  },
  getPublicUrl() {
    throw new Error(NOT_IMPL);
  },
  async put() {
    throw new Error(NOT_IMPL);
  },
  async delete() {
    throw new Error(NOT_IMPL);
  },
};
