import { explainFactors } from "./mockData.js";

const css = `
  .ep-factor {
    display:flex; align-items:center; gap:.75rem;
    margin-bottom:.85rem; animation:fadeUp .5s ease both;
  }
  .ep-label    { font-size:.82rem; width:115px; flex-shrink:0; color:rgba(253,246,227,.75); }
  .ep-bar-wrap { flex:1; height:8px; background:rgba(255,255,255,.07); border-radius:4px; overflow:hidden; }
  .ep-bar      { height:100%; border-radius:4px; animation:growBar 1.5s ease both; }
  .ep-pct      { font-family:'Syne'; font-size:.8rem; width:36px; text-align:right; }

  .ep-tip {
    margin-top:1rem; padding:.75rem 1rem; border-radius:10px;
    background:rgba(76,175,80,.07); border:1px solid rgba(76,175,80,.15);
    font-size:.82rem; color:rgba(253,246,227,.7); line-height:1.6;
  }
  .ep-tip strong { color:var(--cream); }
`;

export default function ExplainabilityPanel({ crop = "Wheat", market = "Delhi" }) {
  return (
    <>
      <style>{css}</style>
      <div className="card">
        <div className="card-header">
          <span className="card-title">🤖 AI Explainability</span>
          <span className="card-badge badge-green">Why this price?</span>
        </div>

        <p style={{ fontSize: ".8rem", color: "rgba(253,246,227,.45)", marginBottom: "1rem" }}>
          Factors influencing {crop} price in {market} mandi today:
        </p>

        {explainFactors.map((f, i) => (
          <div
            key={f.label}
            className="ep-factor"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="ep-label">{f.label}</div>
            <div className="ep-bar-wrap">
              <div
                className="ep-bar"
                style={{
                  "--w": `${f.pct}%`,
                  width: `${f.pct}%`,
                  background: `linear-gradient(90deg, ${f.color}66, ${f.color})`,
                  animationDelay: `${i * 0.12}s`,
                }}
              />
            </div>
            <div className="ep-pct" style={{ color: f.color }}>{f.pct}%</div>
          </div>
        ))}

        <div className="ep-tip">
          💡 <strong>AI Recommendation:</strong> Temperature is the dominant factor today.
          Consider selling within 48 hours or move to cold storage.
        </div>
      </div>
    </>
  );
}