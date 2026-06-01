/**
 * Canonical internal URL builders. ONE source of truth so links can't drift
 * (the prototype/app had a mix of /c/<id>, /c/@handle and /c/<handle>).
 *
 * Canonical channel form is the BARE handle: /c/<handle> with no leading "@".
 * Handles are stored WITH "@" in the data model, so channelHref() strips it.
 */

/** Canonical channel URL from a handle (with or without a leading "@") — /c/<handle>. */
export function channelHref(handle: string): string {
  return `/c/${bareHandle(handle)}`;
}

/** A handle without its leading "@" (the canonical, URL-safe form). */
export function bareHandle(handle: string): string {
  return handle.replace(/^@+/, "");
}

export type ChannelRouteResolution =
  | { kind: "ok"; handle: string } // the lookup handle to load (stored WITH "@")
  | { kind: "redirect"; to: string } // 301/308 to the canonical bare-handle URL
  | { kind: "notfound" };

/**
 * Resolve an incoming /c/<param> segment to the canonical channel, deciding whether to load
 * or permanently redirect. Pure + injectable lookups so it's unit-testable without Next/Prisma.
 *
 *  - "@saberesports"  -> redirect to /c/saberesports         (strip the @)
 *  - "saberesports"   -> ok, load "@saberesports"            (canonical)
 *  - "marlowe" (id)   -> redirect to /c/marlowestudio        (id -> handle)
 *
 * @param raw           the decoded route segment
 * @param handleExists  true if "@<bare>" is a real channel handle
 * @param handleForId   given a creator id, its handle (with "@") or null
 */
export function resolveChannelRoute(
  raw: string,
  handleExists: (handleWithAt: string) => boolean,
  handleForId: (id: string) => string | null,
): ChannelRouteResolution {
  const trimmed = raw.trim();
  if (!trimmed) return { kind: "notfound" };

  // Any "@"-prefixed form is non-canonical → redirect to the bare handle.
  if (trimmed.startsWith("@")) {
    return { kind: "redirect", to: channelHref(trimmed) };
  }

  const withAt = `@${trimmed}`;
  if (handleExists(withAt)) {
    return { kind: "ok", handle: withAt };
  }

  // Not a handle — maybe it's a creator id (legacy /c/<id>) → redirect to its handle.
  const handle = handleForId(trimmed);
  if (handle) {
    return { kind: "redirect", to: channelHref(handle) };
  }

  return { kind: "notfound" };
}
