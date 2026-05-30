/**
 * Signed session tokens (HMAC-SHA256). The session lives in a cookie; signing it makes it
 * tamper-evident so a user can't edit their own role to "staff". Uses Web Crypto so it works in
 * BOTH the edge middleware and the node server. Format: `base64url(json).base64url(hmac)`.
 */
const enc = new TextEncoder();
const dec = new TextDecoder();

const DEV_FALLBACK = "dev-insecure-session-secret-change-me";

export function sessionSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.LAUNCH_MODE === "prod") {
    // Never run prod with the dev secret silently.
    console.error(JSON.stringify({ level: "error", msg: "SESSION_SECRET missing/weak in prod" }));
  }
  return DEV_FALLBACK;
}

function b64urlFromBytes(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytesFromB64url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signSession(payload: unknown, secret = sessionSecret()): Promise<string> {
  const body = b64urlFromBytes(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(secret), enc.encode(body));
  return `${body}.${b64urlFromBytes(new Uint8Array(sig))}`;
}

export async function verifySession<T>(token: string, secret = sessionSecret()): Promise<T | null> {
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const sigBytes = bytesFromB64url(sig);
    const ok = await crypto.subtle.verify("HMAC", await hmacKey(secret), sigBytes as unknown as BufferSource, enc.encode(body));
    if (!ok) return null;
    return JSON.parse(dec.decode(bytesFromB64url(body))) as T;
  } catch {
    return null;
  }
}
