/* v3 search — type-ahead + results page */
(() => {
const { useState, useMemo, useEffect, useRef } = React;
const { Icon, Avatar, formatNum, CREATORS, METACASTS, LIVE, SOON, DROPS, SMALLROOMS, Tile } = window;

const buildIndex = () => {
  const items = [];
  CREATORS.forEach(c => items.push({ kind: "creator", id: c.id, label: c.name, sub: `${c.handle} · ${c.category}`, c }));
  METACASTS.concat([SMALLROOMS]).forEach(m => items.push({ kind: "metacast", id: m.id, label: m.name, sub: m.tag || m.subtitle || "" }));
  LIVE.forEach(l => items.push({ kind: "live", id: l.id, label: l.title, sub: `live · ${l.creator.handle}`, post: l }));
  SOON.forEach(s => items.push({ kind: "upcoming", id: s.id, label: s.title, sub: `in ${s.in} · ${s.creator.handle}`, post: s }));
  DROPS.forEach(d => items.push({ kind: "drop", id: d.id, label: d.name, sub: `${d.price} CAST · ${d.creator.handle}`, d }));
  return items;
};

const SearchBox = ({ onSubmit, onOpenCreator, onOpenLive, onOpenMetaCast, toast }) => {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const lc = q.toLowerCase();
    return index.filter(i => i.label.toLowerCase().includes(lc) || (i.sub || "").toLowerCase().includes(lc)).slice(0, 8);
  }, [q, index]);

  useEffect(() => {
    const onDoc = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    onSubmit(q.trim());
    setOpen(false);
  };

  const handleClick = (i) => {
    setOpen(false);
    if (i.kind === "creator") onOpenCreator(i.c);
    else if (i.kind === "metacast") {
      if (i.id === "smallrooms") onOpenMetaCast("smallrooms");
      else toast(`hop into ${i.label} · metacast`);
    }
    else if (i.kind === "live" || i.kind === "upcoming") onOpenLive(i.post);
    else if (i.kind === "drop") toast(`open drop · ${i.label}`);
  };

  return (
    <form ref={wrap} onSubmit={handleSubmit} style={{ display: "none", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--hairline)", minWidth: 240, color: "var(--ink-3)", position: "relative" }} className="search-d">
      <Icon name="search" size={14} stroke={2.2} />
      <input value={q} onChange={e => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
        placeholder="search creators, microcasts, drops"
        style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: "var(--ink-1)" }} />
      {q && <button type="button" onClick={() => { setQ(""); setOpen(false); }} style={{ color: "var(--ink-4)" }}><Icon name="close" size={12} /></button>}

      {open && q && (
        <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, boxShadow: "var(--shadow-pop)", overflow: "hidden", zIndex: 50 }}>
          {results.length === 0 ? (
            <div style={{ padding: "16px", fontSize: 13, color: "var(--ink-3)" }}>no matches. press enter to search across the platform.</div>
          ) : (
            <>
              {results.map(r => (
                <button key={r.kind + r.id} type="button" onClick={() => handleClick(r)} style={{ width: "100%", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, textAlign: "left", borderBottom: "1px solid var(--hairline)" }}>
                  {r.c ? <Avatar creator={r.c} size={32} /> : <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)" }}><Icon name={r.kind === "metacast" ? "grid" : r.kind === "drop" ? "bag" : "play"} size={14} /></div>}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-1)" }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{r.kind} · {r.sub}</div>
                  </div>
                  <Icon name="chevR" size={12} stroke={2.2} style={{ color: "var(--ink-4)" }} />
                </button>
              ))}
              <button type="submit" style={{ width: "100%", padding: "12px 14px", textAlign: "center", fontSize: 12, color: "var(--ink-3)", background: "var(--surface-2)" }}>
                see all results for "<strong style={{ color: "var(--ink-1)" }}>{q}</strong>" →
              </button>
            </>
          )}
        </div>
      )}
      <style>{`@media (min-width: 768px) { .search-d { display: flex !important; } }`}</style>
    </form>
  );
};

const SearchResultsScreen = ({ query, onOpenLive, onOpenMicroCast, onOpenMetaCast, toast }) => {
  const [filter, setFilter] = useState("all");
  const index = useMemo(() => buildIndex(), []);
  const results = useMemo(() => {
    const lc = (query || "").toLowerCase();
    return index.filter(i => i.label.toLowerCase().includes(lc) || (i.sub || "").toLowerCase().includes(lc));
  }, [query, index]);
  const filtered = filter === "all" ? results : results.filter(r => r.kind === filter);

  return (
    <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 16px 96px" }}>
      <div style={{ paddingBottom: 16, borderBottom: "1px solid var(--hairline)" }}>
        <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }}>search results</div>
        <h1 style={{ margin: "6px 0 0", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 800, letterSpacing: "-0.02em" }} className="lower">
          {results.length} matches for "<span className="brand-grad-text">{query}</span>"
        </h1>
      </div>
      <div style={{ display: "flex", gap: 6, padding: "16px 0", overflowX: "auto" }}>
        {[
          { id: "all", label: `all (${results.length})` },
          { id: "creator", label: `creators (${results.filter(r => r.kind === "creator").length})` },
          { id: "live", label: `live (${results.filter(r => r.kind === "live").length})` },
          { id: "upcoming", label: `upcoming (${results.filter(r => r.kind === "upcoming").length})` },
          { id: "drop", label: `drops (${results.filter(r => r.kind === "drop").length})` },
          { id: "metacast", label: `metacasts (${results.filter(r => r.kind === "metacast").length})` },
        ].map(c => (
          <button key={c.id} className={`chip ${filter === c.id ? "active" : ""}`} onClick={() => setFilter(c.id)}>{c.label}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", color: "var(--ink-3)" }}>
          <div style={{ fontSize: 16, fontWeight: 700 }} className="lower">no matches</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>try a different category or check spelling</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(r => (
            r.post ? <Tile key={r.kind + r.id} post={r.post} onOpen={() => onOpenLive(r.post)} size="md" />
            : r.c   ? <CreatorCard key={r.kind + r.id} creator={r.c} onOpen={() => onOpenMicroCast(r.c)} />
            :         <GenericCard key={r.kind + r.id} item={r} onOpen={() => r.kind === "metacast" ? onOpenMetaCast(r.id) : toast(`open ${r.label}`)} />
          ))}
        </div>
      )}
    </div>
  );
};

const CreatorCard = ({ creator, onOpen }) => (
  <button onClick={onOpen} className="card" style={{ background: "var(--surface)", padding: 16, display: "flex", gap: 14, alignItems: "center", textAlign: "left" }}>
    <span style={{ padding: 2, borderRadius: "50%", background: `linear-gradient(135deg, ${creator.brand}, ${creator.brand2})` }}>
      <Avatar creator={creator} size={48} />
    </span>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 800 }}>{creator.name}</div>
      <div style={{ fontSize: 12, color: "var(--ink-3)" }} className="lower">{creator.handle} · {creator.category}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 4 }}><span className="tnum">{formatNum(creator.followers)}</span> followers</div>
    </div>
    <Icon name="chevR" size={14} stroke={2.2} style={{ color: "var(--ink-3)" }} />
  </button>
);

const GenericCard = ({ item, onOpen }) => (
  <button onClick={onOpen} className="card" style={{ background: "var(--surface)", padding: 16, display: "flex", gap: 14, alignItems: "center", textAlign: "left" }}>
    <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--brand-gradient)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18 }}>
      {item.label[0].toUpperCase()}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
      <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">{item.kind} · {item.sub}</div>
    </div>
    <Icon name="chevR" size={14} stroke={2.2} style={{ color: "var(--ink-3)" }} />
  </button>
);

Object.assign(window, { SearchBox, SearchResultsScreen });
})();
