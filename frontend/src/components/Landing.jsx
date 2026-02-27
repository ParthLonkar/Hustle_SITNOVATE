import { useEffect, useState, useContext } from "react";
import { apiGet } from "../services/api";
import { LanguageContext } from "../context/LanguageContext";
import logo from "../assets/AgriRakshak.png";
import img1 from "../assets/image_1.jpg";
import img2 from "../assets/image_2.jpg";
import img3 from "../assets/image_3.jpg";
import img4 from "../assets/image_4.jpg";
import img5 from "../assets/image_5.jpg";

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

const SLIDES = [
  { src: img1, caption: "Smart Farming",      sub: "AI-powered harvest decisions" },
  { src: img2, caption: "Mandi Intelligence", sub: "Real-time market prices" },
  { src: img3, caption: "Better Yields",       sub: "Data-driven crop management" },
  { src: img4, caption: "Soil Health",         sub: "Optimal NPK recommendations" },
  { src: img5, caption: "Maximise Profit",     sub: "Sell at the right time" },
];

/* ─── Language Selector ─────────────────────────────────────────────────────── */
function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      style={{
        background: "rgba(255,255,255,0.9)", border: "1px solid #c4ddb0",
        borderRadius: "8px", padding: "6px 12px", fontSize: "14px",
        fontWeight: 500, color: "#1a2415", cursor: "pointer",
        outline: "none", minWidth: "100px",
      }}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
    </select>
  );
}

/* ─── Slideshow ─────────────────────────────────────────────────────────────── */
function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  const goTo = (idx) => { setCurrent(idx); setProgressKey(k => k + 1); };
  const prev = () => goTo((current - 1 + SLIDES.length) % SLIDES.length);
  const next = () => goTo((current + 1) % SLIDES.length);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(c => (c + 1) % SLIDES.length);
      setProgressKey(k => k + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="lp-hero-right">
      <div className="lp-slide-progress">
        <div className="lp-slide-progress-bar" key={progressKey} />
      </div>

      {SLIDES.map((s, i) => (
        <div key={i} className={`lp-slide${i === current ? " active" : ""}`}>
          <img src={s.src} alt={s.caption} />
          <div className="lp-slide-overlay" />
          {i === current && (
            <div className="lp-slide-caption">
              <div className="lp-slide-caption-tag">
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#a8e063", display: "inline-block" }} />
                Agriरक्षक
              </div>
              <h3>{s.caption}</h3>
              <p>{s.sub}</p>
            </div>
          )}
        </div>
      ))}

      <div className="lp-slide-counter">{current + 1} / {SLIDES.length}</div>
      <button className="lp-slide-arrow prev" onClick={prev}>‹</button>
      <button className="lp-slide-arrow next" onClick={next}>›</button>
      <div className="lp-slide-dots">
        {SLIDES.map((_, i) => (
          <button key={i} className={`lp-slide-dot${i === current ? " active" : ""}`} onClick={() => goTo(i)} />
        ))}
      </div>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────────────────── */
const landingCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --green: #4a9e35;
    --green-dark: #2f6b20;
    --green-light: #a8e063;
    --green-pale: #eaf5e2;
    --green-border: #c8e4b0;
    --bg: #f2f6ed;
    --bg2: #e8f0e1;
    --white: #ffffff;
    --ink: #162012;
    --ink2: #3a5232;
    --ink3: #7a9472;
    --border: #d4e8c4;
    --shadow-sm: 0 1px 6px rgba(22,32,18,0.08);
    --shadow-md: 0 4px 24px rgba(22,32,18,0.12);
    --shadow-lg: 0 12px 48px rgba(22,32,18,0.16);
    --shadow-xl: 0 24px 80px rgba(22,32,18,0.2);
    --radius: 16px;
    --font-head: 'Inter', sans-serif;
    --font-body: 'Inter', sans-serif;
  }

  .lp-root { background: var(--bg); color: var(--ink); font-family: var(--font-body); min-height: 100vh; overflow-x: hidden; }

  @keyframes lp-fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lp-fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes lp-ticker    { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes lp-pulse     { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.7);opacity:0} }
  @keyframes lp-slideIn   { from{opacity:0;transform:scale(1.05)} to{opacity:1;transform:scale(1)} }
  @keyframes lp-captionUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes lp-progress  { from{width:0%} to{width:100%} }
  @keyframes lp-float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes lp-shimmer   { from{background-position:200% center} to{background-position:-200% center} }
  @keyframes lp-spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes lp-growIn    { from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }
  @keyframes lp-countUp   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }

  /* ── Nav ── */
  .lp-nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 200;
    height: 68px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 52px;
    background: rgba(242,246,237,0.85); backdrop-filter: blur(20px) saturate(180%);
    border-bottom: 1px solid rgba(212,232,196,0.6);
    transition: all .35s cubic-bezier(.4,0,.2,1);
  }
  .lp-nav.scrolled {
    background: rgba(255,255,255,0.96);
    box-shadow: 0 1px 0 var(--border), 0 4px 20px rgba(22,32,18,0.07);
  }
  .lp-logo { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; }
  .lp-logo img { height: 36px; width: auto; object-fit: contain; }
  .lp-logo-box {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #5aad45, #3a8a28);
    display: flex; align-items: center; justify-content: center;
    font-weight: 700; font-size: 12px; color: #fff;
    box-shadow: 0 2px 10px rgba(74,158,53,0.4), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .lp-logo-text { font-family: var(--font-head); font-size: 19px; color: var(--ink); letter-spacing: -0.3px; }
  .lp-logo-text span { color: var(--green); }
  .lp-nav-actions { display: flex; gap: 10px; align-items: center; }
  .lp-btn-ghost {
    background: transparent; border: 1.5px solid var(--green-border);
    color: var(--ink2); padding: 8px 20px; border-radius: 10px;
    font-family: var(--font-body); font-size: 14px; font-weight: 500;
    cursor: pointer; transition: all .2s;
  }
  .lp-btn-ghost:hover { border-color: var(--green); color: var(--green-dark); background: var(--green-pale); }
  .lp-btn-solid {
    background: linear-gradient(135deg, #5aad45, #3a8a28); color: #fff;
    border: none; padding: 9px 22px; border-radius: 10px;
    font-family: var(--font-body); font-weight: 600; font-size: 14px;
    cursor: pointer; transition: all .22s;
    box-shadow: 0 2px 12px rgba(74,158,53,0.35);
  }
  .lp-btn-solid:hover { transform: translateY(-1px); box-shadow: 0 5px 20px rgba(74,158,53,0.45); filter: brightness(1.05); }

  /* ── Hero ── */
  .lp-hero-wrap {
    position: relative; overflow: hidden; min-height: 100vh;
    background: linear-gradient(160deg, #e8f4e0 0%, #f2f6ed 45%, #eef5e8 100%);
    display: flex; flex-direction: column;
  }
  .lp-hero-wrap::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 75% 40%, rgba(90,173,69,0.12) 0%, transparent 65%),
      radial-gradient(ellipse 40% 30% at 20% 70%, rgba(168,224,99,0.1) 0%, transparent 60%);
  }
  .lp-hero-grid-bg {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.4;
    background-image:
      linear-gradient(rgba(74,158,53,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(74,158,53,0.06) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 80%);
  }
  .lp-hero {
    padding: 0 80px; max-width: 1400px; margin: 0 auto;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 64px;
    min-height: 100vh; padding-top: 68px;
    position: relative; z-index: 1;
  }
  .lp-hero-left { display: flex; flex-direction: column; align-items: flex-start; padding: 48px 0; }
  .lp-hero-tag {
    display: inline-flex; align-items: center; gap: 8px;
    border: 1px solid var(--green-border); border-radius: 100px;
    padding: 6px 16px; font-size: 11px; letter-spacing: 1.8px;
    text-transform: uppercase; color: var(--green-dark);
    background: rgba(255,255,255,0.8); backdrop-filter: blur(8px);
    font-weight: 600; width: fit-content; margin-bottom: 30px;
    animation: lp-fadeUp .6s ease both;
    box-shadow: 0 1px 4px rgba(74,158,53,0.12), inset 0 1px 0 rgba(255,255,255,0.8);
  }
  .lp-hero-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--green); position: relative; flex-shrink: 0; }
  .lp-hero-dot::after {
    content: ''; position: absolute; inset: -4px; border-radius: 50%;
    border: 1.5px solid var(--green); animation: lp-pulse 2s ease-out infinite;
  }
  .lp-hero-h1 {
    font-family: var(--font-head); font-weight: 400;
    font-size: clamp(44px, 5vw, 74px); line-height: 1.05;
    color: var(--ink); margin-bottom: 26px; letter-spacing: -1px;
    animation: lp-fadeUp .7s .08s ease both;
  }
  .lp-hero-h1 em { font-style: italic; color: var(--green); }
  .lp-hero-h1 .lp-accent {
    display: inline-block; position: relative; color: var(--green);
    background: linear-gradient(135deg, #4a9e35, #a8e063, #4a9e35);
    background-size: 200%;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: lp-shimmer 4s linear infinite;
  }
  .lp-hero-sub {
    max-width: 460px; font-size: 17px; line-height: 1.72;
    color: var(--ink2); margin-bottom: 44px; font-weight: 400;
    animation: lp-fadeUp .7s .16s ease both;
  }
  .lp-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; animation: lp-fadeUp .7s .24s ease both; }
  .lp-cta-primary {
    background: linear-gradient(135deg, #5aad45, #3a8a28); color: #fff;
    border: none; padding: 15px 34px; border-radius: 12px;
    font-family: var(--font-body); font-weight: 600; font-size: 15px;
    cursor: pointer; transition: all .22s;
    box-shadow: 0 4px 16px rgba(74,158,53,0.38), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .lp-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(74,158,53,0.5); filter: brightness(1.06); }
  .lp-cta-outline {
    background: rgba(255,255,255,0.85); backdrop-filter: blur(8px);
    color: var(--ink2); border: 1.5px solid var(--green-border);
    padding: 15px 34px; border-radius: 12px;
    font-family: var(--font-body); font-weight: 500; font-size: 15px;
    cursor: pointer; transition: all .22s;
    box-shadow: 0 2px 8px rgba(22,32,18,0.07);
  }
  .lp-cta-outline:hover { border-color: var(--green); color: var(--green-dark); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(74,158,53,0.15); }

  /* Hero trust strip */
  .lp-hero-trust {
    display: flex; align-items: center; gap: 18px; margin-top: 28px;
    animation: lp-fadeUp .7s .34s ease both;
  }
  .lp-trust-avatars { display: flex; }
  .lp-trust-avatar {
    width: 30px; height: 30px; border-radius: 50%;
    border: 2.5px solid var(--white); margin-left: -8px;
    background: linear-gradient(135deg, #7bc96d, #4a9e35);
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; color: white;
    box-shadow: 0 1px 4px rgba(22,32,18,0.15);
  }
  .lp-trust-avatar:first-child { margin-left: 0; }
  .lp-trust-text { font-size: 13px; color: var(--ink3); font-weight: 400; }
  .lp-trust-text strong { color: var(--ink); font-weight: 600; }

  /* Hero floating badges */
  .lp-hero-badge {
    position: absolute; background: white; border-radius: 14px;
    padding: 12px 16px; display: flex; align-items: center; gap: 10px;
    box-shadow: var(--shadow-lg); border: 1px solid var(--border);
    z-index: 10; pointer-events: none;
    animation: lp-float 5s ease-in-out infinite, lp-fadeIn .8s .6s ease both;
    animation-fill-mode: both;
  }
  .lp-hero-badge.b1 { bottom: 14%; left: -32px; animation-delay: 0s, .6s; }
  .lp-hero-badge.b2 { top: 18%; right: -28px; animation-delay: 1.5s, .8s; }
  .lp-badge-icon { width: 36px; height: 36px; border-radius: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .lp-badge-icon.green { background: #eaf5e2; }
  .lp-badge-icon.amber { background: #fef3e2; }
  .lp-badge-val { font-size: 16px; font-weight: 700; color: var(--ink); line-height: 1; }
  .lp-badge-lbl { font-size: 11px; color: var(--ink3); font-weight: 400; margin-top: 2px; }

  /* Slideshow */
  .lp-hero-right {
    position: relative; height: 600px;
    border-radius: 24px; overflow: hidden;
    box-shadow: var(--shadow-xl), 0 0 0 1px rgba(212,232,196,0.4);
    animation: lp-fadeUp .9s .1s ease both;
  }
  .lp-slide { position: absolute; inset: 0; opacity: 0; transition: opacity .9s cubic-bezier(.4,0,.2,1); pointer-events: none; }
  .lp-slide.active { opacity: 1; pointer-events: auto; animation: lp-slideIn .9s ease both; }
  .lp-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .lp-slide-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(180deg, rgba(10,20,8,0.05) 0%, transparent 35%, rgba(10,20,8,0.55) 72%, rgba(10,20,8,0.88) 100%);
  }
  .lp-slide-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 32px 30px 28px; animation: lp-captionUp .6s .25s ease both; }
  .lp-slide-caption-tag {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(90,173,69,0.22); border: 1px solid rgba(90,173,69,0.45);
    color: #b4e875; border-radius: 100px; padding: 4px 12px;
    font-size: 10px; font-weight: 700; letter-spacing: 1.4px;
    text-transform: uppercase; margin-bottom: 10px;
    backdrop-filter: blur(6px);
  }
  .lp-slide-caption h3 { font-family: var(--font-head); font-weight: 400; font-size: 24px; color: #fff; margin: 0 0 5px; letter-spacing: -0.3px; }
  .lp-slide-caption p  { font-size: 13px; color: rgba(225,240,215,0.7); margin: 0; }
  .lp-slide-dots { position: absolute; bottom: 22px; right: 26px; display: flex; gap: 7px; align-items: center; }
  .lp-slide-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.3); cursor: pointer; transition: all .3s; border: none; padding: 0; }
  .lp-slide-dot.active { background: #a8e063; width: 24px; border-radius: 4px; }
  .lp-slide-progress { position: absolute; top: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,0.1); overflow: hidden; }
  .lp-slide-progress-bar { height: 100%; background: linear-gradient(90deg, #5aad45, #a8e063); animation: lp-progress 4s linear forwards; }
  .lp-slide-arrow {
    position: absolute; top: 50%; transform: translateY(-50%);
    width: 38px; height: 38px; border-radius: 50%;
    background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.18); color: white;
    font-size: 20px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all .2s; z-index: 10;
  }
  .lp-slide-arrow:hover { background: rgba(90,173,69,0.4); border-color: rgba(90,173,69,0.7); transform: translateY(-50%) scale(1.08); }
  .lp-slide-arrow.prev { left: 14px; }
  .lp-slide-arrow.next { right: 14px; }
  .lp-slide-counter {
    position: absolute; top: 16px; left: 16px;
    background: rgba(10,20,8,0.45); backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.9); padding: 5px 13px;
    border-radius: 100px; font-size: 11px; font-weight: 600; letter-spacing: .8px;
  }

  /* ── Ticker ── */
  .lp-ticker-wrap {
    overflow: hidden; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, #e2eedd, #e8f2e1, #e2eedd); padding: 14px 0;
  }
  .lp-ticker-inner { display: flex; gap: 72px; width: max-content; animation: lp-ticker 32s linear infinite; white-space: nowrap; }
  .lp-ticker-item { display: flex; align-items: center; gap: 10px; font-size: 11.5px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--ink3); font-weight: 500; }
  .lp-ticker-sep { color: var(--green); font-size: 12px; }

  /* ── Stats ── */
  .lp-stats-section { padding: 72px 80px 56px; max-width: 1400px; margin: 0 auto; }
  .lp-stats-grid {
    display: grid; grid-template-columns: repeat(4,1fr);
    background: var(--white);
    border: 1px solid var(--border); border-radius: 20px;
    overflow: hidden;
    box-shadow: var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.8);
  }
  .lp-stat-item { padding: 44px 32px; text-align: center; border-right: 1px solid var(--border); transition: background .25s; position: relative; overflow: hidden; }
  .lp-stat-item::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 110%, rgba(74,158,53,0.07), transparent); opacity: 0; transition: opacity .3s; }
  .lp-stat-item:hover::after { opacity: 1; }
  .lp-stat-item:last-child { border-right: none; }
  .lp-stat-item:hover { background: #fafdf8; }
  .lp-stat-icon-row { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
  .lp-stat-icon { width: 36px; height: 36px; border-radius: 9px; background: var(--green-pale); border: 1px solid var(--green-border); display: flex; align-items: center; justify-content: center; }
  .lp-stat-num {
    font-family: var(--font-head); font-weight: 400;
    font-size: 52px; color: var(--green); line-height: 1;
    margin-bottom: 8px; letter-spacing: -2px;
    animation: lp-countUp .6s ease both;
  }
  .lp-stat-lbl { font-size: 13px; color: var(--ink3); font-weight: 400; letter-spacing: 0.2px; }

  /* ── Section header ── */
  .lp-sec-header { text-align: center; margin-bottom: 60px; }
  .lp-sec-tag {
    display: inline-block; font-size: 11px; letter-spacing: 1.8px;
    text-transform: uppercase; color: var(--green-dark);
    border: 1px solid var(--green-border); border-radius: 100px;
    padding: 5px 16px; margin-bottom: 18px;
    background: rgba(255,255,255,0.8); font-weight: 600;
  }
  .lp-sec-title {
    font-family: var(--font-head); font-weight: 400;
    font-size: clamp(30px, 3.8vw, 46px); color: var(--ink);
    margin-bottom: 16px; line-height: 1.15; letter-spacing: -0.5px;
  }
  .lp-sec-title em { font-style: italic; color: var(--green); }
  .lp-sec-sub { font-size: 16px; color: var(--ink2); max-width: 520px; margin: 0 auto; line-height: 1.7; font-weight: 400; }

  /* ── Features ── */
  .lp-features-section { padding: 56px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-features-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
  .lp-feat-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 20px; padding: 40px; transition: all .28s cubic-bezier(.4,0,.2,1);
    position: relative; overflow: hidden;
    box-shadow: var(--shadow-sm);
  }
  .lp-feat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--green), var(--green-light));
    transform-origin: left; transform: scaleX(0); transition: transform .35s ease;
  }
  .lp-feat-card:hover { border-color: rgba(74,158,53,0.3); transform: translateY(-4px); box-shadow: var(--shadow-lg); }
  .lp-feat-card:hover::before { transform: scaleX(1); }
  .lp-feat-card-bg { position: absolute; bottom: -20px; right: -20px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(74,158,53,0.05), transparent); pointer-events: none; transition: all .3s; }
  .lp-feat-card:hover .lp-feat-card-bg { transform: scale(1.4); opacity: 1.5; }
  .lp-feat-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 52px; height: 52px; border-radius: 14px;
    background: linear-gradient(135deg, var(--green-pale), rgba(168,224,99,0.2));
    border: 1px solid var(--green-border); margin-bottom: 22px;
    position: relative; z-index: 1;
  }
  .lp-feat-badge-inner { font-family: var(--font-head); font-size: 15px; color: var(--green-dark); font-weight: 400; }
  .lp-feat-title { font-family: var(--font-head); font-weight: 400; font-size: 20px; margin-bottom: 12px; color: var(--ink); letter-spacing: -0.2px; position: relative; z-index: 1; }
  .lp-feat-desc { font-size: 14.5px; color: var(--ink2); line-height: 1.7; font-weight: 400; position: relative; z-index: 1; }
  .lp-feat-arrow {
    position: absolute; right: 30px; bottom: 30px;
    width: 32px; height: 32px; border-radius: 8px;
    background: var(--green-pale); border: 1px solid var(--green-border);
    display: flex; align-items: center; justify-content: center;
    color: var(--green); font-size: 14px; transition: all .25s;
  }
  .lp-feat-card:hover .lp-feat-arrow { background: var(--green); color: white; border-color: var(--green); transform: translate(2px,-2px); }

  /* ── Testimonials / Social Proof ── */
  .lp-testimonials-section { padding: 56px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
  .lp-testi-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px; position: relative;
    transition: all .25s; box-shadow: var(--shadow-sm);
  }
  .lp-testi-card:hover { border-color: rgba(74,158,53,0.25); box-shadow: var(--shadow-md); transform: translateY(-2px); }
  .lp-testi-quote { font-size: 40px; line-height: 1; color: var(--green-border); font-family: Georgia, serif; margin-bottom: 12px; }
  .lp-testi-text { font-size: 14.5px; color: var(--ink2); line-height: 1.7; margin-bottom: 24px; font-style: italic; }
  .lp-testi-author { display: flex; align-items: center; gap: 12px; }
  .lp-testi-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #7bc96d, #4a9e35); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: white; flex-shrink: 0; }
  .lp-testi-name { font-size: 14px; font-weight: 600; color: var(--ink); }
  .lp-testi-location { font-size: 12px; color: var(--ink3); margin-top: 2px; }
  .lp-testi-stars { display: flex; gap: 2px; margin-bottom: 14px; }
  .lp-star { width: 14px; height: 14px; fill: #f59e0b; color: #f59e0b; }

  /* ── How it Works ── */
  .lp-how-section { padding: 56px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-how-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    background: var(--white); border: 1px solid var(--border);
    border-radius: 20px; overflow: hidden; box-shadow: var(--shadow-sm);
    position: relative;
  }
  .lp-how-grid::after {
    content: ''; position: absolute; top: 0; bottom: 0; left: 33.33%; right: 33.33%;
    border-left: 1px solid var(--border); border-right: 1px solid var(--border);
    pointer-events: none;
  }
  .lp-how-step { padding: 52px 40px; text-align: center; transition: background .2s; }
  .lp-how-step:hover { background: #fafdf8; }
  .lp-step-num-wrap { position: relative; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; width: 72px; height: 72px; }
  .lp-step-num-ring { position: absolute; inset: 0; border-radius: 50%; border: 1.5px dashed var(--green-border); animation: lp-spin 20s linear infinite; }
  .lp-step-num {
    width: 56px; height: 56px; border-radius: 50%;
    background: linear-gradient(135deg, var(--green-pale), rgba(168,224,99,0.25));
    border: 1.5px solid var(--green-border);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-head); font-weight: 400; font-size: 22px;
    color: var(--green-dark); position: relative;
  }
  .lp-step-connector { display: none; }
  .lp-step-title { font-family: var(--font-head); font-weight: 400; font-size: 19px; color: var(--ink); margin-bottom: 12px; letter-spacing: -0.2px; }
  .lp-step-desc { font-size: 14px; color: var(--ink2); line-height: 1.68; font-weight: 400; }

  /* ── CTA Banner ── */
  .lp-cta-section { padding: 56px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-cta-box {
    background: linear-gradient(135deg, #152010 0%, #1e2d18 50%, #0f1a0c 100%);
    border-radius: 24px; padding: 80px 80px;
    text-align: center; position: relative; overflow: hidden;
    box-shadow: 0 24px 64px rgba(10,20,8,0.3);
  }
  .lp-cta-box::before {
    content: ''; position: absolute;
    top: -100px; right: -100px; width: 400px; height: 400px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(90,173,69,0.18), transparent 65%);
    pointer-events: none;
  }
  .lp-cta-box::after {
    content: ''; position: absolute;
    bottom: -80px; left: -60px; width: 320px; height: 320px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(168,224,99,0.1), transparent 60%);
    pointer-events: none;
  }
  .lp-cta-box-inner { position: relative; z-index: 1; }
  .lp-cta-title {
    font-family: var(--font-head); font-weight: 400;
    font-size: clamp(28px, 4vw, 52px); color: #fff;
    margin-bottom: 16px; letter-spacing: -0.5px; line-height: 1.1;
  }
  .lp-cta-title em { font-style: italic; color: #a8e063; }
  .lp-cta-sub { font-size: 16px; color: rgba(210,230,200,0.65); margin-bottom: 40px; font-weight: 400; }
  .lp-cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .lp-cta-btns .lp-cta-primary { background: linear-gradient(135deg, #a8e063, #7bc96d); color: #142010; box-shadow: 0 4px 20px rgba(168,224,99,0.35); }
  .lp-cta-btns .lp-cta-primary:hover { filter: brightness(1.1); }
  .lp-cta-btns .lp-cta-outline { background: rgba(255,255,255,0.06); backdrop-filter: blur(8px); color: rgba(210,230,200,0.75); border-color: rgba(255,255,255,0.15); }
  .lp-cta-btns .lp-cta-outline:hover { border-color: #a8e063; color: #a8e063; background: rgba(168,224,99,0.08); }
  .lp-cta-trust { display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 32px; flex-wrap: wrap; }
  .lp-cta-trust-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: rgba(200,220,190,0.5); font-weight: 400; }
  .lp-cta-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(168,224,99,0.4); flex-shrink: 0; }

  /* ── Footer ── */
  .lp-footer { border-top: 1px solid var(--border); background: var(--white); }
  .lp-footer-feedback { padding: 72px 80px; background: var(--bg); border-bottom: 1px solid var(--border); }
  .lp-footer-feedback-inner { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 96px; align-items: start; }
  .lp-fb-title { font-family: var(--font-head); font-weight: 400; font-size: 30px; color: var(--ink); margin-bottom: 10px; letter-spacing: -0.3px; }
  .lp-fb-sub { font-size: 14px; color: var(--ink2); line-height: 1.7; margin-bottom: 30px; }
  .lp-fb-form { display: flex; flex-direction: column; gap: 14px; }
  .lp-fb-input, .lp-fb-textarea, .lp-fb-select {
    background: var(--white); border: 1.5px solid var(--border);
    border-radius: 11px; color: var(--ink);
    font-family: var(--font-body); font-size: 14px;
    padding: 12px 16px; outline: none; transition: all .2s; width: 100%;
  }
  .lp-fb-input:focus, .lp-fb-textarea:focus, .lp-fb-select:focus { border-color: var(--green); box-shadow: 0 0 0 3px rgba(74,158,53,0.1); }
  .lp-fb-input::placeholder, .lp-fb-textarea::placeholder { color: var(--ink3); }
  .lp-fb-textarea { resize: vertical; min-height: 108px; }
  .lp-fb-select { appearance: none; cursor: pointer; }
  .lp-fb-btn {
    background: linear-gradient(135deg, #5aad45, #3a8a28); color: #fff;
    border: none; padding: 14px; border-radius: 11px;
    font-family: var(--font-body); font-weight: 600; font-size: 15px;
    cursor: pointer; transition: all .2s;
    box-shadow: 0 3px 12px rgba(74,158,53,0.35);
  }
  .lp-fb-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(74,158,53,0.45); }
  .lp-fb-sent { text-align: center; padding: 40px; color: var(--green-dark); font-weight: 600; font-size: 16px; }
  .lp-ql-section { display: flex; flex-direction: column; gap: 36px; }
  .lp-ql-block-title { font-family: var(--font-body); font-weight: 600; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--green-dark); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
  .lp-ql-block-title::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, var(--green-border), transparent); }
  .lp-ql-list { display: flex; flex-direction: column; gap: 7px; }
  .lp-ql-link {
    display: flex; align-items: center; gap: 12px;
    color: var(--ink2); text-decoration: none; font-size: 13.5px; font-weight: 500;
    transition: all .2s; padding: 10px 14px; border-radius: 11px;
    border: 1px solid transparent; background: var(--white);
    box-shadow: var(--shadow-sm);
  }
  .lp-ql-link:hover { color: var(--ink); background: var(--green-pale); border-color: var(--green-border); box-shadow: 0 3px 12px rgba(74,158,53,0.12); transform: translateX(3px); }
  .lp-ql-link-icon { width: 30px; height: 30px; border-radius: 8px; background: var(--green-pale); border: 1px solid var(--green-border); display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; transition: all .2s; }
  .lp-ql-link:hover .lp-ql-link-icon { background: var(--green); border-color: var(--green); }
  .lp-ql-link-label { flex: 1; }
  .lp-ql-link-ext { width: 20px; height: 20px; border-radius: 5px; background: var(--bg); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 10px; color: var(--ink3); transition: all .2s; flex-shrink: 0; }
  .lp-ql-link:hover .lp-ql-link-ext { background: var(--green); border-color: var(--green); color: #fff; }
  .lp-ql-app-btn {
    display: flex; align-items: center; gap: 14px; color: var(--ink);
    text-decoration: none; font-size: 13.5px; font-weight: 500;
    transition: all .25s; padding: 14px 16px; border-radius: 13px;
    border: 1.5px solid var(--border); background: var(--white);
    box-shadow: var(--shadow-sm);
  }
  .lp-ql-app-btn:hover { border-color: var(--green); box-shadow: 0 5px 20px rgba(74,158,53,0.18); transform: translateY(-2px); }
  .lp-ql-app-icon { width: 38px; height: 38px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .lp-ql-app-icon.play { background: linear-gradient(135deg, #1a1a2e, #16213e); }
  .lp-ql-app-icon.apple { background: linear-gradient(135deg, #2d2d2d, #1a1a1a); }
  .lp-ql-app-text-small { font-size: 10px; color: var(--ink3); font-weight: 400; line-height: 1; margin-bottom: 2px; letter-spacing: 0.3px; }
  .lp-ql-app-text-big { font-size: 14px; color: var(--ink); font-weight: 700; line-height: 1; letter-spacing: -0.3px; }
  .lp-ql-app-arrow { margin-left: auto; color: var(--green-border); font-size: 16px; transition: all .2s; }
  .lp-ql-app-btn:hover .lp-ql-app-arrow { color: var(--green); transform: translate(2px, -2px); }
  .lp-footer-main { padding: 60px 80px; max-width: 1400px; margin: 0 auto; }
  .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 56px; }
  .lp-footer-brand-desc { font-size: 13.5px; color: var(--ink3); line-height: 1.72; margin-top: 14px; max-width: 260px; }
  .lp-footer-col-title { font-family: var(--font-body); font-weight: 600; font-size: 11px; letter-spacing: 1.4px; text-transform: uppercase; color: var(--ink2); margin-bottom: 18px; }
  .lp-footer-link { display: block; color: var(--ink3); text-decoration: none; font-size: 14px; margin-bottom: 11px; transition: color .2s; }
  .lp-footer-link:hover { color: var(--green-dark); }
  .lp-footer-link-ext { display: inline-flex; align-items: center; gap: 5px; }
  .lp-ext-icon { font-size: 10px; opacity: .6; }
  .lp-footer-socials { display: flex; gap: 10px; margin-top: 20px; }
  .lp-social-btn {
    width: 36px; height: 36px; border-radius: 9px;
    border: 1px solid var(--border); background: transparent;
    color: var(--ink3); font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all .2s; text-decoration: none;
  }
  .lp-social-btn:hover { border-color: var(--green); color: var(--green-dark); background: var(--green-pale); }
  .lp-footer-divider { border-top: 1px solid var(--border); }
  .lp-footer-bottom { padding: 24px 80px; display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; }
  .lp-footer-copy { font-size: 13px; color: var(--ink3); }
  .lp-footer-copy a { color: var(--green); text-decoration: none; }
  .lp-footer-bottom-links { display: flex; gap: 24px; }
  .lp-footer-bottom-link { font-size: 13px; color: var(--ink3); text-decoration: none; transition: color .2s; }
  .lp-footer-bottom-link:hover { color: var(--green-dark); }

  @media(max-width: 960px) {
    .lp-nav { padding: 0 20px; }
    .lp-hero-wrap .lp-hero { grid-template-columns: 1fr; padding: 100px 24px 60px; gap: 40px; min-height: auto; }
    .lp-hero-right { height: 340px; }
    .lp-hero-h1 { font-size: 46px; }
    .lp-hero-badge { display: none; }
    .lp-stats-section, .lp-features-section, .lp-how-section, .lp-cta-section, .lp-testimonials-section { padding: 48px 24px; }
    .lp-stats-grid { grid-template-columns: repeat(2,1fr); }
    .lp-stat-item { border-right: none; border-bottom: 1px solid var(--border); }
    .lp-features-grid { grid-template-columns: 1fr; }
    .lp-how-grid { grid-template-columns: 1fr; }
    .lp-how-grid::after { display: none; }
    .lp-how-step { border-bottom: 1px solid var(--border); }
    .lp-testimonials-grid { grid-template-columns: 1fr; }
    .lp-cta-box { padding: 52px 28px; }
    .lp-footer-feedback { padding: 48px 24px; }
    .lp-footer-feedback-inner { grid-template-columns: 1fr; gap: 44px; }
    .lp-footer-main { padding: 44px 24px; }
    .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
    .lp-footer-bottom { padding: 20px 24px; flex-direction: column; gap: 14px; text-align: center; }
  }
`;

const tickerDupe = [...TICKER, ...TICKER];

/* ─── Main Component ─────────────────────────────────────────────────────────── */
export default function Landing({ onLogin, onRegister }) {
  const { t, language } = useContext(LanguageContext);
  const [stats, setStats] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [feedback, setFeedback] = useState({ name: "", email: "", type: "suggestion", msg: "" });
  const [fbSent, setFbSent] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [langKey, setLangKey] = useState(0);

  useEffect(() => { setLangKey(prev => prev + 1); }, [language]);

  useEffect(() => {
    const load = async () => {
      setLoadingStats(true);
      try {
        const data = await apiGet("/api/stats/summary");
        setStats(data);
      } catch {
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

  const handleFeedback = (e) => { e.preventDefault(); setFbSent(true); };

  const defaultStats = { recommendations: "10K+", mandi_prices: "500+", crops: "25+", users: "5K+" };
  const displayStats = defaultStats;

  return (
    <div key={langKey}>
      <style>{landingCSS}</style>
      <div className="lp-root">

        {/* Nav */}
        <nav className={`lp-nav${scrolled ? " scrolled" : ""}`}>
          <div className="lp-logo">
            <img src={logo} alt="AgriRakshak Logo" className="logo" />
            <span className="lp-logo-text">AGRi<span>रक्षक</span></span>
          </div>
          <div className="lp-nav-actions">
            <LanguageSelector />
            <button className="lp-btn-ghost" onClick={onLogin}>{t('signIn')}</button>
            <button className="lp-btn-solid" onClick={onRegister}>{t('getStarted')}</button>
          </div>
        </nav>

        {/* Hero — left text + right slideshow */}
        <div className="lp-hero-wrap">
          <div className="lp-hero-grid-bg" />
          <section className="lp-hero">
            <div className="lp-hero-left">
              <div className="lp-hero-tag">
                <div className="lp-hero-dot" />
                {t('aiPowered')}
              </div>
              <h1 className="lp-hero-h1">
                {t('growSmarter')}<br />
                <span className="lp-accent">{t('sellBetter')}</span><br />
                <em>{t('earnMore')}</em>
              </h1>
              <p className="lp-hero-sub">{t('heroSubtitle')}</p>
              <div className="lp-hero-ctas">
                <button className="lp-cta-primary" onClick={onRegister}>{t('startFree')}</button>
                <button className="lp-cta-outline" onClick={onLogin}>{t('farmerLogin')}</button>
              </div>
              <div className="lp-hero-trust">
                <div className="lp-trust-avatars">
                  {["R","S","P","M"].map((l,i) => <div className="lp-trust-avatar" key={i}>{l}</div>)}
                </div>
                <div className="lp-trust-text"><strong>500+</strong> farmers already using AgriRakshak</div>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <HeroSlideshow />
              {/* Floating badge — profit */}
              <div className="lp-hero-badge b1">
                <div className="lp-badge-icon green">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a9e35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                </div>
                <div>
                  <div className="lp-badge-val">₹12,400</div>
                  <div className="lp-badge-lbl">Avg. profit boost</div>
                </div>
              </div>
              {/* Floating badge — accuracy */}
              <div className="lp-hero-badge b2">
                <div className="lp-badge-icon amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26Z"/></svg>
                </div>
                <div>
                  <div className="lp-badge-val">94%</div>
                  <div className="lp-badge-lbl">Price accuracy</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Ticker */}
        <div className="lp-ticker-wrap">
          <div className="lp-ticker-inner">
            {tickerDupe.map((t_item, i) => (
              <span className="lp-ticker-item" key={i}>
                <span className="lp-ticker-sep">✦</span>
                {t_item}
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <section className="lp-stats-section">
          <div className="lp-stats-grid">
            {[
              { val: displayStats.recommendations, lbl: t('recommendationsServed'), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a9e35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
              { val: displayStats.mandi_prices,    lbl: t('mandiPriceRecords'), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a9e35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> },
              { val: displayStats.crops,           lbl: t('cropsSupported'), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a9e35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12"/><path d="M5 12H2a10 10 0 0018 0h-3"/><path d="M12 12C12 6 7 3 7 3s0 5 5 9z"/><path d="M12 12c0-6 5-9 5-9s0 5-5 9z"/></svg> },
              { val: displayStats.users,           lbl: t('farmersOnboarded'), icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a9e35" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
            ].map((s, i) => (
              <div className="lp-stat-item" key={i}>
                <div className="lp-stat-icon-row"><div className="lp-stat-icon">{s.icon}</div></div>
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
                <div className="lp-feat-card-bg" />
                <div className="lp-feat-badge"><span className="lp-feat-badge-inner">{f.badge}</span></div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
                <div className="lp-feat-arrow">↗</div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="lp-testimonials-section">
          <div className="lp-sec-header">
            <div className="lp-sec-tag">Farmer Stories</div>
            <h2 className="lp-sec-title">Trusted by farmers <em>across India</em></h2>
            <p className="lp-sec-sub">Real farmers, real results — hear how AgriRakshak changed their harvest season.</p>
          </div>
          <div className="lp-testimonials-grid">
            {[
              { quote: "The mandi price predictions helped me wait 4 extra days before selling. I earned ₹18,000 more than I expected that season.", name: "Ramesh Patil", location: "Nagpur, Maharashtra", init: "R" },
              { quote: "Before I used to just guess which market to go to. Now I know exactly which mandi gives the best price for my wheat.", name: "Sukhwinder Singh", location: "Ludhiana, Punjab", init: "S" },
              { quote: "The spoilage risk alerts saved my entire onion crop. I moved to cold storage just in time before the rains came.", name: "Priya Deshpande", location: "Pune, Maharashtra", init: "P" },
            ].map((t_item, i) => (
              <div className="lp-testi-card" key={i}>
                <div className="lp-testi-stars">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="lp-star" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <div className="lp-testi-quote">"</div>
                <div className="lp-testi-text">{t_item.quote}</div>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t_item.init}</div>
                  <div>
                    <div className="lp-testi-name">{t_item.name}</div>
                    <div className="lp-testi-location">{t_item.location}</div>
                  </div>
                </div>
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
                <div className="lp-step-num-wrap">
                  <div className="lp-step-num-ring" />
                  <div className="lp-step-num">{s.num}</div>
                </div>
                <div className="lp-step-title">{s.title}</div>
                <div className="lp-step-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="lp-cta-section">
          <div className="lp-cta-box">
            <div className="lp-cta-box-inner">
              <div className="lp-sec-tag" style={{ marginBottom: 18 }}>{t('joinBeta')}</div>
              <h2 className="lp-cta-title">{t('ctaTitle')} <em>today.</em></h2>
              <p className="lp-cta-sub">{t('ctaSubtitle')}</p>
              <div className="lp-cta-btns">
                <button className="lp-cta-primary" onClick={onRegister}>{t('createAccountCta')}</button>
                <button className="lp-cta-outline" onClick={onLogin}>{t('farmerLogin')}</button>
              </div>
              <div className="lp-cta-trust">
                {["Free to get started", "No credit card needed", "Real-time data"].map((item, i) => (
                  <div className="lp-cta-trust-item" key={i}>
                    <div className="lp-cta-trust-dot" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="lp-footer">
          <div className="lp-footer-feedback">
            <div className="lp-footer-feedback-inner">
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
              <div className="lp-ql-section">
                <div>
                  <div className="lp-ql-block-title">{t('govtPortals')}</div>
                  <div className="lp-ql-list">
                    {GOV_LINKS.map((l, i) => (
                      <a key={i} className="lp-ql-link" href={l.url} target="_blank" rel="noopener noreferrer">
                        <span className="lp-ql-link-icon">🔗</span>
                        <span className="lp-ql-link-label">{l.label}</span>
                        <span className="lp-ql-link-ext">↗</span>
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="lp-ql-block-title">{t('downloadApp')}</div>
                  <div className="lp-ql-list">
                    <a className="lp-ql-app-btn" href="#" target="_blank" rel="noopener noreferrer">
                      <span className="lp-ql-app-icon play">▶️</span>
                      <span>
                        <div className="lp-ql-app-text-small">Get it on</div>
                        <div className="lp-ql-app-text-big">Google Play</div>
                      </span>
                      <span className="lp-ql-app-arrow">↗</span>
                    </a>
                    <a className="lp-ql-app-btn" href="#" target="_blank" rel="noopener noreferrer">
                      <span className="lp-ql-app-icon apple">🍎</span>
                      <span>
                        <div className="lp-ql-app-text-small">Download on the</div>
                        <div className="lp-ql-app-text-big">App Store</div>
                      </span>
                      <span className="lp-ql-app-arrow">↗</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lp-footer-main">
            <div className="lp-footer-grid">
              <div>
                <div className="lp-logo">
                  <div className="lp-logo-box">AR</div>
                  <span className="lp-logo-text">AGRi<span>रक्षक</span></span>
                </div>
                <p className="lp-footer-brand-desc">{t('heroSubtitle')}</p>
                <div className="lp-footer-socials">
                  {["𝕏", "in", "f", "▶"].map((s, i) => (
                    <a key={i} className="lp-social-btn" href="#" target="_blank" rel="noopener noreferrer">{s}</a>
                  ))}
                </div>
              </div>
              <div>
                <div className="lp-footer-col-title">{t('product')}</div>
                {[t('features'), t('howItWorks'), t('supportedCrops'), t('pricing'), t('changelog')].map((l, i) => (
                  <a key={i} className="lp-footer-link" href="#">{l}</a>
                ))}
              </div>
              <div>
                <div className="lp-footer-col-title">{t('resources')}</div>
                {[t('documentation'), t('apiAccess'), t('blog'), t('faqs'), t('contactSupport')].map((l, i) => (
                  <a key={i} className="lp-footer-link" href="#">{l}</a>
                ))}
              </div>
              <div>
                <div className="lp-footer-col-title">Gov Sites</div>
                {GOV_LINKS.map((l, i) => (
                  <a key={i} className="lp-footer-link lp-footer-link-ext" href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.label} <span className="lp-ext-icon">↗</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lp-footer-divider">
            <div className="lp-footer-bottom">
              <div className="lp-footer-copy">
                © 2026 Agriरक्षक. Built for Indian farmers. · Data sourced from{" "}
                <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer">Agmarknet</a> &{" "}
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