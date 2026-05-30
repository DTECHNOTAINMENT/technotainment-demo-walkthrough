"use client";

import { useEffect, useState } from "react";

// Cookie / consent banner (Phase 6). Records the choice in localStorage; a real CMP can replace
// this behind the same surface. Non-essential analytics stay off until accepted.
const KEY = "tt-cookie-consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function choose(v: "accepted" | "rejected") {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-label="cookie consent"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 60,
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ flex: 1, minWidth: 220, fontSize: 13, color: "var(--ink-2)" }} className="lower">
          we use essential cookies to run the service, and optional analytics to improve it. see our{" "}
          <a href="/legal/privacy" className="brand-grad-text" style={{ fontWeight: 700 }}>
            privacy policy
          </a>
          .
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-glass lower" onClick={() => choose("rejected")}>
            essential only
          </button>
          <button type="button" className="btn btn-grad lower" onClick={() => choose("accepted")}>
            accept all
          </button>
        </div>
      </div>
    </div>
  );
}
