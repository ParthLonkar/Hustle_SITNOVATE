import { useState } from "react";
import { mandiData } from "./mockData.js";

const css = `
  .mandi-table { width:100%; border-collapse:collapse; }
  .mandi-table th {
    text-align:left; font-size:.7rem; text-transform:uppercase; letter-spacing:.1em;
    color:rgba(253,246,227,.35); padding:.5rem .75rem; border-bottom:1px solid var(--border);
  }
  .mandi-table td {
    padding:.75rem; font-size:.88rem;
    border-bottom:1px solid rgba(255,255,255,.03);
    transition: background .2s;
  }
  .mandi-row { cursor:pointer; animation:fadeUp .4s ease both; }
  .mandi-row:hover td { background:var(--mist); }

  .crop-name  { display:flex; align-items:center; gap:.5rem; }
  .crop-emoji { font-size:1.1rem; }

  .price-tag  { font-family:'Syne'; font-weight:700; }

  .price-change       { display:inline-flex; align-items:center; gap:.2rem; font-size:.8rem; }
  .price-change.up    { color:var(--leaf-bright); }
  .price-change.down  { color:var(--accent); }

  .mini-bar-wrap { width:80px; height:6px; background:rgba(255,255,255,.08); border-radius:3px; overflow:hidden; }
  .mini-bar      { height:100%; border-radius:3px; animation:growBar 1s ease both; }
`;

const TABS = ["Live", "Today", "Week"];

export default function MandiTable() {
  const [tab, setTab] = useState(0);

  return (
    <>
      <style>{css}</style>
      <div className="card">
        <div className="card-header">
          <span className="card-title">📋 Mandi Prices</span>
          <div className="tabs" style={{ margin: 0, width: "auto" }}>
            {TABS.map((t, i) => (
              <button
                key={i}
                className={`tab ${tab === i ? "active" : ""}`}
                onClick={() => setTab(i)}
                style={{ padding: ".3rem .7rem", fontSize: ".75rem" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <table className="mandi-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Price / Q</th>
              <th>Change</th>
              <th>Trend</th>
            </tr>
          </thead>
          <tbody>
            {mandiData.map((row, i) => (
              <tr
                key={row.name}
                className="mandi-row"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <td>
                  <div className="crop-name">
                    <span className="crop-emoji">{row.emoji}</span>
                    <span>{row.name}</span>
                  </div>
                </td>
                <td className="price-tag">₹{row.price.toLocaleString("en-IN")}</td>
                <td>
                  <span className={`price-change ${row.change > 0 ? "up" : "down"}`}>
                    {row.change > 0 ? "▲" : "▼"} {Math.abs(row.change)}%
                  </span>
                </td>
                <td>
                  <div className="mini-bar-wrap">
                    <div
                      className="mini-bar"
                      style={{
                        "--w": `${row.bar}%`,
                        width: `${row.bar}%`,
                        background: row.color,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}