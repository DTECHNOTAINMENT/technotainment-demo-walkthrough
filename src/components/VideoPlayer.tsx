"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HLS player built against an `hlsUrl` (the VideoProvider interface), not against Mux.
 * In dev the mock returns a public test stream; in prod it's the Mux URL — same component.
 * Uses native HLS where supported (Safari) and lazy-loads hls.js elsewhere.
 */
export function VideoPlayer({
  hlsUrl,
  poster,
  live = false,
}: {
  hlsUrl: string;
  poster?: string;
  live?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
      return;
    }

    let destroyed = false;
    let hls: { destroy(): void } | null = null;
    import("hls.js")
      .then(({ default: Hls }) => {
        if (destroyed) return;
        if (Hls.isSupported()) {
          const instance = new Hls({ enableWorker: true, lowLatencyMode: live });
          instance.loadSource(hlsUrl);
          instance.attachMedia(video);
          instance.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) setError(true);
          });
          hls = instance;
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));

    return () => {
      destroyed = true;
      hls?.destroy();
    };
  }, [hlsUrl, live]);

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: "16 / 9",
        background: "#000",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        style={{ width: "100%", height: "100%", display: "block" }}
      />
      {live && (
        <span className="live-pill" style={{ position: "absolute", top: 12, left: 12 }}>
          live
        </span>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: "rgba(0,0,0,0.6)",
            fontSize: 14,
          }}
        >
          stream unavailable
        </div>
      )}
    </div>
  );
}
