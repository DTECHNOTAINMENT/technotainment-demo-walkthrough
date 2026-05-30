/**
 * Mock VideoProvider — docs/INTEGRATIONS.md §2. Works with NO Mux account:
 * deterministic ids + the public test HLS stream. The player UI component plays
 * this identically to a real Mux URL.
 */
import { mockId } from "../_shared/mockId";
import type { LiveStream, Playback, VideoProvider } from "./types";

/** Public test stream from docs/INTEGRATIONS.md §2 — plays offline in dev. */
const PUBLIC_TEST_HLS = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

export const mockVideo: VideoProvider = {
  async createUpload({ channelId }) {
    return {
      uploadUrl: "/api/mock/upload",
      assetId: mockId("asset", `upload:${channelId}`),
    };
  },

  async getPlayback(_assetId): Promise<Playback> {
    // Real adapters resolve per-asset; the mock returns the fixed public test
    // stream so previews always render regardless of assetId.
    return {
      hlsUrl: PUBLIC_TEST_HLS,
      poster: "/samples/poster.jpg",
      status: "ready",
    };
  },

  async createLiveStream({ channelId }): Promise<LiveStream> {
    const seed = `live:${channelId}`;
    return {
      streamId: mockId("stream", seed),
      streamKey: mockId("key", seed),
      rtmpUrl: "rtmp://mock/live",
      playbackId: mockId("live", seed),
    };
  },

  async endLiveStream(streamId) {
    return { recordingAssetId: mockId("rec", `end:${streamId}`) };
  },
};
