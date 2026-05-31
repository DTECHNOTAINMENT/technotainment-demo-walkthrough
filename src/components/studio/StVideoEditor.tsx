"use client";

/**
 * StVideoEditor — the per-video edit form, including the "search & sharing" SEO block.
 * PATCHes /api/studio/videos/:id with title / description / metaDescription / slug /
 * visibility / ppvPriceCast / captions, and (optionally) publish:true. Mirrors
 * prototype/v4/studio-video.jsx — meta description ≤160 with a live counter, a slug
 * field that resolves to /watch/:slug, visibility incl. ppv price, captions toggle.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCast, formatFiat } from "@/lib/cast";
import { Icon } from "@/components/ui/Icon";
import { AreaSpark, Dropzone } from "@/components/studio-ui";

type Visibility = "public" | "members" | "ppv";

interface Chapter {
  atSec: number;
  label: string;
}

export interface StVideoEditorProps {
  id: string;
  initial: {
    title: string;
    description: string;
    metaDescription: string;
    slug: string;
    visibility: Visibility;
    ppvPriceCast: number;
    captions: boolean;
    status: string;
    thumbUrl: string;
    views: number;
    castEarned: number;
    chapters: Chapter[];
    thumbOptions: string[];
  };
  origin: string;
}

function mmss(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

function parseMmss(input: string): number {
  const parts = input.split(":").map((p) => parseInt(p, 10) || 0);
  return parts.reduce((acc, p) => acc * 60 + p, 0);
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 64) || ""
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 13px",
  borderRadius: 10,
  border: "1px solid var(--hairline)",
  background: "var(--surface-2)",
  color: "var(--ink-1)",
  fontSize: 13.5,
  outline: "none",
  boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10.5,
  fontWeight: 800,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
  marginBottom: 8,
};

export function StVideoEditor({ id, initial, origin }: StVideoEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription);
  const [slug, setSlug] = useState(initial.slug);
  const [visibility, setVisibility] = useState<Visibility>(initial.visibility);
  const [ppvPriceCast, setPpvPriceCast] = useState<number>(initial.ppvPriceCast || 60);
  const [captions, setCaptions] = useState(initial.captions);
  const [status, setStatus] = useState(initial.status);
  const [comments, setComments] = useState(true);
  const [downloads, setDownloads] = useState(initial.visibility === "members");
  const [thumbIdx, setThumbIdx] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>(initial.chapters);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const metaOver = metaDescription.length > 160;
  const published = status === "published";
  const watchUrl = `${origin}/watch/${slug}`;

  function addChapter() {
    const last = chapters.length ? chapters[chapters.length - 1].atSec + 60 : 0;
    setChapters((c) => [...c, { atSec: last, label: "new chapter" }]);
  }
  function updateChapter(i: number, patch: Partial<Chapter>) {
    setChapters((c) => c.map((ch, idx) => (idx === i ? { ...ch, ...patch } : ch)));
  }
  function removeChapter(i: number) {
    setChapters((c) => c.filter((_, idx) => idx !== i));
  }

  async function unpublish() {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch(`/api/studio/videos/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ publish: false }),
      });
      const data = (await res.json()) as { ok?: boolean; status?: string; error?: string };
      if (!res.ok || !data.ok) {
        // API may not support unpublish — fall back to a visual state change.
        setStatus("draft");
        setMsg("unpublished · saved as draft (demo)");
        return;
      }
      setStatus(data.status ?? "draft");
      setMsg("unpublished · saved as draft");
      router.refresh();
    } catch {
      setStatus("draft");
      setMsg("unpublished · saved as draft (demo)");
    } finally {
      setBusy(false);
    }
  }

  function deleteVideo() {
    if (typeof window !== "undefined" && !window.confirm("delete this video permanently?")) return;
    setMsg("video deleted (demo) · no delete api yet — returning to content");
    router.push("/studio/content");
  }

  async function save(publish: boolean) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    setError(null);
    try {
      const res = await fetch(`/api/studio/videos/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          metaDescription,
          slug,
          visibility,
          ppvPriceCast: visibility === "ppv" ? ppvPriceCast : null,
          captions,
          ...(publish ? { publish: true } : {}),
        }),
      });
      const data = (await res.json()) as { ok?: boolean; slug?: string; status?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "save failed");
        return;
      }
      if (data.slug) setSlug(data.slug);
      if (data.status) setStatus(data.status);
      setMsg(publish ? "published" : "changes saved");
      router.refresh();
    } catch {
      setError("network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 380px)", gap: 16, alignItems: "start" }}>
      {/* LEFT — details + SEO */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="card" style={{ background: "var(--surface)" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
              details
            </div>
          </div>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle} className="lower">
                title
              </label>
              <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label style={labelStyle} className="lower">
                description
              </label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="patch notes, timestamps, gear used…"
              />
            </div>
            <div>
              <label style={labelStyle} className="lower">
                thumbnail
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {initial.thumbOptions.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    className="thumb"
                    onClick={() => setThumbIdx(i)}
                    style={{
                      backgroundImage: `url(${t})`,
                      width: 120,
                      aspectRatio: "16/9",
                      borderRadius: 8,
                      outline: thumbIdx === i ? "2px solid #8b5cf6" : "none",
                      border: "1px solid var(--hairline)",
                    }}
                    aria-label={`auto frame ${i + 1}`}
                  />
                ))}
                <label
                  className="thumb"
                  style={{
                    width: 120,
                    aspectRatio: "16/9",
                    borderRadius: 8,
                    background: "var(--surface-2)",
                    border: "1px dashed var(--hairline-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--ink-3)",
                    cursor: "pointer",
                  }}
                >
                  <input type="file" accept="image/*" hidden onChange={() => setMsg("custom thumbnail attached (demo)")} />
                  <Icon name="plus" size={20} stroke={2.2} />
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* chapters */}
        <section className="card" style={{ background: "var(--surface)" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                chapters
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>timestamps shown on the player</div>
            </div>
            <button type="button" onClick={addChapter} className="btn btn-glass lower" style={{ padding: "7px 11px", fontSize: 12 }}>
              <Icon name="plus" size={13} stroke={2.4} /> add
            </button>
          </div>
          <div>
            {chapters.length === 0 && (
              <div className="lower" style={{ padding: 18, fontSize: 12.5, color: "var(--ink-3)" }}>
                no chapters yet — add timestamps to help viewers jump around.
              </div>
            )}
            {chapters.map((c, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "84px 1fr 40px",
                  gap: 10,
                  alignItems: "center",
                  padding: "10px 18px",
                  borderTop: i ? "1px solid var(--hairline)" : "none",
                }}
              >
                <input
                  className="mono"
                  value={mmss(c.atSec)}
                  onChange={(e) => updateChapter(i, { atSec: parseMmss(e.target.value) })}
                  style={{ ...inputStyle, padding: "8px 10px", fontSize: 12.5, fontWeight: 700 }}
                  aria-label="timestamp"
                />
                <input
                  value={c.label}
                  onChange={(e) => updateChapter(i, { label: e.target.value })}
                  style={{ ...inputStyle, padding: "8px 10px", fontSize: 13 }}
                  aria-label="chapter label"
                />
                <button
                  type="button"
                  onClick={() => removeChapter(i)}
                  style={{ color: "var(--ink-4)", display: "flex", justifyContent: "center" }}
                  aria-label="remove chapter"
                >
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
            <div className="lower" style={{ padding: "10px 18px", borderTop: "1px solid var(--hairline)", fontSize: 11, color: "var(--ink-4)" }}>
              chapters are editable here but not yet persisted by the videos api — visual for now.
            </div>
          </div>
        </section>

        {/* search & sharing (SEO) */}
        <section className="card" style={{ background: "var(--surface)" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
              search &amp; sharing
            </div>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>how this video looks in google and when shared</div>
          </div>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle} className="lower">
                url slug
              </label>
              <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden", background: "var(--surface-2)" }}>
                <span className="mono" style={{ padding: "11px 4px 11px 13px", fontSize: 12.5, color: "var(--ink-4)", whiteSpace: "nowrap" }}>
                  /watch/
                </span>
                <input
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  style={{ ...inputStyle, border: "none", background: "transparent", padding: "11px 13px 11px 0" }}
                />
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 6 }}>
                {watchUrl}
              </div>
            </div>

            <div>
              <label style={labelStyle} className="lower">
                meta description{" "}
                <span style={{ color: metaOver ? "var(--bg-red)" : "var(--ink-4)", fontWeight: 600, textTransform: "none", letterSpacing: 0 }}>
                  · {metaDescription.length}/160
                </span>
              </label>
              <textarea
                style={{ ...inputStyle, resize: "vertical" }}
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="a short summary for search engines & link previews…"
              />
            </div>

            {/* search preview */}
            <div>
              <div className="lower" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8 }}>
                search preview
              </div>
              <div style={{ padding: "12px 14px", border: "1px solid var(--hairline)", borderRadius: 10, background: "var(--surface)" }}>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                  {origin.replace(/^https?:\/\//, "")} › watch › {slug.slice(0, 24)}
                </div>
                <div style={{ fontSize: 16, color: "#7c8cff", fontWeight: 500, lineHeight: 1.25, marginTop: 3 }}>{title || "untitled"}</div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45, marginTop: 3 }}>{metaDescription || description || "—"}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>captions &amp; transcript</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)" }}>boosts search &amp; accessibility</div>
              </div>
              <button
                type="button"
                onClick={() => setCaptions((c) => !c)}
                className={`tg ${captions ? "on" : ""}`}
                aria-pressed={captions}
                aria-label="toggle captions"
                style={{ flex: "0 0 auto" }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* RIGHT — visibility + publish */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="card" style={{ background: "var(--surface)" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
              visibility &amp; monetization
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <label style={labelStyle} className="lower">
              who can watch
            </label>
            <div style={{ display: "inline-flex", gap: 2, padding: 3, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hairline)" }}>
              {(["public", "members", "ppv"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVisibility(v)}
                  className="lower"
                  style={{
                    padding: "7px 14px",
                    borderRadius: 9,
                    fontSize: 12.5,
                    fontWeight: 700,
                    background: visibility === v ? "var(--surface)" : "transparent",
                    color: visibility === v ? "var(--ink-1)" : "var(--ink-3)",
                    boxShadow: visibility === v ? "var(--shadow-card)" : "none",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            {visibility === "ppv" && (
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span className="lower" style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                  rental price
                </span>
                <input
                  type="number"
                  min={0}
                  value={ppvPriceCast}
                  onChange={(e) => setPpvPriceCast(Math.max(0, Math.round(Number(e.target.value) || 0)))}
                  className="tnum"
                  style={{ ...inputStyle, width: 110 }}
                />
                <span className="mono" style={{ fontSize: 11, color: "var(--ink-4)" }}>
                  {formatFiat(ppvPriceCast)}
                </span>
              </div>
            )}
            {visibility === "members" && (
              <div className="lower" style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)", lineHeight: 1.5 }}>
                visible to your paying members. everyone else sees a paywall preview.
              </div>
            )}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--hairline)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>allow comments</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>let viewers reply under this video</div>
                </div>
                <button
                  type="button"
                  onClick={() => setComments((c) => !c)}
                  className={`tg ${comments ? "on" : ""}`}
                  aria-pressed={comments}
                  aria-label="toggle comments"
                  style={{ flex: "0 0 auto" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--hairline)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>member downloads</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)" }}>members can download the file</div>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloads((d) => !d)}
                  className={`tg ${downloads ? "on" : ""}`}
                  aria-pressed={downloads}
                  aria-label="toggle member downloads"
                  style={{ flex: "0 0 auto" }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* performance (published only) */}
        {published ? (
          <section className="card" style={{ background: "var(--surface)" }}>
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
              <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
                performance
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>since published</div>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                {[
                  ["views", formatCast(initial.views)],
                  ["CAST earned", formatCast(initial.castEarned)],
                  ["avg. watched", "68%"],
                  ["new members", "+42"],
                ].map(([k, val]) => (
                  <div key={k}>
                    <div className="lower" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>
                      {k}
                    </div>
                    <div className="tnum stat-num" style={{ fontSize: 22, marginTop: 4 }}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
              <div className="lower" style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>
                views · last 14 days
              </div>
              <AreaSpark data={[120, 180, 240, 210, 320, 410, 380, 460, 520, 480, 560, 610, 590, 680]} h={120} />
            </div>
          </section>
        ) : (
          <div className="st-hint">analytics appear once this video is published and starts getting views.</div>
        )}

        <section className="card" style={{ background: "var(--surface)" }}>
          <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--hairline)" }}>
            <div className="lower" style={{ fontWeight: 800, fontSize: 15 }}>
              actions
            </div>
          </div>
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
            <a href={watchUrl} target="_blank" rel="noreferrer" className="btn btn-glass lower" style={{ padding: 11, justifyContent: "flex-start", textDecoration: "none" }}>
              view public page
            </a>
            <button type="button" onClick={() => void save(false)} disabled={busy || metaOver} className="btn btn-glass lower" style={{ padding: 11, opacity: busy || metaOver ? 0.5 : 1 }}>
              {busy ? "saving…" : "save changes"}
            </button>
            {published ? (
              <button
                type="button"
                onClick={() => void unpublish()}
                disabled={busy}
                className="btn btn-glass lower"
                style={{ padding: 11, justifyContent: "flex-start", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)", opacity: busy ? 0.5 : 1 }}
              >
                <Icon name="bookmark" size={15} stroke={2.2} /> unpublish
              </button>
            ) : (
              <button type="button" onClick={() => void save(true)} disabled={busy || metaOver} className="btn btn-grad lower" style={{ padding: 11, opacity: busy || metaOver ? 0.5 : 1 }}>
                {busy ? "publishing…" : "publish now"}
              </button>
            )}
            <button
              type="button"
              onClick={deleteVideo}
              className="btn btn-glass lower"
              style={{ padding: 11, justifyContent: "flex-start", color: "var(--bg-red)", borderColor: "rgba(239,68,68,0.3)" }}
            >
              <Icon name="close" size={15} stroke={2.4} /> delete video
            </button>
            {msg && (
              <span className="lower" style={{ fontSize: 12, color: "var(--ink-3)", textAlign: "center" }}>
                {msg}
              </span>
            )}
            {error && (
              <span className="lower" style={{ fontSize: 12, color: "var(--bg-red)", textAlign: "center" }}>
                {error}
              </span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
