import FarmerHome        from "./FarmerHome.jsx";
import WeatherStrip      from "./WeatherStrip.jsx";
import MandiTable        from "./MandiTable.jsx";
import SpoilageCard      from "./SpoilageCard.jsx";
import PreservationRanking from "./PreservationRanking.jsx";
import MarketComparison  from "./MarketComparison.jsx";
import ExplainabilityPanel from "./ExplainabilityPanel.jsx";
import { statsData, alertsData } from "./mockData.js";

const css = `
  /* ── Stat Cards ─────────────────────────────── */
  .stats-grid {
    display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
    gap:1rem; margin-bottom:2rem;
  }
  .stat-card {
    background:var(--card-bg); border:1px solid var(--border); border-radius:16px;
    padding:1.25rem 1.5rem; position:relative; overflow:hidden;
    transition:all .3s; cursor:default; animation:fadeUp .6s ease both;
  }
  .stat-card:hover { transform:translateY(-4px); border-color:rgba(76,175,80,.3); box-shadow:var(--shadow); }
  .stat-card::after {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    border-radius:16px 16px 0 0;
    background:linear-gradient(90deg,transparent,var(--leaf-bright),transparent);
    opacity:0; transition:opacity .3s;
  }
  .stat-card:hover::after { opacity:1; }
  .stat-label  { font-size:.75rem; color:rgba(253,246,227,.45); text-transform:uppercase; letter-spacing:.1em; margin-bottom:.5rem; }
  .stat-value  { font-family:'Syne'; font-size:2rem; font-weight:800; line-height:1; margin-bottom:.35rem; animation:countUp .8s ease both; }
  .stat-change { font-size:.78rem; display:flex; align-items:center; gap:.3rem; }
  .stat-change.up   { color:var(--leaf-bright); }
  .stat-change.down { color:var(--accent); }
  .stat-icon   { position:absolute; right:1.25rem; top:1.25rem; font-size:2rem; opacity:.15; animation:float 4s ease infinite; }

  /* ── Alerts ──────────────────────────────────── */
  .alert {
    display:flex; align-items:flex-start; gap:.75rem;
    padding:.85rem 1rem; border-radius:12px; margin-bottom:.65rem;
    animation:fadeUp .4s ease both;
  }
  .alert-warn { background:rgba(255,107,53,.1); border:1px solid rgba(255,107,53,.2); }
  .alert-info { background:rgba(0,180,160,.08);  border:1px solid rgba(0,180,160,.2); }
  .alert-icon { font-size:1rem; flex-shrink:0; margin-top:.1rem; }
  .alert-text { font-size:.82rem; line-height:1.5; color:rgba(253,246,227,.8); }
  .alert-title { font-weight:600; color:var(--cream); margin-bottom:.15rem; font-size:.85rem; }
`;

export default function FarmerDashboard({ farmerName }) {
  return (
    <>
      <style>{css}</style>

      {/* Hero greeting */}
      <FarmerHome farmerName={farmerName} />

      {/* Stat summary */}
      <div className="stats-grid">
        {statsData.map((s, i) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div
              className="stat-value"
              style={{ color: i % 2 === 0 ? "var(--sun)" : "var(--leaf-bright)" }}
            >
              {s.value}
            </div>
            <div className={`stat-change ${s.dir}`}>
              {s.dir === "up" ? "▲" : "▼"} {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Weather */}
      <WeatherStrip />

      {/* Mandi Table + Alerts */}
      <div className="grid-3" style={{ marginBottom: "2rem" }}>
        <MandiTable />

        <div className="card" style={{ alignSelf: "start" }}>
          <div className="card-header">
            <span className="card-title">⚡ Alerts</span>
            <span className="card-badge badge-orange">{alertsData.length} Active</span>
          </div>
          {alertsData.map((a, i) => (
            <div
              key={i}
              className={`alert alert-${a.type}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="alert-icon">{a.icon}</div>
              <div className="alert-text">
                <div className="alert-title">{a.title}</div>
                {a.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spoilage + Preservation */}
      <div className="grid-2">
        <SpoilageCard />
        <PreservationRanking />
      </div>

      {/* Market Compare + Explainability */}
      <div className="grid-2">
        <MarketComparison />
        <ExplainabilityPanel />
      </div>
    </>
  );
}
