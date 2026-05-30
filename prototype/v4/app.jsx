/* v4 app — sidebar layout, minimal topbar, multi-route, persistence */
(() => {
const { useState, useEffect, useRef, useCallback } = React;
const {
  Icon, CastGlyph, formatNum, ToastHost, useToast, flyCast,
  HomeScreen, LiveWatchScreen, MicroCastScreen, WalletScreen, ProfileScreen,
  AuthScreen, NotificationsDrawer, SearchBox, SearchResultsScreen, SmallRoomsScreen, ReceiptScreen,
  TipModal, SubscribeModal, CompeteModal, BuyDropModal, BuyPPVModal, CancelSubModal, GiftSubModal,
  TopUpFlow, FollowingScreen, ExploreScreen, LibraryScreen, DropsScreen,
  Sidebar, SidebarDrawer, StudioApp, OnboardingFlow, AdminApp, STUDIO_ME,
  CREATORS, LIVE_PAGE, WALLET, MEMBERSHIPS, FOLLOWED, findC
} = window;

// Mobile bottom tab — only 4 items
const BOTTOM_NAV = [
  { id: "home",    label: "home",   icon: "home"   },
  { id: "live",    label: "live",   icon: "flame"  },
  { id: "wallet",  label: "wallet", icon: "wallet" },
  { id: "profile", label: "you",    icon: "user"   },
];

// ---- persistence helpers ----
const K = (k) => "metascape-v4-" + k;
const load = (k, fallback) => { try { const v = localStorage.getItem(K(k)); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (k, v) => { try { localStorage.setItem(K(k), JSON.stringify(v)); } catch {} };

// ---- Brand lockup — full technotainment mark, no extra wordmark ----
const BrandLockup = ({ small }) => (
  <img src={(window.__resources && window.__resources.logo) || "assets/technotainment-logo-t.png"}
    alt="technotainment"
    className="logo-blend"
    style={{ height: small ? 28 : 36, width: "auto", display: "block" }} />
);

// ---- TopBar (minimal: brand · search · identity) ----
const TopBar = ({ onHamburger, wallet, balanceChanged, onTopUp, onBell, theme, setTheme,
                  onSearchSubmit, onOpenCreator, onOpenLive, onOpenMetaCast, toast, notifUnread, setRoute, route }) => {
  const pillRef = useRef(null);
  useEffect(() => {
    if (!pillRef.current || balanceChanged === 0) return;
    pillRef.current.classList.add("pulse");
    const t = setTimeout(() => pillRef.current?.classList.remove("pulse"), 600);
    return () => clearTimeout(t);
  }, [balanceChanged]);

  return (
    <header className="topbar theme-fade">
      <div style={{ padding: "0 18px", minHeight: 60, display: "flex", alignItems: "center", gap: 14 }}>
        {/* Mobile hamburger */}
        <button onClick={onHamburger} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)", display: "inline-flex" }} aria-label="open menu">
          <Icon name="grid" size={16} stroke={2} />
        </button>
        <style>{`@media (min-width: 1024px) { header.topbar [aria-label="open menu"] { display: none !important; } }`}</style>

        <SearchBox onSubmit={onSearchSubmit} onOpenCreator={onOpenCreator} onOpenLive={onOpenLive} onOpenMetaCast={onOpenMetaCast} toast={toast} />

        <div style={{ flex: 1 }} />

        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="theme-toggle" aria-label="toggle theme">
          <Icon name={theme === "dark" ? "sun" : "moon"} size={16} stroke={2.2} />
        </button>

        <button onClick={onBell} className="theme-toggle" style={{ background: "var(--surface-2)", borderImage: "none", border: "1px solid var(--hairline)", position: "relative" }} aria-label="notifications">
          <Icon name="bell" size={16} stroke={2.2} />
          {notifUnread > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 7, height: 7, borderRadius: "50%", background: "var(--brand-gradient)" }} />}
        </button>

        <button ref={pillRef} onClick={(e) => onTopUp(e.currentTarget)} className="cast-pill" aria-label="CAST balance — top up">
          <span className="cast-glyph">C</span>
          <span className="tnum brand-grad-text" style={{ fontWeight: 800 }}>{formatNum(wallet.balance)}</span>
          <span style={{ color: "var(--ink-3)", fontWeight: 500, fontSize: 11 }}>CAST</span>
          <span className="cast-topup"><Icon name="plus" size={12} stroke={2.6} /></span>
        </button>

        <button onClick={() => setRoute("profile")} className="theme-toggle" style={{ background: "transparent", borderImage: "none", border: "none", padding: 0 }} aria-label="profile">
          <span style={{ width: 32, height: 32, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0a0a0a,#3a3a3a)", color: "white", fontSize: 11, fontWeight: 800 }}>AM</span>
        </button>
      </div>
    </header>
  );
};

const BottomNav = ({ route, setRoute }) => (
  <nav className="bn theme-fade">
    {BOTTOM_NAV.map(r => (
      <button key={r.id} onClick={() => setRoute(r.id)} className={`bn-item ${route === r.id ? "active" : ""}`}>
        <Icon name={r.icon} size={20} stroke={route === r.id ? 2.4 : 1.8} />
        <span>{r.label}</span>
      </button>
    ))}
  </nav>
);

// ---- App ----------------------------------------------------------------
const App = () => {
  const [theme, setTheme] = useState(() => load("theme", "dark"));
  useEffect(() => { document.documentElement.setAttribute("data-theme", theme); save("theme", theme); }, [theme]);

  const [auth, setAuth] = useState(() => load("auth", null));
  useEffect(() => save("auth", auth), [auth]);

  const [studioMode, setStudioMode] = useState(() => load("studioMode", false));
  useEffect(() => save("studioMode", studioMode), [studioMode]);
  const [isCreator, setIsCreator] = useState(() => load("isCreator", false));
  useEffect(() => save("isCreator", isCreator), [isCreator]);
  const [onboarding, setOnboarding] = useState(false);
  const openStudio = () => { if (isCreator) setStudioMode(true); else setOnboarding(true); };

  const [adminMode, setAdminMode] = useState(() => load("adminMode", false));
  useEffect(() => save("adminMode", adminMode), [adminMode]);

  const [route, setRouteRaw] = useState(() => load("route", "home"));
  const [category, setCategory] = useState(() => load("category", null));
  const setRoute = (r) => { setRouteRaw(r); if (r !== "home") setCategory(null); };
  useEffect(() => save("route", route), [route]);
  useEffect(() => save("category", category), [category]);

  const [wallet, setWallet] = useState(() => load("wallet", WALLET));
  useEffect(() => save("wallet", wallet), [wallet]);

  const [memberships, setMemberships] = useState(() => load("memberships", MEMBERSHIPS));
  useEffect(() => save("memberships", memberships), [memberships]);

  const [following, setFollowing] = useState(() => load("following", FOLLOWED.map(c => c.id)));
  useEffect(() => save("following", following), [following]);

  const [receipts, setReceipts] = useState(() => load("receipts", []));
  useEffect(() => save("receipts", receipts), [receipts]);

  const [ledger, setLedger] = useState(() => load("ledger", LIVE_PAGE.initialLedger));
  useEffect(() => save("ledger", ledger.slice(-30)), [ledger]);

  const [notifUnread, setNotifUnread] = useState(5);

  // ephemeral
  const [balanceChanged, setBalanceChanged] = useState(0);
  const bumpBalance = () => setBalanceChanged(n => n + 1);
  const [activeCreator, setActiveCreator] = useState(CREATORS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMetaCast, setActiveMetaCast] = useState(null);
  const [activeReceipt, setActiveReceipt] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // modals
  const [tipState, setTip] = useState({ open: false });
  const [subState, setSub] = useState({ open: false });
  const [topupState, setTopup] = useState({ open: false });
  const [compState, setComp] = useState({ open: false });
  const [dropState, setDrop] = useState({ open: false });
  const [ppvState, setPPV] = useState({ open: false });
  const [cancelState, setCancel] = useState({ open: false });
  const [giftState, setGift] = useState({ open: false });

  const toast = useToast();

  const openTip = (creator, anchor) => setTip({ open: true, creator, anchor });
  const openSub = (creator, tier, anchor) => setSub({ open: true, creator, tier, anchor });
  const openTopup = (anchor, suggested) => setTopup({ open: true, anchor, suggested });
  const openCompete = (comp, anchor, creator = LIVE_PAGE.creator) => setComp({ open: true, comp, anchor, creator });
  const openDrop = (drop, creator) => setDrop({ open: true, drop, creator: creator || drop?.creator });
  const openPPV = (ppv, creator) => setPPV({ open: true, ppv, creator });
  const openCancel = (membership) => setCancel({ open: true, membership });
  const openGift = (creator) => setGift({ open: true, creator });

  const openLive = () => setRoute("live");
  const openMicroCast = (creator) => { if (creator) setActiveCreator(creator); setRouteRaw("microcast"); };
  const openMetaCast = (id) => { setActiveMetaCast(id); setRouteRaw("metacast"); };

  const newReceipt = (r) => {
    const full = { no: r.no || ("TXR-" + Math.random().toString(36).slice(2, 8).toUpperCase()), date: r.date || new Date().toISOString(), ...r };
    setReceipts(rs => [full, ...rs].slice(0, 100));
    return full;
  };
  const openReceipt = (no) => {
    const r = receipts.find(x => x.no === no);
    if (r) { setActiveReceipt(r); setRouteRaw("receipt"); }
    else toast("receipt not found");
  };

  const confirmTip = (amount, btn) => {
    setWallet(w => ({ ...w, balance: w.balance - amount }));
    bumpBalance();
    setLedger(prev => [...prev.slice(-29), { who: "@you", amount, kind: "tip" }]);
    flyCast(amount, btn);
    newReceipt({ kind: "tip", title: `tip · ${tipState.creator?.handle}`, amount: -amount, payment: "CAST balance", creator: tipState.creator,
      lines: [{ label: `tip to ${tipState.creator?.handle}`, value: `${amount} CAST` }, { label: "platform fee", value: "0 CAST" }, { label: "to creator", value: `${amount} CAST` }], total: `${amount} CAST` });
    setTip({ open: false });
    toast(`+${amount} CAST sent to ${tipState.creator?.handle}`, { icon: true });
  };
  const confirmSub = (tier, btn) => {
    setWallet(w => ({ ...w, balance: w.balance - tier.cast }));
    bumpBalance(); flyCast(tier.cast, btn);
    setMemberships(ms => ms.some(m => m.creator.id === subState.creator.id && m.tier === tier.name) ? ms : [{ creator: subState.creator, tier: tier.name, cast: tier.cast, since: "today" }, ...ms]);
    newReceipt({ kind: "subscription", title: `subscription · ${subState.creator?.handle}`, amount: -tier.cast, payment: "CAST balance", creator: subState.creator,
      lines: [{ label: tier.name, value: `${tier.cast} CAST/mo` }, { label: "first period", value: "today → 27 jun" }, { label: "renews", value: "monthly" }], total: `${tier.cast} CAST` });
    setSub({ open: false });
    toast(`subscribed · ${tier.cast} CAST/month`);
  };
  const completeTopup = ({ amount, fiat, pm, receipt }) => {
    setWallet(w => ({ ...w, balance: w.balance + amount }));
    bumpBalance(); newReceipt(receipt);
    toast(`+${formatNum(amount)} CAST added`, { icon: true });
  };
  const confirmCompete = (comp, btn) => {
    setWallet(w => ({ ...w, balance: w.balance - comp.entry }));
    bumpBalance(); flyCast(comp.entry, btn);
    newReceipt({ kind: "competition", title: `competition entry · ${comp.name}`, amount: -comp.entry, payment: "CAST balance",
      lines: [{ label: comp.name, value: `${comp.entry} CAST` }, { label: "jurisdiction", value: "UK · England & Wales" }], total: `${comp.entry} CAST` });
    setComp({ open: false });
    toast(`entered · ${comp.entry} CAST`, { icon: true });
  };
  const confirmDrop = ({ drop, address }, btn) => {
    setWallet(w => ({ ...w, balance: w.balance - drop.price }));
    bumpBalance(); flyCast(drop.price, btn);
    newReceipt({ kind: "drop", title: drop.name, amount: -drop.price, payment: "CAST balance", creator: dropState.creator,
      lines: [{ label: drop.name, value: `${drop.price} CAST` }, { label: "edition", value: drop.edition }, ...(address ? [{ label: "ship to", value: `${address.line1}, ${address.city} ${address.postcode}` }] : [])], total: `${drop.price} CAST` });
    setDrop({ open: false });
    toast(`bought · ${drop.name}`, { icon: true });
  };
  const confirmPPV = (ppv, btn) => {
    setWallet(w => ({ ...w, balance: w.balance - ppv.price }));
    bumpBalance(); flyCast(ppv.price, btn);
    newReceipt({ kind: "ppv", title: ppv.name, amount: -ppv.price, payment: "CAST balance", creator: ppvState.creator,
      lines: [{ label: ppv.name, value: `${ppv.price} CAST` }, { label: "access window", value: ppv.window || "48h rental" }], total: `${ppv.price} CAST` });
    setPPV({ open: false });
    toast(`access granted · view in library`, { icon: true });
  };
  const confirmCancel = (m) => { setMemberships(ms => ms.filter(x => !(x.creator.id === m.creator.id && x.tier === m.tier))); setCancel({ open: false }); toast(`cancelled · access kept until 27 jun`); };
  const pauseSub = () => { setCancel({ open: false }); toast(`paused 1 month`); };
  const confirmGift = ({ creator, count, recipient, cost }, btn) => {
    setWallet(w => ({ ...w, balance: w.balance - cost }));
    bumpBalance(); flyCast(cost, btn);
    newReceipt({ kind: "gift", title: `${count} sub${count > 1 ? "s" : ""} gifted · ${creator?.handle}`, amount: -cost, payment: "CAST balance", creator,
      lines: [{ label: `${count} × tier-1 subscription`, value: `${cost} CAST` }, ...(recipient ? [{ label: "recipient", value: recipient }] : [{ label: "recipient", value: "the room (random)" }])], total: `${cost} CAST` });
    setGift({ open: false });
    toast(`${count} sub${count > 1 ? "s" : ""} gifted`, { icon: true });
  };
  const onLedgerAdd = useCallback((e) => setLedger(prev => [...prev.slice(-29), e]), []);
  const onSearchSubmit = (q) => { setSearchQuery(q); setRouteRaw("search"); };
  const onCategory = (c) => { setCategory(c); setRouteRaw("home"); };

  if (!auth) {
    return <AuthScreen mode={authMode} onAuth={(user) => { setAuth(user); setRouteRaw("home"); }} onSwitch={setAuthMode} />;
  }

  if (onboarding) {
    return <OnboardingFlow user={auth}
      onCancel={() => setOnboarding(false)}
      onComplete={() => { setIsCreator(true); setOnboarding(false); setStudioMode(true); toast("welcome to your studio", { icon: true }); }} />;
  }

  if (adminMode) {
    return <AdminApp onExit={() => setAdminMode(false)} theme={theme} setTheme={setTheme} toast={toast} />;
  }

  if (studioMode) {
    return <StudioApp onExit={() => setStudioMode(false)}
      onViewPublic={() => { setStudioMode(false); openMicroCast(STUDIO_ME); }}
      theme={theme} setTheme={setTheme} toast={toast} />;
  }

  const sidebarProps = {
    route, setRoute, followingIds: following, onOpenCreator: openMicroCast,
    onSignOut: () => setAuth(null), toast, onCategory, category,
    onOpenStudio: openStudio, isCreator, onOpenAdmin: () => setAdminMode(true)
  };

  // The live page no longer goes full-bleed — it uses the app shell like every other route
  const fullBleed = false;

  return (
    <div className={fullBleed ? "" : "app-shell"}>
      {/* Sidebar always renders — collapsed icon rail on the watch page */}
      <Sidebar {...sidebarProps} />
      <Sidebar {...sidebarProps} narrow />

      <div className="main-col">
        <TopBar
          route={route} setRoute={setRoute}
          wallet={wallet} balanceChanged={balanceChanged}
          onTopUp={openTopup}
          onBell={() => { setNotifOpen(true); setNotifUnread(0); }}
          notifUnread={notifUnread}
          theme={theme} setTheme={setTheme}
          onSearchSubmit={onSearchSubmit}
          onOpenCreator={openMicroCast}
          onOpenLive={openLive}
          onOpenMetaCast={openMetaCast}
          onHamburger={() => setDrawerOpen(true)}
          toast={toast}
        />

        <main className="theme-fade">
          {route === "home"      && <HomeScreen onOpenLive={openLive} onOpenMicroCast={openMicroCast} toast={toast} setRoute={setRoute} onOpenMetaCast={openMetaCast} onOpenDrop={openDrop} category={category} />}
          {route === "live"      && <LiveWatchScreen wallet={wallet} ledger={ledger} onLedgerAdd={onLedgerAdd}
                                       onOpenTip={openTip} onOpenCompete={openCompete} onOpenMicroCast={openMicroCast}
                                       onOpenDrop={openDrop} onOpenGift={openGift}
                                       setRoute={setRoute} toast={toast} />}
          {route === "microcast" && <MicroCastScreen creator={activeCreator} onSubscribe={openSub}
                                       onOpenTip={openTip} onOpenLive={openLive} onOpenDrop={openDrop} onOpenPPV={openPPV}
                                       isOwnChannel={isCreator && activeCreator?.id === STUDIO_ME.id} onOpenStudio={() => setStudioMode(true)}
                                       setRoute={setRoute} toast={toast} />}
          {route === "wallet"    && <WalletScreen wallet={wallet} onTopUp={openTopup} toast={toast} receipts={receipts} onOpenReceipt={openReceipt} />}
          {route === "profile"   && <ProfileScreen onOpenMicroCast={openMicroCast} onOpenWallet={() => setRoute("wallet")} toast={toast} setRoute={setRoute} memberships={memberships} onCancelSub={openCancel} onSignOut={() => setAuth(null)} onOpenStudio={openStudio} isCreator={isCreator} onOpenAdmin={() => setAdminMode(true)} />}
          {route === "metacast"  && activeMetaCast === "smallrooms" && <SmallRoomsScreen onBack={() => setRoute("home")} onOpenLive={openLive} onOpenMicroCast={openMicroCast} onOpenTip={openTip} toast={toast} />}
          {route === "search"    && <SearchResultsScreen query={searchQuery} onOpenLive={openLive} onOpenMicroCast={openMicroCast} onOpenMetaCast={openMetaCast} toast={toast} />}
          {route === "receipt"   && <ReceiptScreen receipt={activeReceipt} onBack={() => setRoute("wallet")} toast={toast} />}
          {route === "following" && <FollowingScreen followingIds={following} onOpenLive={openLive} onOpenMicroCast={openMicroCast} toast={toast} setRoute={setRoute} />}
          {route === "explore"   && <ExploreScreen onOpenMetaCast={openMetaCast} toast={toast} />}
          {route === "library"   && <LibraryScreen onOpenLive={openLive} onOpenMicroCast={openMicroCast} toast={toast} />}
          {route === "drops"     && <DropsScreen onOpenDrop={openDrop} toast={toast} />}
          {route === "settings"  && <ProfileScreen onOpenMicroCast={openMicroCast} onOpenWallet={() => setRoute("wallet")} toast={toast} setRoute={setRoute} memberships={memberships} onCancelSub={openCancel} onSignOut={() => setAuth(null)} onOpenStudio={openStudio} isCreator={isCreator} onOpenAdmin={() => setAdminMode(true)} />}
        </main>

        {!fullBleed && <BottomNav route={route} setRoute={setRoute} />}
      </div>

      {/* Mobile drawer (uses full Sidebar) */}
      <SidebarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...sidebarProps} />

      <NotificationsDrawer open={notifOpen} onClose={() => setNotifOpen(false)}
        onMarkAll={() => setNotifUnread(0)}
        onOpenCreator={openMicroCast}
        onOpenRoute={setRoute}
        toast={toast} />

      <TipModal       open={tipState.open}    creator={tipState.creator}        wallet={wallet} onClose={() => setTip({open:false})}   onConfirm={confirmTip} />
      <SubscribeModal open={subState.open}    creator={subState.creator}        tier={subState.tier} wallet={wallet} onClose={() => setSub({open:false})}   onConfirm={confirmSub} />
      <TopUpFlow      open={topupState.open}  suggested={topupState.suggested}  wallet={wallet} onClose={() => setTopup({open:false})} onComplete={completeTopup} onViewReceipt={openReceipt} />
      <CompeteModal   open={compState.open}   comp={compState.comp} creator={compState.creator} wallet={wallet} onClose={() => setComp({open:false})}  onConfirm={confirmCompete} />
      <BuyDropModal   open={dropState.open}   drop={dropState.drop} creator={dropState.creator}  wallet={wallet} onClose={() => setDrop({open:false})}  onConfirm={confirmDrop} />
      <BuyPPVModal    open={ppvState.open}    ppv={ppvState.ppv}   creator={ppvState.creator}   wallet={wallet} onClose={() => setPPV({open:false})}   onConfirm={confirmPPV} />
      <CancelSubModal open={cancelState.open} membership={cancelState.membership}                                  onClose={() => setCancel({open:false})} onConfirm={confirmCancel} onPause={pauseSub} />
      <GiftSubModal   open={giftState.open}   creator={giftState.creator}                       wallet={wallet} onClose={() => setGift({open:false})}  onConfirm={confirmGift} />
    </div>
  );
};

const Root = () => (<ToastHost><App /></ToastHost>);
ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
})();
