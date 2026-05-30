/**
 * StorageProvider port — docs/INTEGRATIONS.md §4 ("CDN / storage"). S3-compatible
 * (Cloudflare R2 in dev, AWS S3 in prod — SAME adapter, see docs/INFRASTRUCTURE.md
 * & docs/DECISIONS.md §1). App code uploads via signed URLs and reads public URLs.
 */

export interface StorageProvider {
  /** Presigned URL the client PUTs an object to. */
  getUploadUrl(input: {
    key: string;
    contentType: string;
  }): Promise<{ uploadUrl: string; key: string }>;
  /** Public (CDN) URL for an object key. */
  getPublicUrl(key: string): string;
  /** Server-side put of raw bytes/text (e.g. generated OG images). */
  put(input: { key: string; body: Uint8Array | string; contentType: string }): Promise<{ key: string }>;
  /** Delete an object. */
  delete(key: string): Promise<void>;
}
