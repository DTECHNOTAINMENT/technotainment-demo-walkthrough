/**
 * Deterministic id helpers for the mock adapters (docs/INTEGRATIONS.md §5
 * "Seed mocks to be realistic"). Mocks must be reproducible with NO network and
 * NO secrets, so we avoid crypto.randomUUID() and instead derive stable,
 * realistic-looking ids from a monotonic counter + an optional seed.
 */

let counter = 0;

/** A small deterministic, monotonic sequence (per-process). */
function nextSeq(): number {
  counter += 1;
  return counter;
}

/** FNV-1a hash → short hex, so the same seed always yields the same suffix. */
function hashHex(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/**
 * Build a deterministic mock id like "mock_upload_a1b2c3d4".
 * If `seed` is given the suffix is stable for that seed; otherwise a process
 * sequence makes successive calls distinct but still reproducible per run.
 */
export function mockId(prefix: string, seed?: string): string {
  const suffix = seed != null ? hashHex(seed) : nextSeq().toString(36).padStart(6, "0");
  return `mock_${prefix}_${suffix}`;
}
