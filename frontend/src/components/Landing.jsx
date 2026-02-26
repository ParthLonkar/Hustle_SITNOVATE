import { useEffect, useState, useContext } from "react";
import { apiGet } from "../services/api";
import { LanguageContext } from "../context/LanguageContext";
import logo from "../assets/AgriRakshak.png";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const TICKER = [
  "7-Day Weather Forecast", "Real-Time Mandi Prices", "ML Harvest Timing", 
  "Transport Cost Analysis", "Explainable AI Insights", "Spoilage Risk Alerts", 
  "Multi-Mandi Comparison", "Seasonal Profit Reports"
];

const FEATURES = [
  { badge: "01", title: "7-Day Weather Intelligence", desc: "Real-time meteorological analysis predicts spoilage risk windows and identifies optimal harvest days." },
  { badge: "02", title: "Mandi Price Prediction", desc: "Machine learning models trained on historical APMC data forecast prices 7 days ahead." },
  { badge: "03", title: "Transport Cost Engine", desc: "Factor in fuel, distance, and logistics to reveal true net profit at each market." },
  { badge: "04", title: "Explainable AI Decisions", desc: "Every recommendation comes with a plain-language explanation." },
];

const STEPS = [
  { num: "1", title: "Connect Your Farm", desc: "Enter your location and the crops you grow." },
  { num: "2", title: "Get AI Recommendations", desc: "Our models analyse weather forecasts and mandi prices." },
  { num: "3", title: "Sell at the Right Price", desc: "Choose optimal window and maximise profit every season." },
];

const GOV_LINKS = [
  { label: "Agmarknet", url: "https://agmarknet.gov.in" },
  { label: "eNAM Portal", url: "https://www.enam.gov.in" },
  { label: "PM-KISAN", url: "https://pmkisan.gov.in" },
  { label: "PMFBY", url: "https://pmfby.gov.in" },
  { label: "DACFW", url: "https://agricoop.gov.in" },
];

/* ─── Language Selector Component ──────────────────────────────────────────── */
function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  
  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.9)",
        border: "1px solid #c4ddb0",
        borderRadius: "8px",
        padding: "6px 12px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#1a2415",
        cursor: "pointer",
        outline: "none",
        minWidth: "100px",
      }}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
    </select>
  );
}

/* ─── Inline styles ─────────────────────────────────────────────────────────── */
const landingCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  .lp-root {
    background: #f0f5eb;
    color: #1a2415;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  @keyframes lp-fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lp-ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes lp-pulse  { 0%,100%{transform:scale(1);opacity:.7} 50%{transform:scale(1.5);opacity:0} }

  /* Nav */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 64px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 48px;
    background: rgba(240,245,235,0.9);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid #dce8d4;
    transition: all .3s;
  }
  .lp-nav.scrolled { background: rgba(255,255,255,0.95); box-shadow: 0 2px 16px rgba(26,36,21,0.08); }

  .lp-logo {
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 17px;
    color: #1a2415; letter-spacing: -0.3px; text-decoration: none;
  }
  .lp-logo img {
    height: 38px;
    width: auto;
    object-fit: contain;
  }
  .lp-logo-box {
    width: 34px; height: 34px; border-radius: 8px;
    background: #5aad45;
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 12px; color: #fff;
    box-shadow: 0 2px 8px rgba(90,173,69,0.35);
  }
  .lp-logo-text { color: #1a2415; }
  .lp-logo-text span { color: #5aad45; }

  .lp-nav-actions { display: flex; gap: 10px; align-items: center; }
  .lp-btn-ghost {
    background: transparent; border: 1px solid #c4ddb0;
    color: #4d6245; padding: 8px 18px; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all .2s;
  }
  .lp-btn-ghost:hover { border-color: #5aad45; color: #3d7a2e; background: #eaf5e2; }
  .lp-btn-solid {
    background: #5aad45; color: #fff;
    border: none; padding: 9px 20px; border-radius: 8px;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all .2s; box-shadow: 0 2px 10px rgba(90,173,69,0.3);
  }
  .lp-btn-solid:hover { background: #3d7a2e; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(90,173,69,0.4); }

  /* Hero */
  .lp-hero {
    padding: 120px 80px 80px;
    max-width: 1400px; margin: 0 auto;
    display: flex; flex-direction: column; align-items: flex-start;
    min-height: 92vh; justify-content: center;
  }
  .lp-hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid #cce8b0; border-radius: 100px;
    padding: 5px 14px; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #3d7a2e; background: #eaf5e2; font-weight: 600;
    width: fit-content; margin-bottom: 28px;
    animation: lp-fadeUp .7s ease both;
  }
  .lp-hero-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #5aad45;
    position: relative; flex-shrink: 0;
  }
  .lp-hero-dot::after {
    content: ''; position: absolute; inset: -3px; border-radius: 50%;
    border: 1.5px solid #5aad45; animation: lp-pulse 1.8s ease-out infinite;
  }
  .lp-hero-h1 {
    font-family: 'Inter', sans-serif; font-weight: 800;
    font-size: clamp(44px, 6vw, 76px); line-height: 1.1;
    color: #1a2415; margin-bottom: 24px; letter-spacing: -2px;
    animation: lp-fadeUp .8s .1s ease both;
  }
  .lp-hero-h1 .lp-accent { color: #5aad45; }
  .lp-hero-sub {
    max-width: 520px; font-size: 17px; line-height: 1.7; color: #4d6245;
    margin-bottom: 40px; font-weight: 400;
    animation: lp-fadeUp .8s .2s ease both;
  }
  .lp-hero-ctas {
    display: flex; gap: 14px; flex-wrap: wrap;
    animation: lp-fadeUp .8s .3s ease both;
  }
  .lp-cta-primary {
    background: #5aad45; color: #fff;
    border: none; padding: 14px 32px; border-radius: 9px;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px;
    cursor: pointer; transition: all .2s; box-shadow: 0 3px 14px rgba(90,173,69,0.35);
  }
  .lp-cta-primary:hover { background: #3d7a2e; transform: translateY(-2px); box-shadow: 0 6px 24px rgba(90,173,69,0.45); }
  .lp-cta-outline {
    background: #fff; color: #4d6245;
    border: 1.5px solid #c4ddb0; padding: 14px 32px; border-radius: 9px;
    font-family: 'Inter', sans-serif; font-weight: 500; font-size: 15px;
    cursor: pointer; transition: all .2s; box-shadow: 0 1px 4px rgba(26,36,21,0.06);
  }
  .lp-cta-outline:hover { border-color: #5aad45; color: #3d7a2e; transform: translateY(-1px); }

  /* Ticker */
  .lp-ticker-wrap {
    overflow: hidden;
    border-top: 1px solid #dce8d4; border-bottom: 1px solid #dce8d4;
    background: #e6efe0; padding: 13px 0;
  }
  .lp-ticker-inner {
    display: flex; gap: 72px; width: max-content;
    animation: lp-ticker 28s linear infinite; white-space: nowrap;
  }
  .lp-ticker-item {
    display: flex; align-items: center; gap: 10px;
    font-size: 12px; letter-spacing: 1.2px; text-transform: uppercase;
    color: #8da080; font-weight: 500;
  }
  .lp-ticker-sep { color: #5aad45; font-size: 14px; }

  /* Stats */
  .lp-stats-section { padding: 64px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-stats-grid {
    display: grid; grid-template-columns: repeat(4,1fr);
    background: #fff; border: 1px solid #dce8d4; border-radius: 18px;
    overflow: hidden; box-shadow: 0 2px 16px rgba(26,36,21,0.08);
  }
  .lp-stat-item {
    padding: 40px 32px; text-align: center;
    border-right: 1px solid #dce8d4; transition: background .2s;
  }
  .lp-stat-item:last-child { border-right: none; }
  .lp-stat-item:hover { background: #f6faf3; }
  .lp-stat-num {
    font-family: 'Inter', sans-serif; font-weight: 800;
    font-size: 44px; color: #5aad45; line-height: 1;
    margin-bottom: 8px; letter-spacing: -2px;
  }
  .lp-stat-lbl { font-size: 13px; color: #8da080; font-weight: 500; }

  /* Section header */
  .lp-sec-header { text-align: center; margin-bottom: 56px; }
  .lp-sec-tag {
    display: inline-block; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;
    color: #3d7a2e; border: 1px solid #cce8b0; border-radius: 100px;
    padding: 4px 14px; margin-bottom: 16px; background: #eaf5e2; font-weight: 600;
  }
  .lp-sec-title {
    font-family: 'Inter', sans-serif; font-weight: 700;
    font-size: clamp(26px, 3.5vw, 40px); color: #1a2415;
    margin-bottom: 14px; line-height: 1.2; letter-spacing: -1px;
  }
  .lp-sec-sub {
    font-size: 16px; color: #4d6245; max-width: 500px; margin: 0 auto;
    line-height: 1.65; font-weight: 400;
  }

  /* Features */
  .lp-features-section { padding: 64px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-features-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
  .lp-feat-card {
    background: #fff; border: 1px solid #dce8d4; border-radius: 16px; padding: 36px;
    transition: all .25s; position: relative; overflow: hidden;
    box-shadow: 0 1px 4px rgba(26,36,21,0.06);
  }
  .lp-feat-card:hover { border-color: #a8e063; transform: translateY(-3px); box-shadow: 0 8px 32px rgba(26,36,21,0.12); }
  .lp-feat-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 48px; height: 48px; border-radius: 10px;
    background: #eaf5e2; border: 1px solid #cce8b0;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 13px; color: #3d7a2e;
    margin-bottom: 20px; letter-spacing: 0.5px;
  }
  .lp-feat-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 18px; margin-bottom: 10px; color: #1a2415; letter-spacing: -0.3px; }
  .lp-feat-desc { font-size: 14px; color: #4d6245; line-height: 1.65; font-weight: 400; }
  .lp-feat-arrow { position: absolute; right: 28px; bottom: 28px; color: #c4ddb0; font-size: 18px; transition: all .25s; }
  .lp-feat-card:hover .lp-feat-arrow { color: #5aad45; transform: translate(3px,-3px); }

  /* How it Works */
  .lp-how-section { padding: 64px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-how-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 0;
    position: relative;
    background: #fff; border: 1px solid #dce8d4; border-radius: 18px;
    overflow: hidden; box-shadow: 0 1px 4px rgba(26,36,21,0.06);
  }
  .lp-how-step {
    padding: 40px 36px; text-align: center;
    border-right: 1px solid #dce8d4;
  }
  .lp-how-step:last-child { border-right: none; }
  .lp-step-num {
    width: 64px; height: 64px; border-radius: 50%;
    background: #eaf5e2; border: 1.5px solid #cce8b0;
    display: flex; align-items: center; justify-content: center;
    font-family: 'Inter', sans-serif; font-weight: 700; font-size: 20px; color: #3d7a2e;
    margin: 0 auto 20px; letter-spacing: -0.5px;
  }
  .lp-step-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 16px; color: #1a2415; margin-bottom: 10px; letter-spacing: -0.2px; }
  .lp-step-desc { font-size: 14px; color: #4d6245; line-height: 1.6; font-weight: 400; }

  /* CTA Banner */
  .lp-cta-section { padding: 64px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-cta-box {
    background: #1e2720; border-radius: 20px; padding: 72px 80px; text-align: center;
    position: relative; overflow: hidden;
  }
  .lp-cta-box::before {
    content: ''; position: absolute; top: -80px; right: -80px;
    width: 280px; height: 280px; border-radius: 50%;
    background: radial-gradient(circle, rgba(90,173,69,0.2), transparent);
    pointer-events: none;
  }
  .lp-cta-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: clamp(24px,3.5vw,40px); color: #fff; margin-bottom: 14px; letter-spacing: -1px; }
  .lp-cta-sub { font-size: 16px; color: rgba(235,245,228,0.6); margin-bottom: 36px; font-weight: 400; }
  .lp-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .lp-cta-btns .lp-cta-primary { background: #a8e063; color: #1a2415; }
  .lp-cta-btns .lp-cta-primary:hover { background: #5aad45; color: #fff; }
  .lp-cta-btns .lp-cta-outline { background: transparent; color: rgba(235,245,228,0.7); border-color: rgba(235,245,228,0.2); }
  .lp-cta-btns .lp-cta-outline:hover { border-color: #a8e063; color: #a8e063; }

  /* Footer */
  .lp-footer { border-top: 1px solid #dce8d4; background: #fff; }
  .lp-footer-feedback {
    padding: 64px 80px;
    background: #f6faf3; border-bottom: 1px solid #dce8d4;
  }
  .lp-footer-feedback-inner {
    max-width: 1400px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start;
  }
  .lp-fb-title { font-family: 'Inter', sans-serif; font-weight: 700; font-size: 26px; color: #1a2415; margin-bottom: 10px; letter-spacing: -0.5px; }
  .lp-fb-sub { font-size: 14px; color: #4d6245; line-height: 1.65; margin-bottom: 28px; }
  .lp-fb-form { display: flex; flex-direction: column; gap: 14px; }
  .lp-fb-input, .lp-fb-textarea, .lp-fb-select {
    background: #fff; border: 1.5px solid #dce8d4;
    border-radius: 9px; color: #1a2415; font-family: 'Inter', sans-serif; font-size: 14px;
    padding: 11px 14px; outline: none; transition: all .2s; width: 100%;
  }
  .lp-fb-input:focus, .lp-fb-textarea:focus, .lp-fb-select:focus { border-color: #5aad45; box-shadow: 0 0 0 3px rgba(90,173,69,0.1); }
  .lp-fb-input::placeholder, .lp-fb-textarea::placeholder { color: #8da080; }
  .lp-fb-textarea { resize: vertical; min-height: 100px; }
  .lp-fb-select { appearance: none; cursor: pointer; }
  .lp-fb-btn {
    background: #5aad45; color: #fff;
    border: none; padding: 13px; border-radius: 9px;
    font-family: 'Inter', sans-serif; font-weight: 600; font-size: 15px;
    cursor: pointer; transition: all .2s; box-shadow: 0 2px 10px rgba(90,173,69,0.3);
  }
  .lp-fb-btn:hover { background: #3d7a2e; transform: translateY(-1px); }
  .lp-fb-sent { text-align: center; padding: 36px; color: #3d7a2e; font-weight: 600; font-size: 16px; }

  .lp-ql-section { display: flex; flex-direction: column; gap: 36px; }
  .lp-ql-block-title { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #3d7a2e; margin-bottom: 14px; }
  .lp-ql-list { display: flex; flex-direction: column; gap: 8px; }
  .lp-ql-link {
    display: flex; align-items: center; gap: 10px; color: #4d6245;
    text-decoration: none; font-size: 14px; transition: all .2s;
    padding: 7px 10px; border-radius: 7px;
  }
  .lp-ql-link:hover { color: #3d7a2e; background: #eaf5e2; }
  .lp-ql-link-icon { font-size: 15px; }
  .lp-ql-link-ext { margin-left: auto; font-size: 11px; opacity: .5; }

  .lp-footer-main { padding: 56px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 56px; }
  .lp-footer-brand-desc { font-size: 13px; color: #8da080; line-height: 1.7; margin-top: 14px; max-width: 260px; }
  .lp-footer-col-title { font-family: 'Inter', sans-serif; font-weight: 600; font-size: 11px; letter-spacing: 1.2px; text-transform: uppercase; color: #4d6245; margin-bottom: 16px; }
  .lp-footer-link { display: block; color: #8da080; text-decoration: none; font-size: 14px; margin-bottom: 10px; transition: color .2s; }
  .lp-footer-link:hover { color: #3d7a2e; }
  .lp-footer-link-ext { display: inline-flex; align-items: center; gap: 5px; }
  .lp-ext-icon { font-size: 10px; opacity: .6; }
  .lp-footer-socials { display: flex; gap: 10px; margin-top: 20px; }
  .lp-social-btn {
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid #dce8d4; background: transparent;
    color: #8da080; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .2s; text-decoration: none;
  }
  .lp-social-btn:hover { border-color: #5aad45; color: #3d7a2e; background: #eaf5e2; }

  .lp-footer-bottom {
    border-top: 1px solid #dce8d4; padding: 22px 80px;
    display: flex; justify-content: space-between; align-items: center;
    max-width: 1400px; margin: 0 auto;
  }
  .lp-footer-copy { font-size: 13px; color: #8da080; }
  .lp-footer-copy a { color: #5aad45; text-decoration: none; }
  .lp-footer-bottom-links { display: flex; gap: 22px; }
  .lp-footer-bottom-link { font-size: 13px; color: #8da080; text-decoration: none; transition: color .2s; }
  .lp-footer-bottom-link:hover { color: #3d7a2e; }

  @media(max-width: 960px) {
    .lp-nav { padding: 0 20px; }
    .lp-hero { padding: 100px 24px 60px; }
    .lp-hero-h1 { font-size: 42px; }
    .lp-stats-section, .lp-features-section, .lp-how-section, .lp-cta-section { padding: 48px 24px; }
    .lp-stats-grid { grid-template-columns: repeat(2,1fr); }
    .lp-stat-item { border-right: none; border-bottom: 1px solid #dce8d4; }
    .lp-stat-item:nth-child(2n) { border-right: none; }
    .lp-features-grid, .lp-how-grid { grid-template-columns: 1fr; }
    .lp-how-step { border-right: none; border-bottom: 1px solid #dce8d4; }
    .lp-cta-box { padding: 48px 24px; }
    .lp-footer-feedback { padding: 48px 24px; }
    .lp-footer-feedback-inner { grid-template-columns: 1fr; gap: 40px; }
    .lp-footer-main { padding: 40px 24px; }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
    .lp-footer-bottom { padding: 20px 24px; flex-direction: column; gap: 12px; text-align: center; }
  }
`;

const tickerDupe = [...TICKER, ...TICKER];

export default function Landing({ onLogin, onRegister }) {
  const { t, language } = useContext(LanguageContext);
  const [stats, setStats] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [feedback, setFeedback] = useState({ name: "", email: "", type: "suggestion", msg: "" });
  const [fbSent, setFbSent] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);

  // Force re-render when language changes
  const [langKey, setLangKey] = useState(0);
  useEffect(() => {
    setLangKey(prev => prev + 1);
  }, [language]);

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try { 
        const data = await apiGet("/api/stats/summary"); 
        setStats(data); 
      } catch (err) {
        console.log("Stats API not available, using defaults");
        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    };
    load();
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleFeedback = (e) => {
    e.preventDefault();
    setFbSent(true);
  };

  // Default stats when API is not available
  const defaultStats = { recommendations: "7+", mandi_prices: "500+", crops: "9", users: "2+" };
  const displayStats = loadingStats ? defaultStats : (stats || defaultStats);

  return (
    <div key={langKey}>
      <style>{landingCSS}</style>
      <div className="lp-root">

        {/* Nav */}
        <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
          <div className="lp-logo">
            <img src={logo} alt="AgriRakshak Logo" className="logo" />
            <span className="lp-logo-text">AGRi<span>Rakshak</span></span>
          </div>
          <div className="lp-nav-actions">
            <LanguageSelector />
            <button className="lp-btn-ghost" onClick={onLogin}>{t('signIn')}</button>
            <button className="lp-btn-solid" onClick={onRegister}>{t('getStarted')}</button>
          </div>
        </nav>

        {/* Hero */}
        <section className="lp-hero">
          <div className="lp-hero-tag">
            <div className="lp-hero-dot" />
            {t('aiPowered')}
          </div>
          <h1 className="lp-hero-h1">
            {t('growSmarter')}<br />
            <span className="lp-accent">{t('sellBetter')}</span><br />
            {t('earnMore')}
          </h1>
          <p className="lp-hero-sub">
            {t('heroSubtitle')}
          </p>
          <div className="lp-hero-ctas">
            <button className="lp-cta-primary" onClick={onRegister}>{t('startFree')}</button>
            <button className="lp-cta-outline" onClick={onLogin}>{t('farmerLogin')}</button>
          </div>
        </section>

        {/* Ticker */}
        <div className="lp-ticker-wrap">
          <div className="lp-ticker-inner">
            {tickerDupe.map((t_item, i) => (
              <span className="lp-ticker-item" key={i}>
                <span className="lp-ticker-sep">*</span>
                {t_item}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section className="lp-stats-section">
          <div className="lp-stats-grid">
            {[
              { val: displayStats.recommendations, lbl: t('recommendationsServed') },
              { val: displayStats.mandi_prices, lbl: t('mandiPriceRecords') },
              { val: displayStats.crops, lbl: t('cropsSupported') },
              { val: displayStats.users, lbl: t('farmersOnboarded') },
            ].map((s, i) => (
              <div className="lp-stat-item" key={i}>
                <div className="lp-stat-num">{s.val}</div>
                <div className="lp-stat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="lp-features-section">
          <div className="lp-sec-header">
            <div className="lp-sec-tag">{t('coreTechnology')}</div>
            <h2 className="lp-sec-title">{t('everythingFarming')}</h2>
            <p className="lp-sec-sub">{t('featuresSubtitle')}</p>
          </div>
          <div className="lp-features-grid">
            {FEATURES.map((f, i) => (
              <div className="lp-feat-card" key={i}>
                <div className="lp-feat-badge">{f.badge}</div>
                <div className="lp-feat-title">{t('weatherIntelligence')}</div>
                <div className="lp-feat-desc">{t('weatherDesc')}</div>
                <div className="lp-feat-arrow"></div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="lp-how-section">
          <div className="lp-sec-header">
            <div className="lp-sec-tag">{t('simpleProcess')}</div>
            <h2 className="lp-sec-title">{t('threeSteps')}</h2>
            <p className="lp-sec-sub">{t('howSubtitle')}</p>
          </div>
          <div className="lp-how-grid">
            {STEPS.map((s, i) => (
              <div className="lp-how-step" key={i}>
                <div className="lp-step-num">{s.num}</div>
                <div className="lp-step-title">{t('connectFarm')}</div>
                <div className="lp-step-desc">{t('connectFarmDesc')}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="lp-cta-section">
          <div className="lp-cta-box">
            <div className="lp-sec-tag" style={{ marginBottom: 16 }}>{t('joinBeta')}</div>
            <h2 className="lp-cta-title">{t('ctaTitle')}</h2>
            <p className="lp-cta-sub">{t('ctaSubtitle')}</p>
            <div className="lp-cta-btns">
              <button className="lp-cta-primary" onClick={onRegister}>{t('createAccount')}</button>
              <button className="lp-cta-outline" onClick={onLogin}>{t('farmerLogin')}</button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">

          {/* Feedback + Quick Links */}
          <div className="lp-footer-feedback">
            <div className="lp-footer-feedback-inner">
              {/* Feedback form */}
              <div>
                <div className="lp-sec-tag" style={{ marginBottom: 14 }}>{t('helpFeedback')}</div>
                <div className="lp-fb-title">{t('shareThoughts')}</div>
                <p className="lp-fb-sub">{t('feedbackSubtitle')}</p>
                {fbSent ? (
                  <div className="lp-fb-sent">{t('thankYouFeedback')}</div>
                ) : (
                  <div className="lp-fb-form">
                    <input className="lp-fb-input" placeholder={t('yourName')} value={feedback.name}
                      onChange={e => setFeedback({ ...feedback, name: e.target.value })} />
                    <input className="lp-fb-input" placeholder={t('emailOptional')} value={feedback.email}
                      onChange={e => setFeedback({ ...feedback, email: e.target.value })} />
                    <select className="lp-fb-select" value={feedback.type}
                      onChange={e => setFeedback({ ...feedback, type: e.target.value })}>
                      <option value="suggestion">{t('featureSuggestion')}</option>
                      <option value="bug">{t('bugReport')}</option>
                      <option value="mandi">{t('missingMandi')}</option>
                      <option value="other">{t('generalFeedback')}</option>
                    </select>
                    <textarea className="lp-fb-textarea" placeholder={t('tellUs')}
                      value={feedback.msg} onChange={e => setFeedback({ ...feedback, msg: e.target.value })} />
                    <button className="lp-fb-btn" onClick={handleFeedback}>{t('sendFeedback')}</button>
                  </div>
                )}
              </div>

              {/* Quick links */}
              <div className="lp-ql-section">
                <div>
                  <div className="lp-ql-block-title">{t('govtPortals')}</div>
                  <div className="lp-ql-list">
                    {GOV_LINKS.map((l, i) => (
                      <a key={i} className="lp-ql-link" href={l.url} target="_blank" rel="noopener noreferrer">
                        <span className="lp-ql-link-icon"></span>
                        {l.label}
                        <span className="lp-ql-link-ext"></span>
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="lp-ql-block-title">{t('downloadApp')}</div>
                  <div className="lp-ql-list">
                    <a className="lp-ql-link" href="#" target="_blank" rel="noopener noreferrer">
                      <span className="lp-ql-link-icon"></span> {t('getPlayStore')}
                      <span className="lp-ql-link-ext"></span>
                    </a>
                    <a className="lp-ql-link" href="#" target="_blank" rel="noopener noreferrer">
                      <span className="lp-ql-link-icon"></span> {t('getAppStore')}
                      <span className="lp-ql-link-ext"></span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main footer */}
          <div className="lp-footer-main">
            <div className="lp-footer-grid">
              {/* Brand */}
              <div>
                <div className="lp-logo">
                  <div className="lp-logo-box">AR</div>
                  <span className="lp-logo-text">AGRi<span>Rakshak</span></span>
                </div>
                <p className="lp-footer-brand-desc">
                  {t('heroSubtitle')}
                </p>
                <div className="lp-footer-socials">
                  {["X", "in", "f", "Y"].map((s, i) => (
                    <a key={i} className="lp-social-btn" href="#" target="_blank" rel="noopener noreferrer">{s}</a>
                  ))}
                </div>
              </div>

              {/* Product */}
              <div>
                <div className="lp-footer-col-title">{t('product')}</div>
                {[
                  t('features'), 
                  t('howItWorks'), 
                  t('supportedCrops'), 
                  t('pricing'), 
                  t('changelog')
                ].map((l, i) => (
                  <a key={i} className="lp-footer-link" href="#">{l}</a>
                ))}
              </div>

              {/* Resources */}
              <div>
                <div className="lp-footer-col-title">{t('resources')}</div>
                {[
                  t('documentation'), 
                  t('apiAccess'), 
                  t('blog'), 
                  t('faqs'), 
                  t('contactSupport')
                ].map((l, i) => (
                  <a key={i} className="lp-footer-link" href="#">{l}</a>
                ))}
              </div>

              {/* Government Sites */}
              <div>
                <div className="lp-footer-col-title">Gov Sites</div>
                {GOV_LINKS.map((l, i) => (
                  <a key={i} className="lp-footer-link lp-footer-link-ext" href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} <span className="lp-ext-icon"></span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: "1px solid #dce8d4" }}>
            <div className="lp-footer-bottom">
              <div className="lp-footer-copy">
                2026 AgriRakshak. Built for Indian farmers. Data sourced from{" "}
                <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer">Agmarknet</a> and{" "}
                <a href="https://www.enam.gov.in" target="_blank" rel="noopener noreferrer">eNAM</a>
              </div>
              <div className="lp-footer-bottom-links">
                {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((l, i) => (
                  <a key={i} className="lp-footer-bottom-link" href="#">{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
