/* Creator Studio — per-video edit page */
(() => {
const { useState } = React;
const { Icon, formatNum, gbp, castToGBP, STUDIO, StudioCard, Pill, Seg, Bars, AreaSpark } = window;

const VideoEditScreen = ({ video, onBack, onViewPublic, toast }) => {
  const v = video || STUDIO.CONTENT[0];
  const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48);
  const [form, setForm] = useState({
    title: v.title, desc: "patch notes, gear list and timestamps for this set.",
    visibility: v.visibility === "draft" ? "public" : v.visibility,
    price: 60, comments: true, downloads: v.visibility === "members",
    slug: slugify(v.title), metaDesc: "", captions: true,
  });
  const set = (k, val) => setForm(f => ({ ...f, [k]: val }));
  const published = v.status === "published";

  const CHAPTERS = [
    { t: "0:00", label: "intro · room tone" },
    { t: "4:12", label: "first patch · slow build" },
    { t: "18:40", label: "the bass thing" },
    { t: "42:05", label: "feedback loop experiment" },
    { t: "1:12:00", label: "wind-down ambient" },
  ];

  return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22, flexWrap: "wrap" }}>
        <button onClick={onBack} className="btn btn-glass" style={{ padding: "10px 14px" }}><Icon name="chevL" size={15} stroke={2.4} /> content</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-3)" }}>edit video</div>
          <div style={{ fontSize: 19, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} className="lower">{form.title}</div>
        </div>
        <Pill tone={v.status === "published" ? "ok" : v.status === "processing" ? "warn" : "neutral"}>{v.status}</Pill>
        <button onClick={() => toast("changes saved")} className="btn btn-grad" style={{ padding: "11px 20px" }}>save</button>
      </div>

      <div className="st-split">
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Preview */}
          <div className="thumb" style={{ backgroundImage: v.thumb ? `url(${v.thumb})` : undefined, aspectRatio: "16/9", borderRadius: 14 }}>
            <div className="thumb-overlay" />
            <button onClick={() => onViewPublic?.()} style={{ position: "absolute", inset: 0, margin: "auto", width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Icon name="play" size={26} /></button>
            <div style={{ position: "absolute", bottom: 12, left: 12, display: "flex", gap: 8 }}>
              <span style={{ background: "rgba(0,0,0,0.6)", color: "white", padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700 }} className="mono">{v.watch}</span>
            </div>
          </div>

          <StudioCard title="details">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div><label className="st-label">title</label><input className="st-input" value={form.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div><label className="st-label">description</label><textarea className="st-input" rows={4} value={form.desc} onChange={(e) => set("desc", e.target.value)} style={{ resize: "vertical" }} /></div>
              <div><label className="st-label">thumbnail</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[v.thumb, STUDIO.CONTENT[1].thumb, STUDIO.CONTENT[3].thumb].map((t, i) => (
                    <button key={i} className="thumb" onClick={() => toast("thumbnail set")} style={{ backgroundImage: `url(${t})`, width: 120, aspectRatio: "16/9", borderRadius: 8, border: i === 0 ? "2px solid transparent" : "1px solid var(--hairline)", outline: i === 0 ? "2px solid #8b5cf6" : "none" }} />
                  ))}
                  <button onClick={() => toast("upload custom thumbnail")} className="thumb" style={{ width: 120, aspectRatio: "16/9", borderRadius: 8, background: "var(--surface-2)", border: "1px dashed var(--hairline-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}><Icon name="plus" size={20} stroke={2.2} /></button>
                </div>
              </div>
            </div>
          </StudioCard>

          {/* Chapters */}
          <StudioCard title="chapters" sub="timestamps shown on the player"
            action={<button onClick={() => toast("add chapter")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 12 }}><Icon name="plus" size={13} stroke={2.4} /> add</button>}
            pad={false}>
            {CHAPTERS.map((c, i) => (
              <div key={i} className="st-row" style={{ gridTemplateColumns: "70px 1fr 40px", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 700 }}>{c.t}</span>
                <span style={{ fontSize: 13 }}>{c.label}</span>
                <button onClick={() => toast("remove chapter")} style={{ color: "var(--ink-4)", display: "flex", justifyContent: "center" }}><Icon name="close" size={14} /></button>
              </div>
            ))}
          </StudioCard>

          {/* Search & sharing (SEO) */}
          <StudioCard title="search & sharing" sub="how this video looks in google and when shared">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="st-label">url slug</label>
                <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--hairline)", borderRadius: 10, overflow: "hidden", background: "var(--surface-2)" }}>
                  <span style={{ padding: "11px 4px 11px 13px", fontSize: 12.5, color: "var(--ink-4)", whiteSpace: "nowrap" }} className="mono">technotainment.fm/watch/</span>
                  <input className="st-input" value={form.slug} onChange={(e) => set("slug", slugify(e.target.value))} style={{ border: "none", background: "transparent", padding: "11px 13px 11px 0", flex: 1 }} />
                </div>
              </div>
              <div>
                <label className="st-label">meta description <span style={{ color: form.metaDesc.length > 160 ? "#ef4444" : "var(--ink-4)", fontWeight: 600, textTransform: "none" }}>· {form.metaDesc.length}/160</span></label>
                <textarea className="st-input" rows={2} value={form.metaDesc} onChange={(e) => set("metaDesc", e.target.value)} placeholder="a short summary for search engines & link previews…" style={{ resize: "vertical" }} />
              </div>

              {/* Google result preview */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 8 }}>search preview</div>
                <div style={{ padding: "12px 14px", border: "1px solid var(--hairline)", borderRadius: 10, background: "var(--surface)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                    <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--brand-gradient)", flex: "0 0 18px" }} />
                    <div style={{ lineHeight: 1.1 }}><div style={{ fontSize: 11, color: "var(--ink-2)" }}>technotainment</div><div style={{ fontSize: 10.5, color: "var(--ink-4)" }} className="mono">technotainment.fm › watch › {form.slug.slice(0, 22)}</div></div>
                  </div>
                  <div style={{ fontSize: 16, color: "#7c8cff", fontWeight: 500, lineHeight: 1.25, marginTop: 2 }}>{form.title} · {STUDIO.me.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45, marginTop: 3 }}>{form.metaDesc || form.desc}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--hairline)" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>captions &amp; transcript</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>auto-generated · boosts search &amp; accessibility</div></div>
                <button onClick={() => toast("regenerating transcript…")} className="btn btn-glass" style={{ padding: "7px 11px", fontSize: 11.5 }}>regenerate</button>
                <span className={`tg ${form.captions ? "on" : ""}`} onClick={() => set("captions", !form.captions)} style={{ flex: "0 0 36px" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">social card (open graph)</span>
                <button onClick={() => toast("social card · auto-generated from thumbnail")} style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-2)", display: "inline-flex", alignItems: "center", gap: 6 }}><Icon name="share" size={13} stroke={2.2} /> customize</button>
              </div>
            </div>
          </StudioCard>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Visibility & monetization */}
          <StudioCard title="visibility & monetization">
            <label className="st-label">who can watch</label>
            <Seg items={[{ id: "public", label: "public" }, { id: "members", label: "members" }, { id: "ppv", label: "ppv" }]} value={form.visibility} onChange={(x) => set("visibility", x)} />
            {form.visibility === "ppv" && (
              <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }} className="lower">rental price</span>
                <input className="st-input tnum" type="number" value={form.price} onChange={(e) => set("price", +e.target.value)} style={{ width: 100 }} />
                <span style={{ fontSize: 11, color: "var(--ink-4)" }} className="mono">{gbp(castToGBP(form.price))} · 48h</span>
              </div>
            )}
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>allow comments</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>let viewers reply under this video</div></div>
                <span className={`tg ${form.comments ? "on" : ""}`} onClick={() => set("comments", !form.comments)} style={{ flex: "0 0 36px" }} />
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--hairline)" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>member downloads</div><div style={{ fontSize: 11, color: "var(--ink-3)" }}>members can download the file</div></div>
                <span className={`tg ${form.downloads ? "on" : ""}`} onClick={() => set("downloads", !form.downloads)} style={{ flex: "0 0 36px" }} />
              </div>
            </div>
          </StudioCard>

          {/* Performance */}
          {published ? (
            <StudioCard title="performance" sub="since published">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
                {[["views", formatNum(v.views)], ["CAST earned", formatNum(v.cast)], ["avg. watched", "68%"], ["new members", "+42"]].map(([k, val]) => (
                  <div key={k}><div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>{k}</div><div className="tnum stat-num" style={{ fontSize: 22, marginTop: 4 }}>{val}</div></div>
                ))}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 8 }}>views · last 14 days</div>
              <AreaSpark data={[120, 180, 240, 210, 320, 410, 380, 460, 520, 480, 560, 610, 590, 680]} h={120} stroke="#8b5cf6" fill="rgba(139,92,246,0.18)" />
            </StudioCard>
          ) : (
            <div className="st-hint">analytics appear once this video is published and starts getting views.</div>
          )}

          {/* Actions */}
          <StudioCard title="actions">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => onViewPublic?.()} className="btn btn-glass" style={{ padding: "11px", justifyContent: "flex-start" }}><Icon name="eye" size={15} stroke={2.2} /> view on public channel</button>
              <button onClick={() => toast("share link copied")} className="btn btn-glass" style={{ padding: "11px", justifyContent: "flex-start" }}><Icon name="share" size={15} stroke={2.2} /> copy share link</button>
              <button onClick={() => toast("download original file")} className="btn btn-glass" style={{ padding: "11px", justifyContent: "flex-start" }}><Icon name="download" size={15} stroke={2.2} /> download original</button>
              {published
                ? <button onClick={() => toast("unpublished · saved as draft")} className="btn btn-glass" style={{ padding: "11px", justifyContent: "flex-start", color: "#f59e0b", borderColor: "rgba(245,158,11,0.3)" }}><Icon name="lock" size={15} stroke={2.2} /> unpublish</button>
                : <button onClick={() => { toast("published", { icon: true }); onBack?.(); }} className="btn btn-grad" style={{ padding: "11px" }}>publish now</button>}
              <button onClick={() => { if (confirm("delete this video permanently?")) { toast("video deleted"); onBack?.(); } }} className="btn btn-glass" style={{ padding: "11px", justifyContent: "flex-start", color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}><Icon name="close" size={15} stroke={2.4} /> delete video</button>
            </div>
          </StudioCard>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { VideoEditScreen });
})();
