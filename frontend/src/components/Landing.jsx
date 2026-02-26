import { useEffect, useState } from "react";
import { apiGet } from "../services/api";

export default function Landing({ onLogin, onRegister }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet("/api/stats/summary");
        setStats(data);
      } catch {
        setStats(null);
      }
    };
    load();
  }, []);

  return (
    <div className="landing">
      <div className="land-bg" />
      <div className="land-grain" />
      <nav className="land-nav">
        <div className="logo"><div className="logo-icon">AC</div>AGRiCHAIN</div>
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
          tell you exactly when to harvest and where to sell - maximizing your profit every season.
        </p>
        <div className="hero-ctas">
          <button className="btn-primary" onClick={onRegister}>Start for free -&gt;</button>
          <button className="btn-outline" onClick={onLogin}>Farmer login</button>
        </div>
      </div>
      <div className="land-stats">
        <div className="stat"><div className="stat-num">{stats ? stats.recommendations : "--"}</div><div className="stat-lbl">Recommendations served</div></div>
        <div className="stat"><div className="stat-num">{stats ? stats.mandi_prices : "--"}</div><div className="stat-lbl">Mandi price records</div></div>
        <div className="stat"><div className="stat-num">{stats ? stats.crops : "--"}</div><div className="stat-lbl">Crops supported</div></div>
        <div className="stat"><div className="stat-num">{stats ? stats.users : "--"}</div><div className="stat-lbl">Users onboarded</div></div>
      </div>
      <div className="land-features">
        {[
          { icon: "WX", title: "7-Day Weather Intelligence", desc: "Real-time forecast analysis to predict spoilage risk and optimal harvest windows." },
          { icon: "ML", title: "Mandi Price Prediction", desc: "ML models trained on historical data to forecast prices 7 days ahead across all mandis." },
          { icon: "TX", title: "Transport Cost Engine", desc: "Net profit after transport - compare every nearby mandi on a single screen." },
          { icon: "AI", title: "Explainable AI", desc: "Clear explanations so you understand exactly why each recommendation is made." }
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
