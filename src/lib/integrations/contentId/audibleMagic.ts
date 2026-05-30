/**
 * Real ContentIdProvider adapter — Audible Magic (docs/INTEGRATIONS.md §4).
 * Selected when AUDIBLE_MAGIC_API_KEY is present.
 *
 * Phase 6 real implementation:
 *   // Submit the media fingerprint to Audible Magic, map identification → result.
 */
import type { ContentIdProvider } from "./types";

const NOT_IMPL = "audible magic content-id adapter not yet implemented — Phase 6";

export const audibleMagicContentId: ContentIdProvider = {
  async scan() {
    throw new Error(NOT_IMPL);
  },
};
