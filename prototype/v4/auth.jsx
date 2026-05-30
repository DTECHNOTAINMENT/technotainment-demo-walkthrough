/* v3 Login + Signup — full-bleed dark with brand-gradient hero */
(() => {
const { useState } = React;
const { Icon, formatNum, pic } = window;

const COLLAGE = [
  "sr-collage-1","sr-collage-2","sr-collage-3","sr-collage-4","sr-collage-5","sr-collage-6"
];

const Collage = () => (
  <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: 12, padding: 12, opacity: 0.5, filter: "blur(2px) saturate(1.1)", pointerEvents: "none" }}>
    {COLLAGE.map((s, i) => (
      <div key={s} style={{ backgroundImage: `url(${pic(s)})`, backgroundSize: "cover", backgroundPosition: "center", borderRadius: 14, transform: `rotate(${(i % 2 ? -1 : 1) * 1.5}deg)` }} />
    ))}
  </div>
);

const AuthScreen = ({ mode, onAuth, onSwitch }) => {
  const [email, setEmail] = useState("alex.m@example.fm");
  const [password, setPassword] = useState("••••••••••");
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("uk · england & wales");
  const isLogin = mode === "login";

  const submit = (e) => { e.preventDefault(); onAuth({ email, name: name || "Alex Maren", loc }); };

  return (
    <div style={{ minHeight: "100vh", background: "#0B0B12", color: "white", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <Collage />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(60% 60% at 50% 40%, transparent, rgba(11,11,18,0.9) 70%, rgba(11,11,18,1) 100%)" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 440, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Brand */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "var(--brand-gradient)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l1.6 5L18 9.6 13.6 12 12 17 10.4 12 6 9.6 10.4 8 12 3z" /></svg>
            </span>
            <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: "white" }}>metascape</span>
          </span>
        </div>

        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.05 }} className="lower">
            <span className="brand-grad-text">{isLogin ? "welcome back." : "join the room."}</span>
          </h1>
          <div style={{ marginTop: 8, fontSize: 14, color: "#A1A1B0" }}>{isLogin ? "your follows, memberships, and CAST balance are waiting." : "an account is free. you only pay for what you tip, sub, or buy — in CAST."}</div>
        </div>

        {/* SSO */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => onAuth({ name: "Alex Maren", email: "alex.m@example.fm", sso: "google", loc })}
            style={{ padding: "12px", borderRadius: 12, background: "#FFFFFF", color: "#0B0B12", fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 16, height: 16, background: "conic-gradient(from 90deg, #ea4335 0 25%, #fbbc05 25% 50%, #34a853 50% 75%, #4285f4 75%)", borderRadius: 4 }} />
            continue with google
          </button>
          <button onClick={() => onAuth({ name: "Alex Maren", email: "alex.m@example.fm", sso: "apple", loc })}
            style={{ padding: "12px", borderRadius: 12, background: "#0B0B12", color: "white", fontWeight: 700, fontSize: 14, border: "1px solid rgba(255,255,255,0.18)", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor"><path d="M11.55 8.45a3.36 3.36 0 011.6-2.82 3.45 3.45 0 00-2.71-1.47c-1.14-.12-2.23.67-2.8.67-.59 0-1.48-.66-2.44-.64-1.25.02-2.41.73-3.05 1.85-1.31 2.26-.33 5.6.93 7.43.62.9 1.34 1.9 2.3 1.87.92-.04 1.27-.6 2.39-.6s1.43.6 2.41.58c1-.02 1.62-.91 2.23-1.81.46-.65.85-1.36 1.12-2.13a3.27 3.27 0 01-2-3zM9.75 2.97a3.3 3.3 0 00.76-2.37 3.39 3.39 0 00-2.2 1.13 3.13 3.13 0 00-.78 2.28 2.8 2.8 0 002.22-1.04z" /></svg>
            continue with apple
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#6E6E80", fontSize: 11 }}>
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          or {isLogin ? "sign in" : "create"} with email
          <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {!isLogin && (
            <Field label="display name" value={name} onChange={setName} placeholder="alex" />
          )}
          <Field label="email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
          <Field label="password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
          {!isLogin && (
            <Field label="jurisdiction" select value={loc} onChange={setLoc} options={["uk · england & wales","uk · scotland","ireland","germany","france","spain","italy","portugal","netherlands","us · ca","us · ny","other"]} />
          )}
          {isLogin && (
            <div style={{ textAlign: "right" }}>
              <a style={{ fontSize: 12, color: "#A1A1B0", cursor: "pointer" }} onClick={(e) => { e.preventDefault(); }}>forgot password</a>
            </div>
          )}
          <button type="submit" className="btn btn-grad" style={{ padding: "14px", fontSize: 14, marginTop: 6 }}>
            {isLogin ? "sign in" : "create account"} <Icon name="arrowR" size={14} stroke={2.4} />
          </button>
        </form>

        {/* Demo bypass */}
        <button onClick={() => onAuth({ name: "Alex Maren", email: "alex.m@example.fm", loc, demo: true })}
          className="btn btn-grad-stroke" style={{ padding: "12px", fontSize: 13, background: "transparent", color: "white" }}>
          <Icon name="sparkle" size={14} stroke={2.4} /> demo as alex maren
        </button>

        <div style={{ textAlign: "center", fontSize: 12, color: "#A1A1B0" }}>
          {isLogin ? <>new here? <a style={{ color: "white", fontWeight: 700, cursor: "pointer" }} onClick={() => onSwitch("signup")}>create an account</a></>
                   : <>already a viewer? <a style={{ color: "white", fontWeight: 700, cursor: "pointer" }} onClick={() => onSwitch("login")}>sign in</a></>}
        </div>

        <div style={{ textAlign: "center", fontSize: 10, color: "#6E6E80", fontFamily: "var(--font-mono)", marginTop: 10 }}>
          by continuing you agree to our community rules · CAST policy · jurisdictional terms.
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, type = "text", value, onChange, placeholder, select, options }) => (
  <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <span style={{ fontSize: 11, color: "#A1A1B0", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>{label}</span>
    {select ? (
      <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "12px 14px", borderRadius: 10, background: "#15151F", color: "white", border: "1px solid rgba(255,255,255,0.12)", fontSize: 14, outline: "none" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ padding: "12px 14px", borderRadius: 10, background: "#15151F", color: "white", border: "1px solid rgba(255,255,255,0.12)", fontSize: 14, outline: "none" }} />
    )}
  </label>
);

Object.assign(window, { AuthScreen });
})();
