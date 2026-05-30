/**
 * Dynamic Open Graph image service (HANDOFF.md §7 "dynamic OG-image").
 * Renders a 1200x630 branded share card. Uses the Node.js runtime (not edge) to stay
 * portable on the container infra (docs/INFRASTRUCTURE.md). No external fonts.
 */
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { branding } from "@/lib/config";

export const runtime = "nodejs";

const BRAND_GRADIENT =
  "linear-gradient(90deg, #06b6d4 0%, #3b82f6 25%, #8b5cf6 50%, #ec4899 70%, #ef4444 88%, #f97316 100%)";

function clamp(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function GET(request: NextRequest): ImageResponse {
  const params = request.nextUrl.searchParams;
  const title = clamp(params.get("title") || branding.appName, 90);
  const subtitle = params.get("subtitle") ? clamp(params.get("subtitle") as string, 120) : "";
  const kind = params.get("kind") ? clamp(params.get("kind") as string, 24) : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0B0B12",
          padding: "72px",
          position: "relative",
        }}
      >
        {/* Brand gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "1200px",
            height: "12px",
            backgroundImage: BRAND_GRADIENT,
          }}
        />

        {/* Kind badge */}
        {kind ? (
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              fontSize: "26px",
              fontWeight: 600,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "#0B0B12",
              backgroundImage: BRAND_GRADIENT,
              padding: "8px 20px",
              borderRadius: "999px",
              marginBottom: "32px",
            }}
          >
            {kind}
          </div>
        ) : null}

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: "76px",
            fontWeight: 800,
            color: "#FFFFFF",
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
            marginTop: kind ? "0px" : "40px",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle ? (
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              fontWeight: 400,
              color: "#A1A1B0",
              lineHeight: 1.3,
              marginTop: "28px",
            }}
          >
            {subtitle}
          </div>
        ) : null}

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: "auto",
            fontSize: "30px",
            fontWeight: 600,
            color: "#FFFFFF",
            textTransform: "lowercase",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "8px",
              borderRadius: "999px",
              backgroundImage: BRAND_GRADIENT,
              marginRight: "18px",
            }}
          />
          metascape · technotainment
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
