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
        // Poster image as the container background so there is ALWAYS a visible frame where the
        // video sits (the <video> poster can be blank while HLS loads, and the demo test stream
        // can be slow/unreachable — this guarantees an image is shown, never an empty black box).
        background: poster ? `#000 url(${poster}) center/cover no-repeat` : "#000",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        controls
        playsInline
        style={{ width: "100%", height: "100%", display: "block", position: "relative", zIndex: 1 }}
      />
      {live && (
        <span className="live-pill" style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
          live
        </span>
      )}
      {error && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: poster ? `rgba(0,0,0,0.45) url(${poster}) center/cover no-repeat` : "rgba(0,0,0,0.6)",
            textAlign: "center",
            padding: 16,
          }}
        >
          <div style={{ background: "rgba(0,0,0,0.55)", padding: "14px 18px", borderRadius: 12, backdropFilter: "blur(4px)" }}>
            <div style={{ fontSize: 14, fontWeight: 800 }} className="lower">demo preview</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }} className="lower">
              video playback connects when Mux is configured.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
