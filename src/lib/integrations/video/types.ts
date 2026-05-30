/**
 * VideoProvider port — implements docs/INTEGRATIONS.md §2/§4 ("Video / live").
 * App code imports only this interface via ../video (index.ts). Never call Mux directly.
 * Real provider: Mux (ingest/transcode/VOD). See docs/DECISIONS.md §1.
 */

export type PlaybackStatus = "ready" | "processing";

export interface Playback {
  hlsUrl: string;
  poster: string;
  status: PlaybackStatus;
}

export interface LiveStream {
  streamId: string;
  streamKey: string;
  rtmpUrl: string;
  playbackId: string;
}

export interface VideoProvider {
  /** Begin a direct upload; the client PUTs the file to uploadUrl. */
  createUpload(input: { channelId: string }): Promise<{ uploadUrl: string; assetId: string }>;
  /** Resolve playback details (HLS + poster) for an asset. */
  getPlayback(assetId: string): Promise<Playback>;
  /** Provision a live ingest endpoint + playback id. */
  createLiveStream(input: { channelId: string }): Promise<LiveStream>;
  /** End a live stream; returns the VOD recording asset id. */
  endLiveStream(streamId: string): Promise<{ recordingAssetId: string }>;
}
