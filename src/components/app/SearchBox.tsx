"use client";

// Live type-ahead search — ported from prototype/v4/search.jsx SearchBox.
// There's no search-suggest API, so as you type (debounced) we show an honest dropdown of
// popular/recent searches plus a "search for <q>" row. Enter (or that row) navigates to
// /search?q=, where the server actually resolves matches. Clicking a popular term seeds the box.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

// Popular searches stand in for a suggest endpoint — plausible terms drawn from the catalogue.
const POPULAR = ["ceramics", "live coding", "field recordings", "chess", "skate", "woodworking"];

export function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [debounced, setDebounced] = useState("");
  const wrap = useRef<HTMLFormElement>(null);

  // debounce the typed term so the dropdown only re-filters after a short pause
  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 160);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(term: string) {
    const t = term.trim();
    if (!t) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    go(q);
  }

  const lc = debounced.toLowerCase();
  const matches = lc ? POPULAR.filter((p) => p.includes(lc)) : POPULAR;

  return (
    <form
      ref={wrap}
      onSubmit={submit}
      style={{ flex: 1, maxWidth: 560, position: "relative" }}
    >
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }}>
        <Icon name="search" size={17} />
      </span>
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="search creators, microcasts, drops…"
        aria-label="search"
        className="lower"
        style={{
          width: "100%",
          padding: "9px 12px 9px 36px",
          borderRadius: 10,
          background: "var(--surface-2)",
          border: "1px solid var(--hairline)",
          color: "var(--ink-1)",
          fontSize: 13,
        }}
      />
      {q && (
        <button
          type="button"
          aria-label="clear search"
          onClick={() => {
            setQ("");
            setOpen(false);
          }}
          style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-4)" }}
        >
          <Icon name="close" size={13} />
        </button>
      )}

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            background: "var(--surface)",
            border: "1px solid var(--hairline)",
            borderRadius: 14,
            boxShadow: "var(--shadow-pop)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          <div className="lower" style={{ padding: "10px 14px 6px", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>
            {debounced ? "popular matches" : "popular searches"}
          </div>
          {matches.length === 0 ? (
            <div className="lower" style={{ padding: "8px 14px 12px", fontSize: 13, color: "var(--ink-3)" }}>
              no popular matches — press enter to search everything.
            </div>
          ) : (
            matches.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => go(p)}
                className="lower"
                style={{ width: "100%", padding: "9px 14px", display: "flex", alignItems: "center", gap: 10, textAlign: "left", color: "var(--ink-1)", fontSize: 13 }}
              >
                <Icon name="search" size={13} stroke={2.2} style={{ color: "var(--ink-4)" }} />
                <span style={{ flex: 1 }}>{p}</span>
                <Icon name="chevR" size={12} stroke={2.2} style={{ color: "var(--ink-4)" }} />
              </button>
            ))
          )}
          {debounced && (
            <button
              type="submit"
              className="lower"
              style={{ width: "100%", padding: "12px 14px", textAlign: "center", fontSize: 12, color: "var(--ink-3)", background: "var(--surface-2)", borderTop: "1px solid var(--hairline)" }}
            >
              search for &ldquo;<strong style={{ color: "var(--ink-1)" }}>{debounced}</strong>&rdquo; &rarr;
            </button>
          )}
        </div>
      )}
    </form>
  );
}
