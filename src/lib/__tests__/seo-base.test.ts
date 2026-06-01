/**
 * SEO base-URL guard: in prod mode, NO rendered <head> URL (canonical, og:url, og:image,
 * twitter:image) may ever contain localhost. Regression test for the hardcoded
 * http://localhost:3000 metadata base.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { appUrl, canonical, ogImage, buildMetadata } from "@/lib/seo/meta";

const ENV_KEYS = ["APP_URL", "NEXT_PUBLIC_SITE_URL", "VERCEL_PROJECT_PRODUCTION_URL", "VERCEL_URL", "LAUNCH_MODE"];
const saved: Record<string, string | undefined> = {};

function clearEnv() {
  for (const k of ENV_KEYS) delete process.env[k];
}

/** Pull every URL-ish string out of a Next Metadata object's head fields. */
function metaUrls(m: ReturnType<typeof buildMetadata>): string[] {
  const urls: string[] = [];
  const canon = m.alternates?.canonical;
  if (typeof canon === "string") urls.push(canon);
  const og = m.openGraph as { url?: string; images?: { url: string }[] } | undefined;
  if (og?.url) urls.push(og.url);
  for (const img of og?.images ?? []) urls.push(img.url);
  const tw = m.twitter as { images?: string[] } | undefined;
  for (const img of tw?.images ?? []) urls.push(img);
  return urls;
}

describe("SEO base URL", () => {
  beforeEach(() => {
    for (const k of ENV_KEYS) saved[k] = process.env[k];
    clearEnv();
  });
  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  it("never emits localhost in prod, even with no env configured", () => {
    process.env.LAUNCH_MODE = "prod";
    expect(appUrl()).not.toContain("localhost");
    expect(canonical("/c/saberesports")).not.toContain("localhost");
    expect(ogImage({ title: "x" })).not.toContain("localhost");

    const meta = buildMetadata({ title: "t", description: "d", path: "/watch/x" });
    const urls = metaUrls(meta);
    expect(urls.length).toBeGreaterThan(0);
    for (const u of urls) expect(u).not.toContain("localhost");
  });

  it("uses APP_URL when set and strips a trailing slash", () => {
    process.env.LAUNCH_MODE = "prod";
    process.env.APP_URL = "https://metascape.example/";
    expect(appUrl()).toBe("https://metascape.example");
    expect(canonical("/c/x")).toBe("https://metascape.example/c/x");
  });

  it("derives an https origin from VERCEL_URL (no protocol given)", () => {
    process.env.LAUNCH_MODE = "prod";
    process.env.VERCEL_URL = "preview-abc.vercel.app";
    expect(appUrl()).toBe("https://preview-abc.vercel.app");
  });
});
