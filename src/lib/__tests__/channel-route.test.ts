/**
 * Canonical channel routing: the bare handle (/c/<handle>) is canonical; the @-prefixed and
 * legacy creator-id forms must 308-redirect to it. Pure resolver test (no Next/Prisma).
 */
import { describe, it, expect } from "vitest";
import { channelHref, bareHandle, resolveChannelRoute } from "@/lib/links";

// Fixture-like lookups: one real channel "@saberesports" whose creator id is "saber".
const handleExists = (h: string) => h === "@saberesports";
const handleForId = (id: string) => (id === "saber" ? "@saberesports" : null);

describe("channelHref / bareHandle", () => {
  it("strips a leading @ and builds the canonical path", () => {
    expect(channelHref("@saberesports")).toBe("/c/saberesports");
    expect(channelHref("saberesports")).toBe("/c/saberesports");
    expect(bareHandle("@x")).toBe("x");
  });
});

describe("resolveChannelRoute", () => {
  it("loads the canonical bare-handle form", () => {
    expect(resolveChannelRoute("saberesports", handleExists, handleForId)).toEqual({
      kind: "ok",
      handle: "@saberesports",
    });
  });

  it("redirects the @-prefixed form to the bare handle", () => {
    expect(resolveChannelRoute("@saberesports", handleExists, handleForId)).toEqual({
      kind: "redirect",
      to: "/c/saberesports",
    });
  });

  it("redirects a legacy creator-id form to the canonical handle", () => {
    expect(resolveChannelRoute("saber", handleExists, handleForId)).toEqual({
      kind: "redirect",
      to: "/c/saberesports",
    });
  });

  it("returns notfound for an unknown segment", () => {
    expect(resolveChannelRoute("nope", handleExists, handleForId)).toEqual({ kind: "notfound" });
  });
});
