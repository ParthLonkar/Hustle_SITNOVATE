import { preservationData } from "./mockData.js";

const css = `
  .pres-list  { display:flex; flex-direction:column; gap:.65rem; }

  .pres-item {
    display:flex; align-items:center; gap:.75rem;
    padding:.75rem 1rem; border-radius:12px;
    background:var(--mist); border:1px solid var(--border);
    cursor:pointer; transition:all .25s;
    animation: fadeUp .5s ease both;
  }
  .pres-item:hover { transform:translateX(6px); border-color:rgba(76,175,80,.3); }

  .pres-rank {
    font-family:'Syne'; font-weight:800; font-size:.75rem;
    width:24px; height:24px; border-radius:50%;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .rank-1 { background:rgba(245,197,24,.2);  color:var(--sun);    border:1px solid rgba(245,197,24,.4); }
  .rank-2 { background:rgba(253,246,227,.1); color:rgba(253,246,227,.75); border:1px solid var(--border); }
  .rank-3 { background:rgba(255,107,53,.1);  color:var(--accent); border:1px solid rgba(255,107,53,.3); }
  .rank-n { background:var(--mist); color:rgba(253,246,227,.5); border:1px solid var(--border); }

  .pres-label { flex:1; }
  .pres-name  { font-size:.88rem; font-weight:500; }
  .pres-crop  { font-size:.72rem; color:rgba(253,246,227,.4); }

  .pres-bar-wrap { width:80px; height:5px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; }
  .pres-bar      { height:100%; border-radius:3px; animation:growBar 1.2s ease both; }

  .pres-score { font-family:'Syne'; font-weight:700; font-size:.85rem; width:28px; text-align:right; }
`;

function rankClass(rank) {
  if (rank === 1) return "rank-1";
  if (rank === 2) return "rank-2";
  if (rank === 3) return "rank-3";
  return "rank-n";
}

export default function PreservationRanking() {
  return (
    <>
      <style>{css}</style>
      <div className="card">
        <div className="card-header">
          <span className="card-title">🏆 Preservation Ranking</span>
          <span className="card-badge badge-green">AI Ranked</span>
        </div>

        <div className="pres-list">
          {preservationData.map((p, i) => (
            <div
              key={p.name}
              className="pres-item"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={`pres-rank ${rankClass(p.rank)}`}>{p.rank}</div>

              <div className="pres-label">
                <div className="pres-name">{p.name}</div>
                <div className="pres-crop">{p.crop}</div>
              </div>

              <div className="pres-bar-wrap">
                <div
                  className="pres-bar"
                  style={{
                    "--w": `${p.score}%`,
                    width: `${p.score}%`,
                    background: `linear-gradient(90deg, ${p.color}88, ${p.color})`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              </div>

              <div className="pres-score" style={{ color: p.color }}>
                {p.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}