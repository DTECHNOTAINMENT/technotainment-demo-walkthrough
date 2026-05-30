"use client";

/**
 * StUploadButton — kicks off an upload. POSTs /api/studio/videos { title } to create
 * the draft Video row (Mux mock returns an uploadUrl we don't need for the demo), then
 * routes to the new video's editor. Mirrors the prototype's upload modal entry point,
 * simplified to a title prompt → editor handoff (the file just needs the row created).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateResponse {
  videoId: string;
  slug: string;
  uploadUrl: string;
  error?: string;
}

export function StUploadButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    const trimmed = title.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/studio/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: trimmed }),
      });
      const data = (await res.json()) as CreateResponse;
      if (!res.ok || !data.videoId) {
        setError(data.error ?? "upload failed");
        setBusy(false);
        return;
      }
      router.push(`/studio/content/${data.videoId}`);
      router.refresh();
    } catch {
      setError("network error");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-grad lower" style={{ padding: "12px 18px" }}>
        upload
      </button>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void create();
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="give your video a title"
        disabled={busy}
        style={{
          padding: "11px 13px",
          borderRadius: 10,
          border: "1px solid var(--hairline)",
          background: "var(--surface-2)",
          color: "var(--ink-1)",
          fontSize: 13.5,
          minWidth: 220,
          outline: "none",
        }}
      />
      <button type="button" onClick={() => void create()} disabled={busy || !title.trim()} className="btn btn-grad lower" style={{ padding: "11px 18px", opacity: busy || !title.trim() ? 0.5 : 1 }}>
        {busy ? "creating…" : "create"}
      </button>
      <button type="button" onClick={() => setOpen(false)} disabled={busy} className="btn btn-glass lower" style={{ padding: "11px 14px" }}>
        cancel
      </button>
      {error && (
        <span className="lower" style={{ fontSize: 12, color: "var(--bg-red)" }}>
          {error}
        </span>
      )}
    </div>
  );
}
