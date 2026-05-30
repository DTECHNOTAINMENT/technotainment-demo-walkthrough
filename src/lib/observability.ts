/**
 * Error tracking + product analytics seams (Sentry + PostHog per docs/DECISIONS.md §1).
 * Phase 0 keeps these as no-op stubs that activate only when their env keys exist, so the
 * app boots with zero accounts. Real SDKs are wired in a later phase behind the same calls.
 * Structured JSON logs to stdout work with CloudWatch out of the box (INFRASTRUCTURE §1).
 */

export function captureError(err: unknown, context?: Record<string, unknown>): void {
  // if (process.env.SENTRY_DSN) { /* Sentry.captureException(err, { extra: context }) */ }
  log("error", { msg: "captureError", error: serialize(err), ...context });
}

export function trackEvent(event: string, props?: Record<string, unknown>): void {
  // if (process.env.POSTHOG_KEY) { /* posthog.capture(event, props) */ }
  log("info", { msg: "trackEvent", event, ...props });
}

export function log(level: "info" | "warn" | "error", fields: Record<string, unknown>): void {
  const line = JSON.stringify({ level, ts: new Date().toISOString(), ...fields });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

function serialize(err: unknown) {
  if (err instanceof Error) return { name: err.name, message: err.message, stack: err.stack };
  return { value: String(err) };
}
