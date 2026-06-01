"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * Reliable image: renders the preferred (category) image, but if it errors OR is too slow to
 * load, swaps to a guaranteed-loading fallback (Picsum) so a tile NEVER stays blank. Fills its
 * positioned parent. Used for every grid/rail thumbnail.
 */
export function SmartImg({
  src,
  fallback,
  alt = "",
  timeoutMs = 4000,
  style,
}: {
  src: string;
  /** guaranteed-loading replacement if `src` fails or stalls. */
  fallback: string;
  alt?: string;
  timeoutMs?: number;
  style?: CSSProperties;
}) {
  const [current, setCurrent] = useState(src);
  const loadedRef = useRef(false);
  const usedFallbackRef = useRef(false);

  function toFallback() {
    if (!usedFallbackRef.current && fallback && fallback !== current) {
      usedFallbackRef.current = true;
      setCurrent(fallback);
    }
  }

  useEffect(() => {
    loadedRef.current = false;
    usedFallbackRef.current = false;
    setCurrent(src);
    // If the preferred image hasn't loaded within the budget, fall back (covers slow/rate-limited CDNs).
    const t = setTimeout(() => {
      if (!loadedRef.current) toFallback();
    }, timeoutMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, fallback, timeoutMs]);

  return (
    <img
      src={current}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={() => {
        loadedRef.current = true;
      }}
      onError={toFallback}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...style,
      }}
    />
  );
}
