import SpoilageRing from "./SpoilageRing.jsx";
import { spoilageData } from "./mockData.js";

const css = `
  .spoilage-list { display:flex; flex-direction:column; gap:1rem; }

  .spoilage-item {
    display:flex; align-items:center; gap:1rem;
    animation: fadeUp .5s ease both;
  }

  .spoilage-info   { flex:1; }
  .spoilage-name   { font-size:.9rem; font-weight:500; margin-bottom:.2rem; }
  .spoilage-sub    { font-size:.74rem; color:rgba(253,246,227,.4); }
  .spoilage-pct    { font-family:'Syne'; font-weight:700; font-size:1rem; min-width:40px; text-align:right; }
`;

export default function SpoilageCard() {
  return (
    <>
      <style>{css}</style>
      <div className="card">
        <div className="card-header">
          <span className="card-title">🔄 Spoilage Risk</span>
          <span className="card-badge badge-orange">Live</span>
        </div>

        <div className="spoilage-list">
          {spoilageData.map((s, i) => (
            <div
              key={s.name}
              className="spoilage-item"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <SpoilageRing pct={s.pct} color={s.color} />

              <div className="spoilage-info">
                <div className="spoilage-name">{s.name}</div>
                <div className="spoilage-sub">Est. shelf life: {s.days}</div>
              </div>

              <div className="spoilage-pct" style={{ color: s.color }}>
                {s.pct}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}