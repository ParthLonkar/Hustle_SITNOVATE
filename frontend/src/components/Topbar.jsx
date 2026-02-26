import { useState } from "react";

const css = `
  .topbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2rem; height: 64px;
    background: rgba(26,15,0,0.88);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
    animation: fadeIn 0.6s ease;
  }
  .topbar-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.3rem;
    background: linear-gradient(90deg, var(--sun), var(--leaf-bright), var(--sun));
    background-size: 200% auto;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
    letter-spacing: 0.05em; cursor: pointer;
  }
  .topbar-nav { display: flex; gap: .5rem; align-items: center; }
  .nav-btn {
    padding: .4rem 1rem; border-radius: 100px; border: 1px solid var(--border);
    background: transparent; color: rgba(253,246,227,.7); font-family: 'DM Sans';
    font-size: .85rem; cursor: pointer; transition: all .25s;
  }
  .nav-btn:hover, .nav-btn.active {
    background: var(--leaf); color: var(--cream); border-color: var(--leaf-bright);
    box-shadow: 0 0 12px rgba(76,175,80,.3);
  }
  .topbar-right { display: flex; gap: .75rem; align-items: center; }
  .weather-pill {
    display: flex; align-items: center; gap: .4rem;
    padding: .35rem .75rem; border-radius: 100px;
    background: rgba(135,206,235,.1); border: 1px solid rgba(135,206,235,.2);
    font-size: .8rem; color: var(--sky); animation: bounce 3s ease infinite;
  }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--leaf), var(--sun));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne'; font-weight: 700; font-size: .85rem;
    cursor: pointer; transition: transform .2s;
    animation: glow 3s ease infinite;
  }
  .avatar:hover { transform: scale(1.1); }
`;

const NAVS = ["Dashboard", "Markets", "Analytics", "Reports"];

export default function Topbar({ activeNav = "Dashboard", onNavChange }) {
  return (
    <>
      <style>{css}</style>
      <nav className="topbar">
        <div className="topbar-logo">🌿 SITNOVATE</div>

        <div className="topbar-nav">
          {NAVS.map((n) => (
            <button
              key={n}
              className={`nav-btn ${activeNav === n ? "active" : ""}`}
              onClick={() => onNavChange?.(n)}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="topbar-right">
          <div className="weather-pill">☀️ 34°C · Nagpur</div>
          <div className="avatar">FK</div>
        </div>
      </nav>
    </>
  );
}