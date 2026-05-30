/**
 * Flags resolver (docs/INTEGRATIONS.md §3). Real LaunchDarkly/Statsig adapter only
 * when FEATURE_FLAG_SDK_KEY is present; otherwise the local-defaults mock.
 */
import { launchDarklyFlags } from "./launchdarkly";
import { mockFlags } from "./mock";

export type { FlagsProvider } from "./types";
export { FLAG_DEFAULTS } from "./defaults";
export type { FlagDefault } from "./defaults";

export const flags = process.env.FEATURE_FLAG_SDK_KEY ? launchDarklyFlags : mockFlags;
