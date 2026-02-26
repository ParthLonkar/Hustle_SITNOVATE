import { useState, useEffect, createContext, useContext } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const mockRecommendation = {
  best_mandi: "Nagpur APMC",
  harvest_window: "Harvest in 3–5 days",
  predicted_price: 2400,
  spoilage_risk: 0.23,
  net_profit: 18500,
  explanation:
    "High humidity forecast on Day 3–4 increases spoilage risk. Recommend harvesting before Day 3 and transporting to Nagpur APMC for the best net return after transport costs.",
  weather: [
    { day: "Mon", temp: 31, rain: 10, humidity: 62 },
    { day: "Tue", temp: 33, rain: 0,  humidity: 58 },
    { day: "Wed", temp: 29, rain: 40, humidity: 78 },
    { day: "Thu", temp: 27, rain: 70, humidity: 85 },
    { day: "Fri", temp: 30, rain: 20, humidity: 70 },
    { day: "Sat", temp: 32, rain: 5,  humidity: 60 },
    { day: "Sun", temp: 34, rain: 0,  humidity: 55 },
  ],
};

const mockMandis = [
  { name: "Nagpur APMC",    price: 2400, distance: 45, transport: 1200, profit: 18500, trend: "+4%" },
  { name: "Wardha Mandi",   price: 2200, distance: 30, transport: 800,  profit: 16800, trend: "-1%" },
  { name: "Amravati Mandi", price: 2600, distance: 90, transport: 2400, profit: 17200, trend: "+7%" },
  { name: "Yavatmal Mandi", price: 2100, distance: 110,transport: 2900, profit: 14800, trend: "-3%" },
];

const crops = ["Tomato", "Onion", "Wheat", "Cotton", "Soybean", "Orange", "Pomegranate"];
const regions = ["Nagpur", "Wardha", "Amravati", "Yavatmal", "Akola", "Buldana"];

// ─── AUTH CONTEXT ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = (email, role = "farmer") => setUser({ email, role, name: email.split("@")[0] });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --soil:    #1a1208;
    --earth:   #2d1f0a;
    --bark:    #4a3218;
    --leaf:    #3d7a2e;
    --sprout:  #5aad45;
    --lime:    #a8e063;
    --sun:     #f5c842;
    --mist:    #e8f4e0;
    --fog:     #f2f8ec;
    --cream:   #fdfaf3;
    --red:     #d94f3d;
    --orange:  #e8873a;
    --text:    #1a1208;
    --textMid: #5c4a2a;
    --textFaint:#9c8b6e;
    --card:    #ffffff;
    --border:  #d8e8cc;
    --shadow:  0 2px 16px rgba(26,18,8,0.08);
    --shadowLg:0 8px 40px rgba(26,18,8,0.14);
  }

  html, body, #root { height: 100%; font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text); }

  /* ── LANDING ── */
  .landing { min-height: 100vh; background: var(--soil); color: var(--cream); position: relative; overflow: hidden; }
  .land-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 60% 20%, #2d4a1e 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 10% 80%, #1e3a12 0%, transparent 50%); pointer-events: none; }
  .land-grain { position: absolute; inset: 0; opacity: .035; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px; pointer-events: none; }

  .land-nav { position: relative; z-index: 10; display: flex; align-items: center; justify-content: space-between; padding: 28px 60px; }
  .logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -0.5px; color: var(--lime); display: flex; align-items: center; gap: 8px; }
  .logo-icon { width: 32px; height: 32px; background: var(--sprout); border-radius: 8px; display: grid; place-items: center; font-size: 16px; }
  .nav-btns { display: flex; gap: 12px; }
  .btn-ghost { background: transparent; border: 1.5px solid rgba(168,224,99,0.3); color: var(--lime); padding: 9px 22px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; cursor: pointer; transition: all .2s; }
  .btn-ghost:hover { background: rgba(168,224,99,.08); border-color: var(--lime); }
  .btn-solid { background: var(--lime); border: none; color: var(--soil); padding: 10px 24px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; }
  .btn-solid:hover { background: #c5f07a; transform: translateY(-1px); }

  .land-hero { position: relative; z-index: 5; padding: 80px 60px 60px; max-width: 720px; }
  .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(90,173,69,.15); border: 1px solid rgba(90,173,69,.3); color: var(--sprout); padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 500; margin-bottom: 28px; letter-spacing: .5px; text-transform: uppercase; }
  .hero-dot { width: 6px; height: 6px; background: var(--sprout); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  .hero-h1 { font-family: 'Syne', sans-serif; font-weight: 800; font-size: clamp(42px, 6vw, 72px); line-height: 1.0; letter-spacing: -2px; margin-bottom: 24px; }
  .hero-h1 span { color: var(--lime); }
  .hero-sub { font-size: 17px; color: rgba(253,250,243,.65); line-height: 1.7; max-width: 520px; margin-bottom: 44px; font-weight: 300; }
  .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
  .btn-primary { background: var(--lime); color: var(--soil); border: none; padding: 14px 32px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer; transition: all .25s; box-shadow: 0 0 30px rgba(168,224,99,.25); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 6px 36px rgba(168,224,99,.35); }
  .btn-outline { background: transparent; color: var(--cream); border: 1.5px solid rgba(253,250,243,.25); padding: 14px 32px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 500; cursor: pointer; transition: all .25s; }
  .btn-outline:hover { border-color: rgba(253,250,243,.5); background: rgba(253,250,243,.05); }

  .land-stats { position: relative; z-index: 5; display: flex; gap: 48px; padding: 0 60px 60px; }
  .stat { }
  .stat-num { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; color: var(--lime); }
  .stat-lbl { font-size: 13px; color: rgba(253,250,243,.5); margin-top: 2px; }

  .land-features { position: relative; z-index: 5; background: rgba(255,255,255,.04); border-top: 1px solid rgba(255,255,255,.06); padding: 64px 60px; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; }
  .feat { }
  .feat-icon { font-size: 28px; margin-bottom: 14px; }
  .feat-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; color: var(--cream); margin-bottom: 8px; }
  .feat-desc { font-size: 14px; color: rgba(253,250,243,.5); line-height: 1.6; }

  /* ── AUTH PAGES ── */
  .auth-wrap { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
  .auth-left { background: var(--soil); display: flex; flex-direction: column; justify-content: center; padding: 60px; position: relative; overflow: hidden; }
  .auth-left::before { content: ''; position: absolute; top: -100px; right: -100px; width: 400px; height: 400px; background: radial-gradient(circle, rgba(90,173,69,.15), transparent 70%); }
  .auth-left-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 24px; color: var(--lime); margin-bottom: 60px; display: flex; align-items: center; gap: 10px; }
  .auth-left h2 { font-family: 'Syne', sans-serif; font-size: 36px; font-weight: 800; color: var(--cream); line-height: 1.2; margin-bottom: 16px; }
  .auth-left p { color: rgba(253,250,243,.55); font-size: 15px; line-height: 1.7; }
  .auth-right { background: var(--fog); display: flex; align-items: center; justify-content: center; padding: 40px; }
  .auth-card { background: white; border-radius: 20px; padding: 44px 40px; width: 100%; max-width: 420px; box-shadow: var(--shadowLg); }
  .auth-card h3 { font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 700; margin-bottom: 6px; }
  .auth-card p { color: var(--textFaint); font-size: 14px; margin-bottom: 32px; }
  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 13px; font-weight: 500; color: var(--textMid); margin-bottom: 7px; }
  .field input, .field select { width: 100%; padding: 11px 14px; border: 1.5px solid var(--border); border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 14px; color: var(--text); background: var(--fog); transition: border .2s; outline: none; }
  .field input:focus, .field select:focus { border-color: var(--sprout); background: white; }
  .btn-submit { width: 100%; background: var(--leaf); color: white; border: none; padding: 13px; border-radius: 10px; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 600; cursor: pointer; transition: all .2s; margin-top: 8px; }
  .btn-submit:hover { background: var(--sprout); transform: translateY(-1px); }
  .auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--textFaint); }
  .auth-switch span { color: var(--leaf); cursor: pointer; font-weight: 500; }
  .auth-switch span:hover { text-decoration: underline; }

  /* ── APP SHELL ── */
  .app-shell { display: grid; grid-template-rows: 64px 1fr; min-height: 100vh; background: var(--fog); }
  .topbar { background: white; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 32px; position: sticky; top: 0; z-index: 100; }
  .topbar-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; color: var(--leaf); display: flex; align-items: center; gap: 8px; }
  .topbar-logo-icon { width: 28px; height: 28px; background: var(--sprout); border-radius: 7px; display: grid; place-items: center; font-size: 14px; }
  .topbar-right { display: flex; align-items: center; gap: 16px; }
  .user-chip { display: flex; align-items: center; gap: 8px; background: var(--fog); border: 1px solid var(--border); padding: 6px 14px 6px 6px; border-radius: 100px; font-size: 13px; font-weight: 500; }
  .user-avatar { width: 28px; height: 28px; background: var(--leaf); border-radius: 50%; display: grid; place-items: center; color: white; font-size: 12px; font-weight: 700; }
  .btn-logout { background: transparent; border: 1.5px solid var(--border); color: var(--textMid); padding: 7px 16px; border-radius: 8px; font-size: 13px; cursor: pointer; transition: all .2s; font-family: 'DM Sans', sans-serif; }
  .btn-logout:hover { border-color: var(--red); color: var(--red); }

  /* ── FARMER HOME ── */
  .farmer-home { padding: 32px; max-width: 1200px; margin: 0 auto; }
  .page-greet { margin-bottom: 28px; }
  .page-greet h2 { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 700; }
  .page-greet p { color: var(--textFaint); font-size: 14px; margin-top: 4px; }

  .input-card { background: white; border-radius: 16px; padding: 28px 32px; box-shadow: var(--shadow); border: 1px solid var(--border); margin-bottom: 28px; }
  .input-card h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
  .input-grid { display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px; align-items: end; }
  .btn-analyze { background: var(--leaf); color: white; border: none; padding: 11px 28px; border-radius: 9px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all .2s; height: 44px; }
  .btn-analyze:hover { background: var(--sprout); transform: translateY(-1px); }
  .btn-analyze:disabled { background: var(--border); cursor: not-allowed; transform: none; color: var(--textFaint); }

  .results-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 20px; }
  .rec-card { background: white; border-radius: 16px; padding: 28px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .rec-card h3 { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 20px; color: var(--textMid); text-transform: uppercase; letter-spacing: .5px; font-size: 11px; }

  .rec-headline { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px; }
  .rec-mandi-icon { width: 52px; height: 52px; background: linear-gradient(135deg, var(--sprout), var(--leaf)); border-radius: 14px; display: grid; place-items: center; font-size: 24px; flex-shrink: 0; }
  .rec-mandi-name { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; }
  .rec-mandi-sub { color: var(--textFaint); font-size: 13px; margin-top: 3px; }

  .rec-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .metric { background: var(--fog); border-radius: 12px; padding: 14px; }
  .metric-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: var(--leaf); }
  .metric-lbl { font-size: 11px; color: var(--textFaint); margin-top: 3px; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; }

  .ai-explain { background: linear-gradient(135deg, #eef7e8, #f5faf0); border: 1px solid #c8e8b8; border-radius: 12px; padding: 16px; }
  .ai-explain-tag { display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--leaf); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
  .ai-explain p { font-size: 13px; color: var(--textMid); line-height: 1.7; }

  .spoilage-card { background: white; border-radius: 16px; padding: 28px; box-shadow: var(--shadow); border: 1px solid var(--border); display: flex; flex-direction: column; }
  .risk-ring { position: relative; width: 130px; height: 130px; margin: 0 auto 20px; }
  .risk-ring svg { transform: rotate(-90deg); }
  .risk-ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .risk-pct { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; color: var(--orange); }
  .risk-lbl { font-size: 10px; color: var(--textFaint); font-weight: 600; text-transform: uppercase; }
  .risk-badge { text-align: center; background: #fff4ec; border: 1px solid #f5cba0; border-radius: 100px; padding: 5px 16px; font-size: 12px; font-weight: 600; color: var(--orange); margin-bottom: 16px; display: inline-block; align-self: center; }
  .risk-tips { flex: 1; }
  .risk-tip { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--textMid); margin-bottom: 10px; line-height: 1.5; }
  .tip-dot { width: 6px; height: 6px; background: var(--sprout); border-radius: 50%; margin-top: 6px; flex-shrink: 0; }

  .weather-strip { background: white; border-radius: 16px; padding: 24px 28px; box-shadow: var(--shadow); border: 1px solid var(--border); margin-bottom: 20px; }
  .weather-strip h3 { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: var(--textMid); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 18px; }
  .weather-days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
  .wday { background: var(--fog); border-radius: 10px; padding: 12px 8px; text-align: center; border: 1px solid transparent; transition: all .2s; }
  .wday.warn { background: #fff4ec; border-color: #f5cba0; }
  .wday-name { font-size: 11px; font-weight: 600; color: var(--textFaint); margin-bottom: 6px; text-transform: uppercase; }
  .wday-icon { font-size: 20px; margin-bottom: 6px; }
  .wday-temp { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
  .wday-rain { font-size: 10px; color: #5b9ad4; margin-top: 3px; font-weight: 500; }
  .wday-hum { font-size: 10px; color: var(--textFaint); margin-top: 1px; }

  .mandi-table-card { background: white; border-radius: 16px; padding: 28px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .mandi-table-card h3 { font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700; color: var(--textMid); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; }
  thead th { font-size: 11px; font-weight: 600; color: var(--textFaint); text-transform: uppercase; letter-spacing: .4px; padding: 0 12px 12px; text-align: left; border-bottom: 1px solid var(--border); }
  tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: var(--fog); }
  tbody td { padding: 14px 12px; font-size: 14px; }
  .best-row { background: #f0faeb !important; }
  .best-row td:first-child::before { content: '★ '; color: var(--sprout); }
  .trend-pos { color: var(--sprout); font-weight: 600; font-size: 12px; }
  .trend-neg { color: var(--red); font-weight: 600; font-size: 12px; }
  .profit-val { font-family: 'Syne', sans-serif; font-weight: 700; color: var(--leaf); }

  /* ── ADMIN DASHBOARD ── */
  .admin-dash { padding: 32px; max-width: 1200px; margin: 0 auto; }
  .admin-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .astat { background: white; border-radius: 14px; padding: 22px 24px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .astat-val { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; margin-bottom: 4px; }
  .astat-lbl { font-size: 12px; color: var(--textFaint); font-weight: 500; }
  .astat-change { font-size: 12px; font-weight: 600; margin-top: 6px; }
  .up { color: var(--sprout); }
  .down { color: var(--red); }
  .admin-table-card { background: white; border-radius: 16px; padding: 28px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .admin-table-card h3 { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; margin-bottom: 20px; }

  /* ── EMPTY / LOADING ── */
  .empty-state { text-align: center; padding: 60px 20px; color: var(--textFaint); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: .5; }
  .empty-state p { font-size: 15px; }
  .loading-dots { display: inline-flex; gap: 6px; }
  .loading-dots span { width: 8px; height: 8px; background: var(--sprout); border-radius: 50%; animation: bounce 1.2s infinite; }
  .loading-dots span:nth-child(2) { animation-delay: .2s; }
  .loading-dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
  .loading-card { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 16px; }
  .loading-card p { color: var(--textFaint); font-size: 14px; }

  /* ── NAV TABS ── */
  .nav-tabs { display: flex; gap: 4px; background: var(--fog); border: 1px solid var(--border); border-radius: 10px; padding: 4px; }
  .nav-tab { padding: 8px 18px; border-radius: 7px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: var(--textMid); transition: all .2s; font-family: 'DM Sans', sans-serif; }
  .nav-tab.active { background: white; color: var(--leaf); font-weight: 600; box-shadow: 0 1px 6px rgba(0,0,0,.08); }

  @media (max-width: 768px) {
    .auth-left { display: none; }
    .auth-wrap { grid-template-columns: 1fr; }
    .land-nav { padding: 20px 24px; }
    .land-hero { padding: 48px 24px 40px; }
    .land-stats { padding: 0 24px 40px; gap: 28px; }
    .land-features { padding: 40px 24px; }
    .results-grid { grid-template-columns: 1fr; }
    .input-grid { grid-template-columns: 1fr 1fr; }
    .farmer-home, .admin-dash { padding: 20px 16px; }
    .admin-stats { grid-template-columns: repeat(2,1fr); }
    .weather-days { grid-template-columns: repeat(4,1fr); }
    .rec-metrics { grid-template-columns: repeat(2,1fr); }
  }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function Topbar({ onNav, tab }) {
  const { user, logout } = useAuth();
  return (
    <div className="topbar">
      <div className="topbar-logo">
        <div className="topbar-logo-icon">🌾</div>
        AGRiCHAIN
      </div>
      <div className="nav-tabs">
        <button className={`nav-tab ${tab === "home" ? "active" : ""}`} onClick={() => onNav("home")}>
          {user?.role === "admin" ? "Dashboard" : "My Farm"}
        </button>
        {user?.role === "admin" && (
          <button className={`nav-tab ${tab === "farmer" ? "active" : ""}`} onClick={() => onNav("farmer")}>
            Farmer View
          </button>
        )}
      </div>
      <div className="topbar-right">
        <div className="user-chip">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          {user?.name} · {user?.role}
        </div>
        <button className="btn-logout" onClick={logout}>Sign out</button>
      </div>
    </div>
  );
}

function WeatherStrip({ weather }) {
  const getIcon = (rain, hum) => {
    if (rain > 50) return "🌧️";
    if (rain > 20) return "🌦️";
    if (hum > 75) return "🌫️";
    return "☀️";
  };
  return (
    <div className="weather-strip">
      <h3>📡 7-Day Weather Forecast</h3>
      <div className="weather-days">
        {weather.map((d, i) => (
          <div key={i} className={`wday ${d.humidity > 78 ? "warn" : ""}`}>
            <div className="wday-name">{d.day}</div>
            <div className="wday-icon">{getIcon(d.rain, d.humidity)}</div>
            <div className="wday-temp">{d.temp}°C</div>
            <div className="wday-rain">💧{d.rain}%</div>
            <div className="wday-hum">{d.humidity}% hum</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpoilageRing({ risk }) {
  const pct = Math.round(risk * 100);
  const r = 54, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct < 30 ? "#5aad45" : pct < 60 ? "#e8873a" : "#d94f3d";
  const label = pct < 30 ? "Low Risk" : pct < 60 ? "Moderate Risk" : "High Risk";
  return (
    <div className="spoilage-card">
      <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 11, fontWeight: 700, color: "var(--textMid)", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 16 }}>
        🧪 Spoilage Risk Estimator
      </h3>
      <div className="risk-ring">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="risk-ring-center">
          <div className="risk-pct" style={{ color }}>{pct}%</div>
          <div className="risk-lbl">risk</div>
        </div>
      </div>
      <div className="risk-badge" style={pct < 30 ? { background: "#eef7e8", borderColor: "#c8e8b8", color: "var(--leaf)" } : {}}>{label}</div>
      <div className="risk-tips">
        <div className="risk-tip"><div className="tip-dot" /> Harvest before predicted rainfall on Day 3–4</div>
        <div className="risk-tip"><div className="tip-dot" /> Use cool dry storage at 10–15°C</div>
        <div className="risk-tip"><div className="tip-dot" style={{ background: "var(--orange)" }} /> Transport within 48 hrs of harvest</div>
      </div>
    </div>
  );
}

function MandiTable({ mandis }) {
  return (
    <div className="mandi-table-card">
      <h3>🏪 Mandi Price Comparison</h3>
      <table>
        <thead>
          <tr>
            <th>Market</th>
            <th>Predicted Price</th>
            <th>Distance</th>
            <th>Transport Cost</th>
            <th>Net Profit</th>
            <th>7-Day Trend</th>
          </tr>
        </thead>
        <tbody>
          {mandis
            .sort((a, b) => b.profit - a.profit)
            .map((m, i) => (
              <tr key={i} className={i === 0 ? "best-row" : ""}>
                <td style={{ fontWeight: 600 }}>{m.name}</td>
                <td>₹{m.price.toLocaleString()}/q</td>
                <td>{m.distance} km</td>
                <td>₹{m.transport.toLocaleString()}</td>
                <td className="profit-val">₹{m.profit.toLocaleString()}</td>
                <td className={m.trend.startsWith("+") ? "trend-pos" : "trend-neg"}>{m.trend}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PAGES ────────────────────────────────────────────────────────────────────

function Landing({ onLogin, onRegister }) {
  return (
    <div className="landing">
      <div className="land-bg" />
      <div className="land-grain" />
      <nav className="land-nav">
        <div className="logo"><div className="logo-icon">🌾</div>AGRiCHAIN</div>
        <div className="nav-btns">
          <button className="btn-ghost" onClick={onLogin}>Sign In</button>
          <button className="btn-solid" onClick={onRegister}>Get Started</button>
        </div>
      </nav>
      <div className="land-hero">
        <div className="hero-tag"><div className="hero-dot" />AI-Powered Farm Intelligence</div>
        <h1 className="hero-h1">Grow smarter.<br /><span>Sell better.</span><br />Earn more.</h1>
        <p className="hero-sub">
          AGRiCHAIN combines weather forecasting, real-time mandi prices, and machine learning to
          tell you exactly when to harvest and where to sell — maximizing your profit every season.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={onRegister}>Start for free →</button>
          <button className="btn-outline" onClick={onLogin}>Farmer login</button>
        </div>
      </div>
      <div className="land-stats">
        <div className="stat"><div className="stat-num">₹18K+</div><div className="stat-lbl">Avg. profit increase/season</div></div>
        <div className="stat"><div className="stat-num">240+</div><div className="stat-lbl">Mandis tracked live</div></div>
        <div className="stat"><div className="stat-num">92%</div><div className="stat-lbl">Price forecast accuracy</div></div>
        <div className="stat"><div className="stat-num">12K+</div><div className="stat-lbl">Farmers onboarded</div></div>
      </div>
      <div className="land-features">
        {[
          { icon: "🌦️", title: "7-Day Weather Intelligence", desc: "Real-time forecast analysis to predict spoilage risk and optimal harvest windows." },
          { icon: "📈", title: "Mandi Price Prediction", desc: "ML models trained on historical data to forecast prices 7 days ahead across all mandis." },
          { icon: "🚛", title: "Transport Cost Engine", desc: "Net profit after transport — compare every nearby mandi on a single screen." },
          { icon: "🤖", title: "Explainable AI", desc: "SHAP-powered explanations so you understand exactly why each recommendation is made." },
        ].map((f, i) => (
          <div className="feat" key={i}>
            <div className="feat-icon">{f.icon}</div>
            <div className="feat-title">{f.title}</div>
            <div className="feat-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Login({ onSuccess, onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("farmer@test.com");
  const [pass, setPass] = useState("password");
  const [role, setRole] = useState("farmer");

  const handleSubmit = () => {
    login(email, role);
    onSuccess(role);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🌾 AGRiCHAIN</div>
        <h2>Welcome back, farmer.</h2>
        <p>Your personalized harvest and market intelligence is waiting. Log in to see today's recommendations.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h3>Sign in</h3>
          <p>Enter your credentials to continue</p>
          <div className="field"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          <div className="field"><label>Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" /></div>
          <div className="field">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="farmer">Farmer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button className="btn-submit" onClick={handleSubmit}>Sign In →</button>
          <div className="auth-switch">Don't have an account? <span onClick={onSwitch}>Register here</span></div>
        </div>
      </div>
    </div>
  );
}

function Register({ onSuccess, onSwitch }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", region: regions[0], role: "farmer", pass: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    login(form.email || "farmer@test.com", form.role);
    onSuccess(form.role);
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">🌾 AGRiCHAIN</div>
        <h2>Join 12,000+ farmers already earning more.</h2>
        <p>Create your account and get AI-powered market intelligence tailored to your region and crops.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h3>Create account</h3>
          <p>Get started in under a minute</p>
          <div className="field"><label>Full Name</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ramesh Patil" /></div>
          <div className="field"><label>Email</label><input value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" /></div>
          <div className="field"><label>Region</label><select value={form.region} onChange={e => set("region", e.target.value)}>{regions.map(r => <option key={r}>{r}</option>)}</select></div>
          <div className="field"><label>Role</label><select value={form.role} onChange={e => set("role", e.target.value)}><option value="farmer">Farmer</option><option value="admin">Admin</option></select></div>
          <div className="field"><label>Password</label><input type="password" value={form.pass} onChange={e => set("pass", e.target.value)} placeholder="Create a password" /></div>
          <button className="btn-submit" onClick={handleSubmit}>Create Account →</button>
          <div className="auth-switch">Already have an account? <span onClick={onSwitch}>Sign in</span></div>
        </div>
      </div>
    </div>
  );
}

function FarmerHome() {
  const { user } = useAuth();
  const [crop, setCrop] = useState(crops[0]);
  const [region, setRegion] = useState(regions[0]);
  const [qty, setQty] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult(mockRecommendation);
    }, 1800);
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="farmer-home">
      <div className="page-greet">
        <h2>{greet}, {user?.name} 👋</h2>
        <p>Enter your crop details below to get today's harvest & market recommendation.</p>
      </div>

      <div className="input-card">
        <h3>🌱 Crop Analysis Input</h3>
        <div className="input-grid">
          <div className="field" style={{ margin: 0 }}>
            <label>Crop</label>
            <select value={crop} onChange={e => setCrop(e.target.value)}>{crops.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)}>{regions.map(r => <option key={r}>{r}</option>)}</select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Quantity (quintals)</label>
            <input value={qty} onChange={e => setQty(e.target.value)} placeholder="100" type="number" />
          </div>
          <button className="btn-analyze" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing…" : "Get Recommendation →"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="rec-card loading-card">
          <div className="loading-dots"><span /><span /><span /></div>
          <p>Running AI models — price forecasting, spoilage estimation, route optimization…</p>
        </div>
      )}

      {!loading && !result && (
        <div className="rec-card">
          <div className="empty-state">
            <div className="empty-icon">🌾</div>
            <p>Select your crop, region, and quantity above and click <strong>Get Recommendation</strong></p>
          </div>
        </div>
      )}

      {result && (
        <>
          <div className="results-grid">
            <div className="rec-card">
              <h3>✅ AI Recommendation</h3>
              <div className="rec-headline">
                <div className="rec-mandi-icon">🏪</div>
                <div>
                  <div className="rec-mandi-name">{result.best_mandi}</div>
                  <div className="rec-mandi-sub">{result.harvest_window} · Best net return</div>
                </div>
              </div>
              <div className="rec-metrics">
                <div className="metric">
                  <div className="metric-val">₹{result.predicted_price.toLocaleString()}</div>
                  <div className="metric-lbl">Predicted Price/q</div>
                </div>
                <div className="metric">
                  <div className="metric-val">₹{result.net_profit.toLocaleString()}</div>
                  <div className="metric-lbl">Est. Net Profit</div>
                </div>
                <div className="metric">
                  <div className="metric-val">{Math.round(result.spoilage_risk * 100)}%</div>
                  <div className="metric-lbl">Spoilage Risk</div>
                </div>
              </div>
              <div className="ai-explain">
                <div className="ai-explain-tag">🤖 AI Explanation (SHAP)</div>
                <p>{result.explanation}</p>
              </div>
            </div>
            <SpoilageRing risk={result.spoilage_risk} />
          </div>

          <WeatherStrip weather={result.weather} />
          <MandiTable mandis={mockMandis} />
        </>
      )}
    </div>
  );
}

function AdminDashboard() {
  const recentRecs = [
    { farmer: "Ramesh Patil", crop: "Tomato", region: "Nagpur", mandi: "Nagpur APMC", profit: 18500, date: "Today 9:12 AM", risk: "23%" },
    { farmer: "Sunita Devi",  crop: "Onion",  region: "Wardha", mandi: "Wardha Mandi", profit: 14200, date: "Today 8:45 AM", risk: "41%" },
    { farmer: "Vikas Jadhav", crop: "Cotton", region: "Amravati", mandi: "Amravati Mandi", profit: 31000, date: "Yesterday", risk: "18%" },
    { farmer: "Meena Rao",    crop: "Soybean",region: "Yavatmal", mandi: "Nagpur APMC", profit: 22400, date: "Yesterday", risk: "12%" },
    { farmer: "Anil Kumar",   crop: "Orange", region: "Nagpur", mandi: "Amravati Mandi", profit: 29800, date: "2 days ago", risk: "35%" },
  ];

  return (
    <div className="admin-dash">
      <div className="page-greet"><h2>Admin Dashboard 🛠️</h2><p>System overview and recent recommendation activity.</p></div>
      <div className="admin-stats">
        {[
          { val: "12,482", lbl: "Total Farmers", change: "+124 this week", up: true },
          { val: "94,310", lbl: "Recommendations Served", change: "+1,240 today", up: true },
          { val: "92.4%", lbl: "Price Forecast Accuracy", change: "-0.3% vs last week", up: false },
          { val: "₹2.1Cr", lbl: "Farmer Profit Generated", change: "+₹18L this month", up: true },
        ].map((s, i) => (
          <div className="astat" key={i}>
            <div className="astat-val">{s.val}</div>
            <div className="astat-lbl">{s.lbl}</div>
            <div className={`astat-change ${s.up ? "up" : "down"}`}>{s.up ? "↑" : "↓"} {s.change}</div>
          </div>
        ))}
      </div>
      <div className="admin-table-card">
        <h3>Recent Recommendations</h3>
        <table>
          <thead><tr><th>Farmer</th><th>Crop</th><th>Region</th><th>Recommended Mandi</th><th>Est. Net Profit</th><th>Spoilage Risk</th><th>Time</th></tr></thead>
          <tbody>
            {recentRecs.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{r.farmer}</td>
                <td>{r.crop}</td>
                <td>{r.region}</td>
                <td>{r.mandi}</td>
                <td className="profit-val">₹{r.profit.toLocaleString()}</td>
                <td>{r.risk}</td>
                <td style={{ color: "var(--textFaint)", fontSize: 13 }}>{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

function App()  {
  const [page, setPage] = useState("landing"); // landing | login | register | app
  const [tab, setTab] = useState("home");
  const { user } = useAuth();

  // sync logged-out state
  useEffect(() => {
    if (!user && page === "app") {
      const timer = setTimeout(() => setPage("landing"), 0);
      return () => clearTimeout(timer);
    }
  }, [user, page]);

  if (page === "landing") return <Landing onLogin={() => setPage("login")} onRegister={() => setPage("register")} />;
  if (page === "login")   return <Login onSuccess={() => { setTab("home"); setPage("app"); }} onSwitch={() => setPage("register")} />;
  if (page === "register") return <Register onSuccess={() => { setTab("home"); setPage("app"); }} onSwitch={() => setPage("login")} />;

  return (
    <div className="app-shell">
      <Topbar onNav={setTab} tab={tab} />
      {tab === "home" && user?.role === "admin" && <AdminDashboard />}
      {tab === "home" && user?.role !== "admin" && <FarmerHome />}
      {tab === "farmer" && <FarmerHome />}
    </div>
  );
}

// Wrap with provider
function Root() {
  return <AuthProvider><App /></AuthProvider>;
}

// inject styles
const styleEl = document.createElement("style");
styleEl.textContent = style;
document.head.appendChild(styleEl);

export { Root as default };