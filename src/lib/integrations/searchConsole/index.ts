/**
 * Search Console resolver (docs/INTEGRATIONS.md §3). Real Google adapter only when
 * GOOGLE_SEARCH_CONSOLE_KEY is present; otherwise the sample-stats mock.
 */
import { googleSearchConsole } from "./google";
import { mockSearchConsole } from "./mock";

export type { SearchConsoleProvider, SearchStats, SearchStatRow } from "./types";

export const searchConsole = process.env.GOOGLE_SEARCH_CONSOLE_KEY
  ? googleSearchConsole
  : mockSearchConsole;
