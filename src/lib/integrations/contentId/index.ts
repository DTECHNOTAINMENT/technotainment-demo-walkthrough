/**
 * Content-ID resolver (docs/INTEGRATIONS.md §3). Real Audible Magic adapter only
 * when AUDIBLE_MAGIC_API_KEY is present; otherwise the always-"clear" mock.
 */
import { audibleMagicContentId } from "./audibleMagic";
import { mockContentId } from "./mock";

export type { ContentIdProvider, ContentIdResult, ContentIdScan } from "./types";

export const contentId = process.env.AUDIBLE_MAGIC_API_KEY ? audibleMagicContentId : mockContentId;
