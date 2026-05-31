/**
 * Mock VideoProvider — docs/INTEGRATIONS.md §2. Works with NO Mux account:
 * deterministic ids + the public test HLS stream. The player UI component plays
 * this identically to a real Mux URL.
 */
import { mockId } from "../_shared/mockId";
import type { LiveStream, Playback, VideoProvider } from "./types";

/**
 * Real, freely-hosted sample films (Google's public gtv-videos bucket). These actually PLAY
 * in the demo with no Mux account — MP4 plays natively in every browser. getPlayback() keys a
 * deterministic film off the assetId so each video/stream shows a different real clip (not all
 * the same), and the same id always resolves to the same film (stable across renders).
 */
const SAMPLE_MP4S = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
];

/** Stable index into SAMPLE_MP4S from an assetId (FNV-1a), so playback is deterministic. */
function sampleFor(assetId: string): string {
  let h = 2166136261;
  for (let i = 0; i < assetId.length; i++) {
    h ^= assetId.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return SAMPLE_MP4S[(h >>> 0) % SAMPLE_MP4S.length];
}

export const mockVideo: VideoProvider = {
  async createUpload({ channelId }) {
    return {
      uploadUrl: "/api/mock/upload",
      assetId: mockId("asset", `upload:${channelId}`),
    };
  },

  async getPlayback(assetId): Promise<Playback> {
    // Real adapters resolve per-asset; the mock returns a real sample film (deterministic per
    // assetId) so previews actually play, and the player paints the page-supplied poster behind it.
    return {
      hlsUrl: sampleFor(assetId ?? ""),
      poster: "",
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
