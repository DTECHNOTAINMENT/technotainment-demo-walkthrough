/* Creator Studio — Content library + Upload flow + Schedule */
(() => {
const { useState, useEffect, useRef } = React;
const { Icon, Modal, formatNum, STUDIO, StudioCard, StudioPageHead, Pill, Seg } = window;

const VIS_TONE = { public: "neutral", members: "info", ppv: "warn", draft: "neutral" };
const STATUS_TONE = { published: "ok", processing: "warn", draft: "neutral" };

/* ---- Upload flow (3 steps: drop → details → publish) ---- */
const UploadModal = ({ open, onClose, toast }) => {
  const [step, setStep] = useState(0);
  const [pct, setPct] = useState(0);
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [form, setForm] = useState({ title: "", desc: "", visibility: "public", price: 60, category: "modular synth", members: true });
  const timer = useRef(null);

  useEffect(() => {
    if (!open) { setStep(0); setPct(0); setFile(null); setForm(f => ({ ...f, title: "", desc: "" })); }
  }, [open]);

  const beginUpload = (name) => {
    setFile(name || "night-session-14_master.mov");
    setForm(f => ({ ...f, title: (name || "night session 14").replace(/[_-]/g, " ").replace(/\.\w+$/, "") }));
    setStep(1); setPct(0);
    clearInterval(timer.current);
    timer.current = setInterval(() => setPct(p => {
      if (p >= 100) { clearInterval(timer.current); return 100; }
      return Math.min(100, p + Math.random() * 14 + 4);
    }), 260);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title="upload" width={560}>
      {step === 0 && (
        <div>
          <div className={`dropzone ${drag ? "drag" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); beginUpload(e.dataTransfer.files?.[0]?.name); }}
            onClick={() => beginUpload()}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 14 }}>
              <Icon name="download" size={26} stroke={2.2} style={{ transform: "rotate(180deg)" }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: 16 }} className="lower">drop a video, or click to browse</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>mp4 · mov · up to 8GB · 4k supported</div>
          </div>
          <div className="st-hint" style={{ marginTop: 14 }}>
            you can also <strong>import a past live stream</strong> — recordings stay in your library for 30 days before they're auto-archived. publish or download them any time.
          </div>
        </div>
      )}

      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "var(--surface-2)", borderRadius: 12, border: "1px solid var(--hairline)" }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flex: "0 0 42px" }}>
              <Icon name="film" size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{file}</div>
              <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{pct >= 100 ? "upload complete · processing" : `uploading… ${Math.round(pct)}%`}</div>
            </div>
            {pct >= 100 && <Pill tone="ok">done</Pill>}
          </div>
          <div className="meter"><span style={{ width: `${pct}%`, background: "var(--brand-gradient)", transition: "width 0.3s ease" }} /></div>

          <div>
            <label className="st-label">title</label>
            <input className="st-input" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="give it a title" />
          </div>
          <div>
            <label className="st-label">description</label>
            <textarea className="st-input" rows={3} value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="patch notes, timestamps, gear used…" style={{ resize: "vertical" }} />
          </div>
          <div>
            <label className="st-label">visibility</label>
            <Seg items={[{ id: "public", label: "public" }, { id: "members", label: "members" }, { id: "ppv", label: "ppv rental" }]} value={form.visibility} onChange={(v) => set("visibility", v)} />
            {form.visibility === "ppv" && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }} className="lower">rental price</span>
                <input className="st-input" type="number" value={form.price} onChange={(e) => set("price", +e.target.value)} style={{ width: 110 }} />
                <span style={{ fontSize: 12.5, color: "var(--ink-3)" }} className="lower">CAST · 48h window</span>
              </div>
            )}
            {form.visibility === "members" && (
              <div className="st-hint" style={{ marginTop: 12 }}>visible to <strong>patch archive</strong> &amp; <strong>sound design lab</strong> tiers. listeners see a paywall preview.</div>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: "center", padding: "10px 0 6px" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white", marginBottom: 16 }}>
            <Icon name="check" size={30} stroke={3} />
          </div>
          <div style={{ fontWeight: 800, fontSize: 18 }} className="lower">published</div>
          <p style={{ color: "var(--ink-3)", fontSize: 13, margin: "8px auto 0", maxWidth: 360 }}>
            “{form.title}” is live to your {form.visibility === "public" ? "whole audience" : form.visibility === "members" ? "members" : "rental store"}. followers with alerts on have been notified.
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        {step === 1 && <button onClick={onClose} className="btn btn-glass" style={{ padding: "11px 16px" }}>save draft</button>}
        {step === 1 && <button disabled={pct < 100 || !form.title} onClick={() => { setStep(2); toast("published · " + form.title, { icon: true }); }} className="btn btn-grad" style={{ padding: "11px 20px", opacity: (pct < 100 || !form.title) ? 0.5 : 1 }}>publish</button>}
        {step === 2 && <button onClick={onClose} className="btn btn-grad" style={{ padding: "11px 20px" }}>done</button>}
      </div>
    </Modal>
  );
};

/* ---- Content screen ---- */
const ContentScreen = ({ toast, onUpload, onOpenVideo }) => {
  const s = STUDIO;
  const [tab, setTab] = useState("videos");
  const [filter, setFilter] = useState("all");
  const list = s.CONTENT.filter(c => filter === "all" ? true : filter === "published" ? c.status === "published" : c.status !== "published");

  return (
    <div className="page-pad" style={{ maxWidth: 1300, margin: "0 auto" }}>
      <StudioPageHead
        eyebrow="creator studio"
        title="content"
        sub="every upload, recording and scheduled stream in one place."
        actions={<button onClick={onUpload} className="btn btn-grad" style={{ padding: "12px 18px" }}><Icon name="plus" size={15} stroke={2.6} /> upload</button>} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <Seg items={[{ id: "videos", label: "videos" }, { id: "schedule", label: "schedule" }]} value={tab} onChange={setTab} />
        {tab === "videos" && (
          <div style={{ display: "flex", gap: 6 }}>
            {["all", "published", "drafts"].map(f => (
              <button key={f} className={`chip ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ padding: "6px 13px", fontSize: 12 }}><span className="lower">{f}</span></button>
            ))}
          </div>
        )}
      </div>

      {tab === "videos" && (
        <StudioCard pad={false}>
          <div className="st-row head" style={{ gridTemplateColumns: "104px 1fr 110px 90px 110px 40px" }}>
            <span>video</span><span>title</span><span>status</span><span style={{ textAlign: "right" }}>views</span><span style={{ textAlign: "right" }}>CAST</span><span />
          </div>
          {list.map(c => (
            <div key={c.id} className="st-row" onClick={() => onOpenVideo?.(c)} style={{ gridTemplateColumns: "104px 1fr 110px 90px 110px 40px", cursor: "pointer" }}>
              <div className="thumb" style={{ backgroundImage: c.thumb ? `url(${c.thumb})` : undefined, aspectRatio: "16/9", borderRadius: 8, position: "relative" }}>
                {c.status === "processing" && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 800 }} className="lower">processing</div>}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 3, display: "flex", gap: 8, alignItems: "center" }} className="mono">
                  <Pill tone={VIS_TONE[c.visibility]}>{c.visibility}</Pill> {c.watch} · {c.date}
                </div>
              </div>
              <div><Pill tone={STATUS_TONE[c.status]}>{c.status}</Pill></div>
              <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 700 }}>{c.views ? formatNum(c.views) : "—"}</div>
              <div className="tnum" style={{ textAlign: "right", fontSize: 13, fontWeight: 800 }}>{c.cast ? formatNum(c.cast) : "—"}</div>
              <button onClick={(e) => { e.stopPropagation(); toast(`${c.title} · edit · visibility · delete`); }} style={{ color: "var(--ink-3)", display: "flex", justifyContent: "center" }}><Icon name="more" size={18} /></button>
            </div>
          ))}
        </StudioCard>
      )}

      {tab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <StudioCard
            title="upcoming streams"
            sub="reminders notify followers when you go live"
            action={<button onClick={() => toast("schedule a stream · pick date & time")} className="btn btn-grad-stroke" style={{ padding: "8px 13px", fontSize: 12 }}><Icon name="plus" size={13} stroke={2.4} /> schedule</button>}
            pad={false}>
            {s.SCHEDULE.map((sc, i) => (
              <div key={sc.id} className="st-row" style={{ gridTemplateColumns: "44px 1fr auto auto", borderTop: i ? "1px solid var(--hairline)" : "none" }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}><Icon name="clock" size={20} stroke={2} /></div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{sc.title}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }} className="mono">{sc.when} · {sc.cat} · {formatNum(sc.reminders)} reminders</div>
                </div>
                <Pill tone={sc.visibility === "public" ? "neutral" : sc.visibility === "members" ? "info" : "warn"}>{sc.visibility}</Pill>
                <button onClick={() => toast(`${sc.title} · edit`)} style={{ color: "var(--ink-3)" }}><Icon name="more" size={18} /></button>
              </div>
            ))}
          </StudioCard>
          <div className="st-hint">recordings of every stream land in <strong>videos</strong> automatically once you end the broadcast — trim, retitle and publish them there.</div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { ContentScreen, UploadModal });
})();
