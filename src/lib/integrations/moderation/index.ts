/**
 * Moderation resolver (docs/INTEGRATIONS.md §3). Real Hive/OpenAI adapter only
 * when HIVE_API_KEY or OPENAI_API_KEY is present; otherwise the always-"pass" mock.
 */
import { hiveModeration } from "./hive";
import { mockModeration } from "./mock";

export type { ModerationProvider, ModerationVerdict, ModerationResult } from "./types";

export const moderation =
  process.env.HIVE_API_KEY || process.env.OPENAI_API_KEY ? hiveModeration : mockModeration;
