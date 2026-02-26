import { marketCompareData } from "./mockData.js";

const css = `
  .mc-chart {
    position:relative; height:175px;
    display:flex; align-items:flex-end; gap:8px; margin-top:.5rem;
  }

  .mc-bar-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:.4rem; }

  .mc-bar-outer {
    width:100%; border-radius:8px 8px 0 0; overflow:hidden;
    display:flex; align-items:flex-end; height:130px;
  }

  .mc-bar-inner {
    width:100%; border-radius:8px 8px 0 0;
    animation:growBar 1s ease both;
    position:relative; overflow:hidden;
    cursor:pointer; transition:filter .2s;
  }
  .mc-bar-inner:hover { filter:brightness(1.3); }
  .mc-bar-inner::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(180deg,rgba(255,255,255,.15),transparent);
  }

  .mc-val   { font-family:'Syne'; font-size:.75rem; font-weight:700; text-align:center; }
  .mc-label { font-size:.68rem; color:rgba(253,246,227,.45); text-align:center; }
`;

export default function MarketComparison({ crop = "Wheat" }) {
  const maxPrice = Math.max(...marketCompareData.map((m) => m.price));

  return (
    <>
      <style>{css}</style>
      <div className="card">
        <div className="card-header">
          <span className="card-title">📊 Market Comparison · {crop}</span>
          <span className="card-badge badge-blue">{marketCompareData.length} Markets</span>
        </div>

        <div className="mc-chart">
          {marketCompareData.map((m, i) => {
            const h = Math.round((m.price / maxPrice) * 115);
            return (
              <div key={m.market} className="mc-bar-col">
                <div className="mc-val" style={{ color: m.color }}>
                  ₹{(m.price / 1000).toFixed(1)}k
                </div>
                <div className="mc-bar-outer">
                  <div
                    className="mc-bar-inner"
                    style={{
                      "--w": "100%",
                      height: `${h}px`,
                      background: `linear-gradient(180deg, ${m.color}, ${m.color}77)`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                </div>
                <div className="mc-label">{m.market}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}