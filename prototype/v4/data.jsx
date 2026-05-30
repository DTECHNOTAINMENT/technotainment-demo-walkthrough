/* v2 data — densely populated. Picsum/gradient mixed thumbnails. */
(() => {

const pic = (seed) => {
  const id = "pic_" + seed.replace(/[^a-z0-9]/gi, "_");
  return (window.__resources && window.__resources[id]) || `https://picsum.photos/seed/${encodeURIComponent(seed)}/640/360`;
};
const picTall = (seed) => {
  const id = "picTall_" + seed.replace(/[^a-z0-9]/gi, "_");
  return (window.__resources && window.__resources[id]) || `https://picsum.photos/seed/${encodeURIComponent(seed)}/480/640`;
};
// Tagged photographic source — used for hero + content tiles needing real imagery
const picTagged = (tags, seed) => {
  const lock = (seed || tags).split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 0);
  return `https://loremflickr.com/640/360/${encodeURIComponent(tags)}/?lock=${lock}`;
};

const CREATOR_TAGS = {
  atlas: "football,crowd,stadium,floodlights",
  kavi: "chef,cooking,kitchen,portrait",
  nyx: "musician,synthesizer,studio,portrait",
  saber: "esports,gaming,stage,arena",
  joon: "artist,drawing,illustration,hands",
  rivers: "guitar,musician,acoustic,portrait",
  tola: "electronics,repair,workshop,hands",
  ines: "skateboard,skater,street,city",
  marlowe: "pottery,ceramics,hands,studio",
  demo: "podcast,microphone,host,studio",
  wren: "running,trail,athlete,mountain",
  kola: "dj,nightclub,decks,vinyl",
  yara: "writer,books,desk,portrait",
  rhett: "climbing,mountain,alpine,athlete",
  minerva: "chess,board,player,portrait",
  halcyon: "musician,studio,ambient,portrait",
  marisol: "circus,trapeze,performer,aerial",
  ozan: "carpenter,woodworking,workshop,hands",
};
const pickCreatorPic = (cid, seed) => picTagged(CREATOR_TAGS[cid] || "portrait,person,studio", `${cid}-${seed || "x"}`);

const CREATORS = [
  { id: "nyx",       name: "Nyx Okafor",         handle: "@nyxsynth",       brand: "#7c3aed", brand2: "#ec4899", followers: 226800, category: "modular synth"      },
  { id: "kavi",      name: "Kavi Rao",           handle: "@kavikitchen",    brand: "#dc2626", brand2: "#f97316", followers: 412300, category: "live cooking"       },
  { id: "atlas",     name: "Atlas FC",           handle: "@atlasfc",        brand: "#1e3a8a", brand2: "#3b82f6", followers: 988400, category: "lower-league football"},
  { id: "joon",      name: "Joon Park",          handle: "@joondraws",      brand: "#9333ea", brand2: "#6366f1", followers: 73800,  category: "illustration"       },
  { id: "rivers",    name: "Pip Rivers",         handle: "@riverssings",    brand: "#365314", brand2: "#84cc16", followers: 39400,  category: "country folk"       },
  { id: "tola",      name: "Tola Amari",         handle: "@tolafixes",      brand: "#0369a1", brand2: "#06b6d4", followers: 181100, category: "electronics repair" },
  { id: "ines",      name: "Inés Vidal",         handle: "@inesskates",     brand: "#be123c", brand2: "#fb7185", followers: 596500, category: "street skate"       },
  { id: "marlowe",   name: "Margot Marlowe",     handle: "@marlowestudio",  brand: "#0f766e", brand2: "#22d3ee", followers: 84200,  category: "ceramics"           },
  { id: "demo",      name: "Demo Daye",          handle: "@demodaye",       brand: "#fb923c", brand2: "#ef4444", followers: 1240000,category: "talk show host"     },
  { id: "wren",      name: "Wren Holloway",      handle: "@wrenruns",       brand: "#0ea5e9", brand2: "#6366f1", followers: 320900, category: "ultra running"      },
  { id: "kola",      name: "Kola Adebayo",       handle: "@kolasounds",     brand: "#be185d", brand2: "#7c3aed", followers: 705200, category: "afro-fusion dj"     },
  { id: "yara",      name: "Yara Salam",         handle: "@yarawrites",     brand: "#8b5cf6", brand2: "#3b82f6", followers: 156400, category: "novelist · workshop"},
  { id: "rhett",     name: "Rhett Doyle",        handle: "@rhettclimbs",    brand: "#16a34a", brand2: "#facc15", followers: 244800, category: "alpine climbing"    },
  { id: "minerva",   name: "Minerva Cho",        handle: "@minervalab",     brand: "#0ea5e9", brand2: "#10b981", followers: 419300, category: "chess · open analysis"},
  { id: "saber",     name: "Saber Esports",      handle: "@saberesports",   brand: "#ef4444", brand2: "#7c3aed", followers: 2400000,category: "competitive esports"},
  { id: "halcyon",   name: "Halcyon Collective", handle: "@halcyon",        brand: "#06b6d4", brand2: "#8b5cf6", followers: 184700, category: "ambient sessions"   },
  { id: "marisol",   name: "Marisol Vega",       handle: "@marisolflies",   brand: "#fb7185", brand2: "#facc15", followers: 91200,  category: "trapeze · circus"   },
  { id: "ozan",      name: "Ozan Demir",         handle: "@ozanbuilds",     brand: "#f59e0b", brand2: "#dc2626", followers: 502400, category: "workshop · woodwork"},
];

const findC = (id) => CREATORS.find(c => c.id === id);

const METACASTS = [
  { id: "prosurf",   name: "ProSurf League",         tag: "world surfing tour · live legs",         brand: "linear-gradient(135deg,#0ea5e9,#06b6d4,#1e3a8a)", img: pic("surf-pro") },
  { id: "gospel",    name: "GospelStream Network",   tag: "9 parishes · sunday live worship",        brand: "linear-gradient(135deg,#f97316,#dc2626,#7c2d12)", img: pic("choir") },
  { id: "kitchen",   name: "Kitchen Lab",            tag: "michelin chefs, on camera, weekly",       brand: "linear-gradient(135deg,#dc2626,#f59e0b,#10b981)", img: pic("kitchen-pro") },
  { id: "lowerleague", name: "Lower League Live",    tag: "26 clubs · 1 home for matchday",          brand: "linear-gradient(135deg,#1e3a8a,#3b82f6,#0ea5e9)", img: pic("stadium-lights") },
  { id: "kindred",   name: "Kindred Faith",          tag: "interfaith broadcasts · meditations",      brand: "linear-gradient(135deg,#7c2d12,#ea580c,#facc15)", img: pic("sanctuary") },
  { id: "smallrooms",name: "Small Rooms",            tag: "touring artists, no labels",              brand: "linear-gradient(135deg,#581c87,#a855f7,#ec4899)", img: pic("intimate-stage") },
  { id: "esports",   name: "SaberLeague Esports",    tag: "regional → invitational",                 brand: "linear-gradient(135deg,#ef4444,#7c3aed,#06b6d4)", img: pic("esports-arena") },
  { id: "stitch",    name: "Stitch & Salt",          tag: "indie makers · live monthly",              brand: "linear-gradient(135deg,#0f766e,#10b981,#facc15)", img: pic("textile-studio") },
];

const CATEGORIES = ["all", "live", "music", "gaming", "sports", "talk", "education", "drops", "faith", "esports"];

const HERO = {
  title: "Atlas FC vs Northgate Reserves",
  sub: "non-league cup · matchday 18 · second half",
  creator: findC("atlas"),
  viewers: 47200,
  startedAt: "live · 67' in",
  img: picTagged("football,crowd,stadium,floodlights,night", "atlas-hero"),
  ctaLabel: "watch live",
};

// LIVE NOW (24 tiles)
const LIVE = [
  { id: "L1",  creator: findC("kavi"), title: "sunday roast · you pick the bird",      viewers: 4218,  cat: "talk",     thumb: pickCreatorPic("kavi", "roast-kitchen") },
  { id: "L2",  creator: findC("atlas"), title: "atlas fc vs northgate reserves",        viewers: 47200, cat: "sports",   thumb: pickCreatorPic("atlas", "atlas-stadium") },
  { id: "L3",  creator: findC("nyx"), title: "buchla patch · night session #13",      viewers: 892,   cat: "music",    thumb: pickCreatorPic("nyx", "synth-modular-glow"), tg: 4 },
  { id: "L4",  creator: findC("saber"), title: "valorant — grand finals · map 3",       viewers: 184320,cat: "esports",  thumb: pickCreatorPic("saber", "esports-stage") },
  { id: "L5",  creator: findC("rivers"), title: "open chord-building room",              viewers: 318,   cat: "music",    thumb: pickCreatorPic("rivers", "guitar-couch"), tg: 7 },
  { id: "L6",  creator: findC("tola"), title: "reviving a 1978 marantz 2245",          viewers: 1607,  cat: "education",thumb: pickCreatorPic("tola", "vintage-stereo") },
  { id: "L7",  creator: findC("ines"), title: "barcelona · gothic quarter session",    viewers: 9842,  cat: "sports",   thumb: pickCreatorPic("ines", "skate-street") },
  { id: "L8",  creator: findC("demo"), title: "the morning show · with bea & lin",     viewers: 22140, cat: "talk",     thumb: pickCreatorPic("demo", "podcast-set") },
  { id: "L9",  creator: findC("kola"), title: "saturday rooftop · vinyl only",         viewers: 6210,  cat: "music",    thumb: pickCreatorPic("kola", "rooftop-dj") },
  { id: "L10", creator: findC("minerva"), title: "live chess · sicilian deep dive",       viewers: 3920,  cat: "education",thumb: pickCreatorPic("minerva", "chess-board-light") },
  { id: "L11", creator: findC("rhett"), title: "patagonia · day 14 base camp",          viewers: 18230, cat: "sports",   thumb: pickCreatorPic("rhett", "mountain-camp") },
  { id: "L12", creator: findC("joon"), title: "ink drawing · timed to viewer prompts", viewers: 1182,  cat: "drops",    thumb: pickCreatorPic("joon", "ink-brush") },
  { id: "L13", creator: findC("marlowe"), title: "kiln-open · 24 piece drop tonight",     viewers: 612,   cat: "drops",    thumb: pickCreatorPic("marlowe", "ceramic-kiln") },
  { id: "L14", creator: findC("wren"), title: "trail 17 · pre-dawn run",               viewers: 4081,  cat: "sports",   thumb: pickCreatorPic("wren", "trail-running") },
  { id: "L15", creator: findC("halcyon"), title: "ambient · pre-rain set",                viewers: 2280,  cat: "music",    thumb: pickCreatorPic("halcyon", "ambient-fog") },
  { id: "L16", creator: findC("ozan"), title: "live joinery · cherry sideboard",       viewers: 1342,  cat: "education",thumb: pickCreatorPic("ozan", "woodworking-shop") },
  { id: "L17", creator: findC("yara"), title: "writing room · members open",           viewers: 487,   cat: "education",thumb: pickCreatorPic("yara", "desk-typewriter") },
  { id: "L18", creator: findC("marisol"), title: "trapeze rigging · backstage",           viewers: 1019,  cat: "talk",     thumb: pickCreatorPic("marisol", "circus-rigging") },
  { id: "L19", creator: findC("saber"), title: "rocket league · 6-man scrim",           viewers: 22480, cat: "esports",  thumb: pickCreatorPic("saber", "esports-blue") },
  { id: "L20", creator: findC("atlas"), title: "post-match · away coach unfiltered",    viewers: 8120,  cat: "sports",   thumb: pickCreatorPic("atlas", "post-match-press") },
  { id: "L21", creator: findC("nyx"), title: "modular q&a · open mic",                viewers: 1142,  cat: "music",    thumb: pickCreatorPic("nyx", "synth-q-and-a") },
  { id: "L22", creator: findC("kavi"), title: "knife sharpening · members hour",       viewers: 718,   cat: "education",thumb: pickCreatorPic("kavi", "knife-skills") },
  { id: "L23", creator: findC("kola"), title: "afro-fusion · vinyl & vinyl only",      viewers: 5310,  cat: "music",    thumb: pickCreatorPic("kola", "dj-decks-warm") },
  { id: "L24", creator: findC("rivers"), title: "co-write · 'late blue line'",           viewers: 222,   cat: "music",    thumb: pickCreatorPic("rivers", "guitar-acoustic-rain") },
];

// STARTING SOON (12)
const SOON = [
  { id: "S1",  creator: findC("marlowe"), title: "kiln opening · 24 pieces",            in: "14m", thumb: pickCreatorPic("marlowe", "kiln-opening")  },
  { id: "S2",  creator: findC("joon"), title: "saturday 4-hour drawing",             in: "32m", thumb: pickCreatorPic("joon", "drawing-table") },
  { id: "S3",  creator: findC("ines"), title: "berlin street league · finals",       in: "1h 18m", thumb: pickCreatorPic("ines", "skate-finals") },
  { id: "S4",  creator: findC("saber"), title: "league of legends · semis",           in: "2h",  thumb: pickCreatorPic("saber", "league-of-legends") },
  { id: "S5",  creator: findC("yara"), title: "writing workshop · prose week 6",     in: "3h 42m", thumb: pickCreatorPic("yara", "writing-workshop") },
  { id: "S6",  creator: findC("atlas"), title: "training session · open feed",        in: "7h",  thumb: pickCreatorPic("atlas", "training-pitch") },
  { id: "S7",  creator: findC("rhett"), title: "rope work · q&a from camp",           in: "8h",  thumb: pickCreatorPic("rhett", "climbing-rope") },
  { id: "S8",  creator: findC("nyx"), title: "patch workshop · members only",       in: "tomorrow 19:00", thumb: pickCreatorPic("nyx", "synth-patch") },
  { id: "S9",  creator: findC("demo"), title: "the morning show · guest: kavi rao",  in: "tomorrow 06:30", thumb: pickCreatorPic("demo", "morning-show") },
  { id: "S10", creator: findC("marisol"), title: "aerial silks · public class",         in: "tomorrow 10:00", thumb: pickCreatorPic("marisol", "aerial-silks") },
  { id: "S11", creator: findC("halcyon"), title: "release listening · 'glass tide'",    in: "tomorrow 21:00", thumb: pickCreatorPic("halcyon", "listening-event") },
  { id: "S12", creator: findC("ozan"), title: "open shop · tool sharpening night",   in: "mon 19:00", thumb: pickCreatorPic("ozan", "workshop-night") },
];

// FOLLOWED LATEST (12)
const FOLLOWED_LATEST = [
  { id: "F1",  creator: findC("nyx"), title: "patch notes for last night's #12 set",  ago: "12h",   dur: "1h 24m", thumb: pickCreatorPic("nyx", "synth-notes") },
  { id: "F2",  creator: findC("kavi"), title: "how we built tonight's menu, on camera",ago: "2d",    dur: "42 min", thumb: pickCreatorPic("kavi", "menu-cooking") },
  { id: "F3",  creator: findC("marlowe"), title: "wedging clay · beginner guide",         ago: "3d",    dur: "18 min", thumb: pickCreatorPic("marlowe", "clay-wedging") },
  { id: "F4",  creator: findC("joon"), title: "inktober · day 22 timelapse",           ago: "5d",    dur: "7 min",  thumb: pickCreatorPic("joon", "ink-day22") },
  { id: "F5",  creator: findC("atlas"), title: "tactics breakdown · 4-2-3-1 away",      ago: "6d",    dur: "21 min", thumb: pickCreatorPic("atlas", "tactics-board") },
  { id: "F6",  creator: findC("ines"), title: "tre flip · frame breakdown",            ago: "1w",    dur: "9 min",  thumb: pickCreatorPic("ines", "skate-tre-flip") },
  { id: "F7",  creator: findC("rivers"), title: "the song we almost cut",                 ago: "1w",    dur: "5 min",  thumb: pickCreatorPic("rivers", "song-tape") },
  { id: "F8",  creator: findC("tola"), title: "diagnosing a marantz · part one",       ago: "1w",    dur: "32 min", thumb: pickCreatorPic("tola", "amplifier-bench") },
  { id: "F9",  creator: findC("yara"), title: "writing prompt · the last room",        ago: "2w",    dur: "12 min", thumb: pickCreatorPic("yara", "typewriter-keys") },
  { id: "F10", creator: findC("kola"), title: "sunset set · cape town",                 ago: "2w",    dur: "1h 12m", thumb: pickCreatorPic("kola", "cape-town-sunset") },
  { id: "F11", creator: findC("rhett"), title: "alpine kit · what i actually pack",     ago: "3w",    dur: "16 min", thumb: pickCreatorPic("rhett", "alpine-kit") },
  { id: "F12", creator: findC("wren"), title: "long run · solo at altitude",            ago: "3w",    dur: "48 min", thumb: pickCreatorPic("wren", "trail-altitude") },
];

const FEATURED_MICROS = [
  { creator: findC("nyx"),     monthly: 18420,  banner: pic("nyx-banner")     },
  { creator: findC("kavi"),    monthly: 36210,  banner: pic("kavi-banner")    },
  { creator: findC("ines"),    monthly: 11200,  banner: pic("ines-banner")    },
  { creator: findC("marlowe"), monthly: 4380,   banner: pic("marlowe-banner") },
  { creator: findC("halcyon"), monthly: 9120,   banner: pic("halcyon-banner") },
  { creator: findC("rhett"),   monthly: 12800,  banner: pic("rhett-banner")   },
];

// DROPS / live commerce (12)
const DROPS = [
  { id: "D1",  creator: findC("marlowe"), name: "small bowl · kiln drop 048",        price: 180,  edition: "62 / 150", img: pic("ceramic-bowl") },
  { id: "D2",  creator: findC("kavi"),    name: "kavi's house apron",                price: 240,  edition: "ships worldwide", img: pic("chef-apron") },
  { id: "D3",  creator: findC("nyx"),     name: "field recordings · vol 4",          price: 120,  edition: "98 / 200", img: pic("vinyl-record") },
  { id: "D4",  creator: findC("joon"),    name: "ink drawing · sat 4-hour",          price: 320,  edition: "1 of 1",   img: pic("ink-sketch-large") },
  { id: "D5",  creator: findC("kola"),    name: "rooftop · live mix · 96k flac",     price: 80,   edition: "rentable", img: pic("vinyl-stack") },
  { id: "D6",  creator: findC("ines"),    name: "frame-by-frame · tre flip course",  price: 480,  edition: "self-paced",img: pic("skate-park-course") },
  { id: "D7",  creator: findC("ozan"),    name: "live build · cherry sideboard",     price: 1240, edition: "vod + sheets", img: pic("woodworking-tools") },
  { id: "D8",  creator: findC("rhett"),   name: "alpine kit list · printable",       price: 60,   edition: "pdf",       img: pic("packed-rope") },
  { id: "D9",  creator: findC("minerva"), name: "sicilian · 30-position memo",       price: 220,  edition: "members 50% off", img: pic("chess-pieces") },
  { id: "D10", creator: findC("halcyon"), name: "glass tide · stems pack",           price: 340,  edition: "tier 3 only", img: pic("waveform-art") },
  { id: "D11", creator: findC("yara"),    name: "the last room · short story",       price: 90,   edition: "pdf + epub", img: pic("book-cover") },
  { id: "D12", creator: findC("demo"),    name: "live show · annual pass",           price: 2400, edition: "12 months",  img: pic("microphone-on-air") },
];

// CONTINUE WATCHING (10)
const CONTINUE = [
  { id: "C1",  creator: findC("nyx"), title: "patch breakdown · that bass thing", left: "8 min left",  pct: 60, thumb: pickCreatorPic("nyx", "synth-bass-thing") },
  { id: "C2",  creator: findC("atlas"), title: "tactics breakdown · 4-2-3-1",      left: "4 min left",  pct: 78, thumb: pickCreatorPic("atlas", "tactics-chalkboard") },
  { id: "C3",  creator: findC("rivers"), title: "the song we almost cut",            left: "2 min left",  pct: 88, thumb: pickCreatorPic("rivers", "guitar-mic") },
  { id: "C4",  creator: findC("ines"), title: "tre flip · frame breakdown",        left: "5 min left",  pct: 42, thumb: pickCreatorPic("ines", "skate-frame") },
  { id: "C5",  creator: findC("kavi"), title: "tonight's menu, on camera",         left: "22 min left", pct: 24, thumb: pickCreatorPic("kavi", "kitchen-prep") },
  { id: "C6",  creator: findC("demo"), title: "morning show · ep 184",             left: "37 min left", pct: 12, thumb: pickCreatorPic("demo", "morning-show-set") },
  { id: "C7",  creator: findC("rhett"), title: "alpine kit · what i pack",          left: "10 min left", pct: 35, thumb: pickCreatorPic("rhett", "packed-bag") },
  { id: "C8",  creator: findC("kola"), title: "sunset set · cape town",            left: "44 min left", pct: 18, thumb: pickCreatorPic("kola", "dj-sunset") },
];

// CAST WALLET initial
const WALLET = {
  balance: 12480,
  pending:  1750,
  packs: [
    { amount: 500,  fiat: "£5",   badge: "starter" },
    { amount: 1000, fiat: "£10",  badge: "popular" },
    { amount: 2500, fiat: "£25",  badge: "+10%"   },
    { amount: 5000, fiat: "£48",  badge: "best value" },
  ],
};

const HISTORY = [
  { day: "today · sat 27 may", rows: [
    { creator: findC("kavi"),    kind: "tip",          title: "tip during sunday roast",       time: "13:42", amount: -25 },
    { creator: findC("atlas"),   kind: "competition",  title: "match prediction entry",        time: "14:01", amount: -10 },
    { creator: findC("nyx"),     kind: "drop",         title: "field recordings · vol 4",      time: "15:18", amount: -120 },
    { creator: findC("kola"),    kind: "tip",          title: "rooftop tip · vinyl set",        time: "16:02", amount: -50 },
  ]},
  { day: "yesterday · fri 26 may", rows: [
    { creator: findC("nyx"),     kind: "subscription", title: "monthly · @nyxsynth · tier 2",   time: "00:14", amount: -750 },
    { creator: findC("marlowe"), kind: "drop",         title: "small bowl · kiln 048",          time: "21:09", amount: -180 },
    { creator: findC("marlowe"), kind: "tip",          title: "kiln-watch tip",                 time: "20:42", amount: -50 },
  ]},
  { day: "thu 25 may", rows: [
    { creator: null,             kind: "topup",        title: "top-up · pack 5,000",            time: "19:30", amount: +5000, payment: "visa ··4291" },
  ]},
  { day: "wed 24 may", rows: [
    { creator: findC("joon"),    kind: "ppv",          title: "saturday 4h drawing · vod",      time: "10:11", amount: -200 },
    { creator: findC("rivers"),  kind: "tip",          title: "writing-room tip",               time: "21:50", amount: -80 },
  ]},
  { day: "tue 23 may", rows: [
    { creator: findC("atlas"),   kind: "subscription", title: "monthly · @atlasfc · away pass", time: "07:00", amount: -750 },
    { creator: findC("saber"),   kind: "ppv",          title: "valorant finals · live ticket",  time: "20:00", amount: -300 },
  ]},
];

const RENEWALS = [
  { creator: findC("nyx"),     tier: "tier 2 · patch archive", when: "wed 4 jun",  amount: 750 },
  { creator: findC("atlas"),   tier: "away pass",              when: "tue 23 jun", amount: 750 },
  { creator: findC("marlowe"), tier: "studio insider",         when: "mon 17 jun", amount: 900 },
  { creator: findC("halcyon"), tier: "stems access",           when: "thu 6 jun",  amount: 1200 },
];

const FOLLOWED = CREATORS;
const MEMBERSHIPS = [
  { creator: findC("nyx"),     tier: "tier 2 · patch archive", cast: 750, since: "feb 2026" },
  { creator: findC("atlas"),   tier: "away pass",              cast: 750, since: "aug 2025" },
  { creator: findC("marlowe"), tier: "studio insider",         cast: 900, since: "may 2026" },
  { creator: findC("halcyon"), tier: "stems access",           cast: 1200, since: "jan 2026" },
];

// Live page model
const LIVE_PAGE = {
  creator: findC("atlas"), title: "atlas fc vs northgate reserves",
  sub: "non-league cup · matchday 18",
  viewers: 47213,
  startedAt: "live · 1:07:42 in",
  thumb: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1920",
  drop: { name: "atlas '78 retro third kit", price: 1240, edition: "247 / 500", img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800" },
  ppv:  null,
  competition: { name: "predict full-time score", entry: 50, ends: "ends 90'" },
  initialLedger: [
    { who: "@oren",   amount: 25,  kind: "tip"  },
    { who: "@hibah",  amount: 50,  kind: "tip"  },
    { who: "@theo",   amount: 250, kind: "gift", note: "5 subs gifted" },
    { who: "@nia",    amount: 10,  kind: "tip"  },
    { who: "@aaron",  amount: 20,  kind: "tip"  },
    { who: "@quinn",  amount: 100, kind: "tip"  },
  ],
};

// MicroCast (Nyx) page
const NYX_TIERS = [
  { name: "listener",       cast: 250,  perks: ["live chat colour","members-only set notes","early stream alerts"] },
  { name: "patch archive",  cast: 750,  perks: ["everything in listener","downloadable patch sheets","monthly modular q&a","10% off drops"], popular: true },
  { name: "sound design lab", cast: 2200, perks: ["everything in patch archive","stems for every set","1:1 office hour / quarter","credit on releases"] },
];
const NYX_STORE = [
  { id: "n1", kind: "drop",   name: "field recordings · vol 4",   price: 120,  edition: "98 / 200", img: pic("nyx-store-1") },
  { id: "n2", kind: "course", name: "intro to modular routing",   price: 480,  edition: "self-paced", img: pic("nyx-store-2") },
  { id: "n3", kind: "ppv",    name: "summer solstice live · vod", price: 60,   edition: "rentable", img: pic("nyx-store-3") },
  { id: "n4", kind: "merch",  name: "patch-sheet riso poster",    price: 240,  edition: "ships worldwide", img: pic("nyx-store-4") },
  { id: "n5", kind: "drop",   name: "buchla session · 192k flac", price: 360,  edition: "tier 2+", img: pic("nyx-store-5") },
  { id: "n6", kind: "course", name: "modular for beginners",      price: 280,  edition: "12 lessons", img: pic("nyx-store-6") },
  { id: "n7", kind: "drop",   name: "tape loop pack · 22 files",  price: 180,  edition: "wav + sheets", img: pic("nyx-store-7") },
  { id: "n8", kind: "merch",  name: "modular tote · risograph",   price: 200,  edition: "small batch", img: pic("nyx-store-8") },
];
const NYX_LIBRARY = [
  { id: "v1", creator: findC("nyx"), title: "night session #12 · full set",   ago: "12h",  dur: "2h 03m", thumb: pickCreatorPic("nyx", "nyx-lib-1") },
  { id: "v2", creator: findC("nyx"), title: "patch breakdown · the bass thing", ago: "3d",  dur: "28 min", thumb: pickCreatorPic("nyx", "nyx-lib-2") },
  { id: "v3", creator: findC("nyx"), title: "solstice live · recording",       ago: "1w",   dur: "1h 48m", thumb: pickCreatorPic("nyx", "nyx-lib-3") },
  { id: "v4", creator: findC("nyx"), title: "coffee patch · sunday slow",      ago: "2w",   dur: "52 min", thumb: pickCreatorPic("nyx", "nyx-lib-4") },
  { id: "v5", creator: findC("nyx"), title: "ambient improv · 4am",            ago: "3w",   dur: "1h 06m", thumb: pickCreatorPic("nyx", "nyx-lib-5") },
  { id: "v6", creator: findC("nyx"), title: "studio tour · 2026",              ago: "1mo",  dur: "12 min", thumb: pickCreatorPic("nyx", "nyx-lib-6") },
];

// ---------- v3 additions ----------

const NOTIFICATIONS = [
  { group: "live starting", items: [
    { id: "n1", creator: findC("marlowe"), text: "kiln opening · 24 pieces", time: "14 min", unread: true },
    { id: "n2", creator: findC("joon"),    text: "saturday 4-hour drawing",  time: "32 min", unread: true },
    { id: "n3", creator: findC("ines"),    text: "berlin street league · finals", time: "1h 18m", unread: false },
  ]},
  { group: "new drops", items: [
    { id: "n4", creator: findC("marlowe"), text: "kiln drop 048 · small bowl · 62 / 150 left", time: "1h", unread: true },
    { id: "n5", creator: findC("kavi"),    text: "house apron · ships worldwide", time: "3h", unread: false },
  ]},
  { group: "renewals coming up", items: [
    { id: "n6", creator: findC("nyx"),     text: "tier 2 renews wed 4 jun · 750 CAST", time: "in 8 days", unread: false },
    { id: "n7", creator: findC("atlas"),   text: "away pass renews tue 23 jun · 750 CAST", time: "in 27 days", unread: false },
  ]},
  { group: "member perks", items: [
    { id: "n8", creator: findC("halcyon"), text: "your stems pack is ready · glass tide", time: "yesterday", unread: true },
    { id: "n9", creator: findC("nyx"),     text: "members q&a tomorrow 19:00 · rsvp open", time: "2 days", unread: false },
  ]},
];

// MetaCast: Small Rooms — operator-branded destination
const SMALLROOMS = {
  id: "smallrooms",
  name: "Small Rooms",
  tag: "touring artists. intimate venues. no labels.",
  brand:  "#581c87",     // deep purple primary
  brand2: "#a855f7",
  accent: "#facc15",
  operator: {
    name: "Small Rooms Collective",
    founded: "berlin · est. 2023",
    venues: 86,
    bio: "small rooms run a network of 50–200 cap venues across 18 cities. every show on the network streams live; every recording stays with the artist. metascape hosts our microcasts, we host the room.",
    site: "smallrooms.fm",
  },
  hero: { img: pic("smallrooms-hero-purple"), eyebrow: "metacast · operator destination", headline: "tonight: ten rooms, one feed.", sub: "live across berlin, lisbon, glasgow, mexico city" },
  microcasts: ["nyx","rivers","kola","halcyon","yara"],
  liveNow: [
    { id: "SR1", creator: findC("nyx"), title: "berlin · säälchen · night session #13", viewers: 892,   thumb: pickCreatorPic("nyx", "sr-nyx-live") },
    { id: "SR2", creator: findC("halcyon"), title: "lisbon · zé dos bois · ambient",          viewers: 2280,  thumb: pickCreatorPic("halcyon", "sr-halcyon-live") },
    { id: "SR3", creator: findC("kola"), title: "mexico city · foro indie · vinyl set",    viewers: 5310,  thumb: pickCreatorPic("kola", "sr-kola-live") },
    { id: "SR4", creator: findC("rivers"), title: "glasgow · hug & pint · open writing",     viewers: 318,   thumb: pickCreatorPic("rivers", "sr-rivers-live") },
  ],
  upcoming: [
    { id: "SR5", creator: findC("yara"), title: "writing room · live with audience q&a",  in: "tomorrow 19:00", thumb: pickCreatorPic("yara", "sr-yara-up") },
    { id: "SR6", creator: findC("halcyon"), title: "release listening · glass tide",          in: "mon 21:00",      thumb: pickCreatorPic("halcyon", "sr-halcyon-up") },
    { id: "SR7", creator: findC("kola"), title: "rooftop · vinyl only",                    in: "sat 22:00",      thumb: pickCreatorPic("kola", "sr-kola-up") },
  ],
};

const RECEIPT_DEFAULTS = {
  pm: "visa ··4291",
  fxLine: (cast) => `£${(cast / 100).toFixed(2)} → ${cast} CAST · rate 1:100`,
};

Object.assign(window, {
  CREATORS, METACASTS, CATEGORIES, HERO, LIVE, SOON, FOLLOWED_LATEST, FEATURED_MICROS,
  DROPS, CONTINUE, WALLET, HISTORY, RENEWALS, FOLLOWED, MEMBERSHIPS,
  LIVE_PAGE, NYX_TIERS, NYX_STORE, NYX_LIBRARY, pic,
  NOTIFICATIONS, SMALLROOMS, RECEIPT_DEFAULTS, findC
});

})();
