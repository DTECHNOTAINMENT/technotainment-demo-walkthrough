/**
 * Mock ModerationProvider — docs/INTEGRATIONS.md §4. No Hive/OpenAI account
 * needed: always returns "pass" so content flows proceed offline.
 */
import type { ModerationProvider } from "./types";

export const mockModeration: ModerationProvider = {
  async check() {
    return { verdict: "pass", categories: [], score: 0 };
  },
};
