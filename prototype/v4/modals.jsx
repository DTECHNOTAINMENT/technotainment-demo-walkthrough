/* v2 modals — Tip / Subscribe / Top-up / Compete */
(() => {
const { useState } = React;
const { Icon, CastGlyph, Modal, Avatar, formatNum } = window;

const TipModal = ({ open, onClose, creator, wallet, onConfirm }) => {
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const presets = [10, 25, 100, 250, 500];
  const value = custom ? Math.max(1, parseInt(custom, 10) || 0) : amount;
  const insufficient = value > wallet.balance;
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title={`tip ${creator?.handle || ""}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          tips go straight to <strong style={{ color: "var(--ink-1)" }}>{creator?.name}</strong> as CAST.
          marked on the live ledger and visible to the room.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {presets.map(p => (
            <button key={p} onClick={() => { setAmount(p); setCustom(""); }} style={{
              padding: "14px 4px", borderRadius: 10,
              background: !custom && amount === p ? "var(--ink-1)" : "var(--surface-2)",
              color: !custom && amount === p ? "var(--bg)" : "var(--ink-1)",
              fontWeight: 800, fontSize: 14,
              border: "1px solid var(--hairline)"
            }} className="tnum">
              {p}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10, background: "var(--surface-2)" }}>
          <CastGlyph size={20} />
          <input type="number" value={custom} onChange={e => setCustom(e.target.value)} placeholder="custom amount" style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 14 }} className="mono" />
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
          <span>your balance</span>
          <span className="tnum">{formatNum(wallet.balance)} CAST</span>
        </div>
        {insufficient && <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>not enough CAST — top up first.</div>}
        <button onClick={(e) => onConfirm(value, e.currentTarget)} disabled={insufficient}
          className="btn btn-grad" style={{ padding: "14px", fontSize: 15, opacity: insufficient ? 0.4 : 1 }}>
          send {value} CAST · confirm
        </button>
      </div>
    </Modal>
  );
};

const SubscribeModal = ({ open, onClose, creator, tier, wallet, onConfirm }) => {
  if (!open || !tier) return null;
  const insufficient = tier.cast > wallet.balance;
  return (
    <Modal open={open} onClose={onClose} title={`subscribe · ${creator?.handle}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>{tier.name}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <span className="tnum brand-grad-text stat-num" style={{ fontSize: 36 }}>{tier.cast}</span>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>CAST / month</span>
          </div>
          <ul style={{ paddingLeft: 0, listStyle: "none", margin: "14px 0 0", display: "flex", flexDirection: "column", gap: 6 }}>
            {tier.perks.map((p, i) => (
              <li key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 13 }}>
                <Icon name="check" size={16} stroke={2.4} /> <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span>first charge</span><span className="tnum">{tier.cast} CAST · today</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>renews</span><span>27 jun, then monthly</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}><span>cancel anytime</span><span style={{ color: "var(--ink-1)", fontWeight: 700 }}>one click</span></div>
        </div>
        {insufficient && <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>need {tier.cast - wallet.balance} more CAST.</div>}
        <button onClick={(e) => onConfirm(tier, e.currentTarget)} disabled={insufficient}
          className="btn btn-grad" style={{ padding: "14px", fontSize: 15, opacity: insufficient ? 0.4 : 1 }}>
          subscribe · {tier.cast} CAST / month
        </button>
      </div>
    </Modal>
  );
};

const TopUpModal = ({ open, onClose, wallet, onConfirm }) => {
  const [pick, setPick] = useState(1000);
  const [custom, setCustom] = useState("");
  const value = custom ? Math.max(100, parseInt(custom, 10) || 0) : pick;
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose} title="top up CAST">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          CAST is a closed-loop platform credit. spend it on tips, drops, memberships, ppv, gifts.
          balances do not earn interest, are not transferable, and never expire.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {wallet.packs.map(p => (
            <button key={p.amount} onClick={() => { setPick(p.amount); setCustom(""); }} style={{
              padding: "16px 14px", textAlign: "left", borderRadius: 12, position: "relative",
              background: !custom && pick === p.amount ? "var(--ink-1)" : "var(--surface-2)",
              color:      !custom && pick === p.amount ? "var(--bg)"  : "var(--ink-1)",
              border: "1px solid var(--hairline)"
            }}>
              {p.badge && <span style={{ position: "absolute", top: 8, right: 10, fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 999, background: "var(--brand-gradient)", color: "white", letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.badge}</span>}
              <div className="tnum" style={{ fontSize: 22, fontWeight: 800 }}>{formatNum(p.amount)}</div>
              <div style={{ fontSize: 11, marginTop: 2, opacity: 0.7 }} className="lower">CAST · {p.fiat}</div>
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid var(--hairline)", borderRadius: 10, background: "var(--surface-2)" }}>
          <CastGlyph size={20} />
          <input type="number" value={custom} onChange={e => setCustom(e.target.value)} placeholder="custom amount (min 100)" style={{ flex: 1, border: "none", outline: "none", background: "none", fontSize: 14 }} className="mono" />
          <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
          <span>payment method</span>
          <span style={{ color: "var(--ink-1)", fontWeight: 600 }}>visa ··4291 <Icon name="chevD" size={12} stroke={2} style={{ verticalAlign: -2 }} /></span>
        </div>
        <button onClick={(e) => onConfirm(value, e.currentTarget)} className="btn btn-grad" style={{ padding: "14px", fontSize: 15 }}>
          add {formatNum(value)} CAST
        </button>
      </div>
    </Modal>
  );
};

const CompeteModal = ({ open, onClose, comp, wallet, creator, onConfirm }) => {
  const [eligible, setEligible] = useState(false);
  if (!open || !comp) return null;
  const insufficient = comp.entry > wallet.balance;
  return (
    <Modal open={open} onClose={onClose} title="enter competition">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)", display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar creator={creator} size={36} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{comp.name}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{comp.ends} · {comp.entry} CAST entry</div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", padding: 12, background: "var(--surface-2)", borderRadius: 10, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <Icon name="flag" size={14} stroke={2.4} style={{ marginTop: 2 }} />
            <span>jurisdiction: <strong style={{ color: "var(--ink-1)" }}>UK · England & Wales</strong>. no purchase necessary — postal entry available.</span>
          </div>
          <label style={{ display: "flex", gap: 10, alignItems: "center", cursor: "pointer" }}>
            <span className={`tg ${eligible ? "on" : ""}`} onClick={() => setEligible(!eligible)} />
            <span>i am 18+ and eligible under my local rules.</span>
          </label>
        </div>
        {insufficient && <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>not enough CAST.</div>}
        <button onClick={(e) => onConfirm(comp, e.currentTarget)} disabled={!eligible || insufficient}
          className="btn btn-grad" style={{ padding: "14px", fontSize: 15, opacity: (!eligible || insufficient) ? 0.4 : 1 }}>
          enter · {comp.entry} CAST
        </button>
      </div>
    </Modal>
  );
};

Object.assign(window, { TipModal, SubscribeModal, TopUpModal, CompeteModal });
})();

/* ---------- v3 new confirm modals ---------- */
(() => {
const { useState } = React;
const { Icon, CastGlyph, Modal, Avatar, formatNum } = window;

// ---- Buy Drop -----------------------------------------------------------
const BuyDropModal = ({ open, onClose, drop, creator, wallet, onConfirm }) => {
  const [address, setAddress] = useState({ line1: "", city: "", postcode: "", country: "United Kingdom" });
  if (!open || !drop) return null;
  const isPhysical = drop.edition && /ships|copies|edition|of/i.test(drop.edition) && !/pdf|stems|files|self-paced|rentable/i.test(drop.edition);
  const insufficient = drop.price > wallet.balance;
  const addrValid = !isPhysical || (address.line1 && address.city && address.postcode);

  return (
    <Modal open={open} onClose={onClose} title="buy drop">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 14, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)", display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 10, backgroundImage: `url(${drop.img})`, backgroundSize: "cover", backgroundPosition: "center", flex: "0 0 60px" }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{drop.name}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{drop.edition}</div>
            {creator && <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="lower">by {creator.handle}</div>}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
            <span className="tnum brand-grad-text" style={{ fontWeight: 800, fontSize: 22 }}>{formatNum(drop.price)}</span>
            <span style={{ fontSize: 11, color: "var(--ink-3)" }}>CAST</span>
          </div>
        </div>

        {isPhysical && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>shipping address</div>
            <Inp v={address.line1} onChange={v => setAddress(a => ({ ...a, line1: v }))} placeholder="address line 1" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: 8 }}>
              <Inp v={address.city} onChange={v => setAddress(a => ({ ...a, city: v }))} placeholder="city" />
              <Inp v={address.postcode} onChange={v => setAddress(a => ({ ...a, postcode: v }))} placeholder="postcode" />
            </div>
            <Inp v={address.country} onChange={v => setAddress(a => ({ ...a, country: v }))} placeholder="country" />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
          <span>your balance</span>
          <span className="tnum">{formatNum(wallet.balance)} CAST</span>
        </div>

        {insufficient && <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>not enough CAST — top up first.</div>}

        <button onClick={(e) => onConfirm({ drop, address: isPhysical ? address : null }, e.currentTarget)}
          disabled={insufficient || !addrValid}
          className="btn btn-grad" style={{ padding: "14px", fontSize: 15, opacity: insufficient || !addrValid ? 0.4 : 1 }}>
          confirm · {formatNum(drop.price)} CAST
        </button>
        <span style={{ fontSize: 10, color: "var(--ink-4)", textAlign: "center" }} className="mono">{isPhysical ? "ships from creator. tracking via email." : "instant access · find it in your library."}</span>
      </div>
    </Modal>
  );
};

// ---- Buy PPV ------------------------------------------------------------
const BuyPPVModal = ({ open, onClose, ppv, creator, wallet, onConfirm }) => {
  if (!open || !ppv) return null;
  const insufficient = ppv.price > wallet.balance;
  return (
    <Modal open={open} onClose={onClose} title="ppv access">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)" }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-3)" }}>ppv rental</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 6 }}>{ppv.name}</div>
          {creator && <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }} className="lower">{creator.handle}</div>}
          <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="tnum brand-grad-text stat-num" style={{ fontSize: 32 }}>{formatNum(ppv.price)}</span>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>CAST · {ppv.window || "48h rental"}</span>
          </div>
        </div>
        <ul style={{ paddingLeft: 0, listStyle: "none", margin: 0, fontSize: 13, display: "flex", flexDirection: "column", gap: 6, color: "var(--ink-2)" }}>
          <li style={{ display: "flex", gap: 8 }}><Icon name="check" size={16} stroke={2.4} style={{ flex: "0 0 16px" }}/> stream live or watch the recording later</li>
          <li style={{ display: "flex", gap: 8 }}><Icon name="check" size={16} stroke={2.4} style={{ flex: "0 0 16px" }}/> appears in your library immediately</li>
          <li style={{ display: "flex", gap: 8 }}><Icon name="check" size={16} stroke={2.4} style={{ flex: "0 0 16px" }}/> works on any device signed into this account</li>
        </ul>
        {insufficient && <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>not enough CAST.</div>}
        <button onClick={(e) => onConfirm(ppv, e.currentTarget)} disabled={insufficient}
          className="btn btn-grad" style={{ padding: "14px", fontSize: 15, opacity: insufficient ? 0.4 : 1 }}>
          rent · {formatNum(ppv.price)} CAST
        </button>
      </div>
    </Modal>
  );
};

// ---- Cancel Subscription ------------------------------------------------
const CancelSubModal = ({ open, onClose, membership, onConfirm, onPause }) => {
  if (!open || !membership) return null;
  const m = membership;
  return (
    <Modal open={open} onClose={onClose} title={`cancel · ${m.creator.handle}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ padding: 16, borderRadius: 14, background: "var(--surface-2)", border: "1px solid var(--hairline)", display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar creator={m.creator} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{m.tier}</div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }} className="mono">{m.cast} CAST/mo · since {m.since}</div>
          </div>
        </div>
        <div style={{ padding: 14, borderRadius: 12, background: "var(--surface)", border: "1px solid var(--hairline)" }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>you'll keep access until</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }} className="tnum">{m.until || "27 jun 2026"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 4 }}>no further charges. cancel takes effect immediately.</div>
        </div>
        <div style={{ padding: 12, borderRadius: 12, background: "linear-gradient(90deg, rgba(139,92,246,0.08), rgba(236,72,153,0.06))", border: "1px solid var(--hairline)", fontSize: 12, color: "var(--ink-2)" }}>
          <strong style={{ color: "var(--ink-1)" }}>pause for a month?</strong> we'll resume next renewal cycle and skip this one. your creator keeps you on the list.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onPause} className="btn btn-glass" style={{ flex: 1, padding: "14px" }}>pause 1 month</button>
          <button onClick={() => onConfirm(m)} className="btn" style={{ flex: 1, padding: "14px", background: "#ef4444", color: "white" }}>confirm cancel</button>
        </div>
      </div>
    </Modal>
  );
};

// ---- Gift Subscription --------------------------------------------------
const GiftSubModal = ({ open, onClose, creator, wallet, onConfirm }) => {
  const [recipient, setRecipient] = useState("");
  const [count, setCount] = useState(1);
  const presets = [1, 5, 10];
  const cost = 250 * count;
  if (!open) return null;
  const insufficient = cost > wallet.balance;
  return (
    <Modal open={open} onClose={onClose} title={`gift subs · ${creator?.handle || ""}`}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)" }}>
          gift a tier-1 subscription. recipient must be a metascape viewer. broadcast to the room as "{(count > 1 ? `${count} subs gifted` : "a sub gifted")} for {creator?.handle}".
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>how many</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {presets.map(n => (
              <button key={n} onClick={() => setCount(n)} style={{
                padding: "14px 4px", borderRadius: 10,
                background: count === n ? "var(--ink-1)" : "var(--surface-2)",
                color: count === n ? "var(--bg)" : "var(--ink-1)",
                fontWeight: 800, fontSize: 14
              }} className="tnum">{n} sub{n > 1 ? "s" : ""}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--ink-3)" }}>recipient (optional)</span>
          <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="@handle (leave blank to gift to the room)" style={{ padding: "12px 14px", borderRadius: 10, background: "var(--surface-2)", color: "var(--ink-1)", border: "1px solid var(--hairline)", fontSize: 13, outline: "none" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--ink-3)" }}>
          <span>cost</span>
          <span className="tnum"><strong style={{ color: "var(--ink-1)" }}>{formatNum(cost)} CAST</strong> · {count} × 250</span>
        </div>
        {insufficient && <div style={{ fontSize: 12, color: "#ef4444", padding: "8px 12px", background: "rgba(239,68,68,0.08)", borderRadius: 8 }}>not enough CAST.</div>}
        <button onClick={(e) => onConfirm({ creator, count, recipient, cost }, e.currentTarget)} disabled={insufficient}
          className="btn btn-grad" style={{ padding: "14px", fontSize: 15, opacity: insufficient ? 0.4 : 1 }}>
          <Icon name="gift" size={14} stroke={2.4} /> gift {count > 1 ? `${count} subs` : "a sub"} · {formatNum(cost)} CAST
        </button>
      </div>
    </Modal>
  );
};

const Inp = ({ v, onChange, placeholder }) => (
  <input value={v} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ padding: "10px 14px", borderRadius: 10, background: "var(--surface-2)", color: "var(--ink-1)", border: "1px solid var(--hairline)", fontSize: 13, outline: "none" }} />
);

Object.assign(window, { BuyDropModal, BuyPPVModal, CancelSubModal, GiftSubModal });
})();
