/**
 * Video resolver (docs/INTEGRATIONS.md §3). Real Mux adapter only when its env
 * key (MUX_TOKEN_ID) is present; otherwise the deterministic offline mock.
 */
import { mockVideo } from "./mock";
import { muxVideo } from "./mux";

export type { VideoProvider, Playback, LiveStream, PlaybackStatus } from "./types";

export const video = process.env.MUX_TOKEN_ID ? muxVideo : mockVideo;
