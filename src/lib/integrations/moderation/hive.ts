/**
 * Real ModerationProvider adapter — Hive (image/video) or OpenAI (text)
 * (docs/INTEGRATIONS.md §4). Selected when HIVE_API_KEY or OPENAI_API_KEY is present.
 *
 * Phase 6 real implementation:
 *   // Hive visual moderation for image/video; OpenAI moderations endpoint for text.
 *   // Map category scores → verdict; "flag" holds for human review (DECISIONS §2).
 */
import type { ModerationProvider } from "./types";

const NOT_IMPL = "hive/openai moderation adapter not yet implemented — Phase 6";

export const hiveModeration: ModerationProvider = {
  async check() {
    throw new Error(NOT_IMPL);
  },
};
