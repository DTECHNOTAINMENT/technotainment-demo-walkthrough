/**
 * Mock ContentIdProvider — docs/INTEGRATIONS.md §4. No Audible Magic account
 * needed: always returns "clear" so uploads proceed offline.
 */
import type { ContentIdProvider } from "./types";

export const mockContentId: ContentIdProvider = {
  async scan() {
    return { result: "clear", matches: [] };
  },
};
