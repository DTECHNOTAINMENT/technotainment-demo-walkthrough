/**
 * Storage resolver (docs/INTEGRATIONS.md §3). Real S3/R2 adapter only when
 * STORAGE_ACCESS_KEY_ID is present; otherwise the local in-memory mock.
 */
import { mockStorage } from "./mock";
import { s3Storage } from "./s3";

export type { StorageProvider } from "./types";

export const storage = process.env.STORAGE_ACCESS_KEY_ID ? s3Storage : mockStorage;
