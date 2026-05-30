/**
 * Real VideoProvider adapter — Mux (docs/INTEGRATIONS.md §2/§4, docs/DECISIONS.md §1).
 * Selected only when MUX_TOKEN_ID is present. The Mux SDK is NOT installed in
 * Phase 0, so these are throwing stubs — the interface + wiring is what matters now.
 *
 * Phase 6 real implementation will:
 *   // import Mux from "@mux/mux-node";
 *   // const mux = new Mux({ tokenId: process.env.MUX_TOKEN_ID, tokenSecret: process.env.MUX_TOKEN_SECRET });
 * and map Mux Assets / Live Streams onto this port.
 */
import type { VideoProvider } from "./types";

const NOT_IMPL = "mux video adapter not yet implemented — Phase 6";

export const muxVideo: VideoProvider = {
  async createUpload() {
    throw new Error(NOT_IMPL);
  },
  async getPlayback() {
    throw new Error(NOT_IMPL);
  },
  async createLiveStream() {
    throw new Error(NOT_IMPL);
  },
  async endLiveStream() {
    throw new Error(NOT_IMPL);
  },
};
