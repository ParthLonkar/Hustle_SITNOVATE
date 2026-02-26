export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --soil:        #1a0f00;
    --bark:        #2d1a00;
    --leaf:        #2d5a27;
    --leaf-bright: #4caf50;
    --sun:         #f5c518;
    --sun-warm:    #ff9500;
    --sky:         #87ceeb;
    --cream:       #fdf6e3;
    --mist:        rgba(253,246,227,0.06);
    --accent:      #ff6b35;
    --teal:        #00b4a0;
    --card-bg:     rgba(255,255,255,0.04);
    --border:      rgba(255,255,255,0.08);
    --shadow:      0 8px 32px rgba(0,0,0,0.4);
  }

  html { scroll-behavior: smooth; width: 100%; height: 100%; }
  body {
    background: var(--soil);
    color: var(--cream);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
    width: 100%;
    height: 100%;
  }
  
  #root { width: 100%; height: 100%; }

  ::-webkit-scrollbar       { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bark); }
  ::-webkit-scrollbar-thumb { background: var(--leaf); border-radius: 2px; }

  /* ── Keyframes ─────────────────────────────── */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:.5;} }
  @keyframes float    { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-8px);} }
  @keyframes shimmer  { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
  @keyframes growBar  { from{width:0;} to{width:var(--w);} }
  @keyframes ripple   { 0%{transform:scale(.8);opacity:1;} 100%{transform:scale(2.4);opacity:0;} }
  @keyframes scanline { 0%{top:-10%;} 100%{top:110%;} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 10px rgba(76,175,80,.3);} 50%{box-shadow:0 0 25px rgba(76,175,80,.7),0 0 50px rgba(76,175,80,.2);} }
  @keyframes slideRight { from{transform:translateX(-100%);opacity:0;} to{transform:translateX(0);opacity:1;} }
  @keyframes countUp  { from{opacity:0;transform:scale(.5);} to{opacity:1;transform:scale(1);} }
  @keyframes orbit    { from{transform:rotate(0deg) translateX(60px) rotate(0deg);} to{transform:rotate(360deg) translateX(60px) rotate(-360deg);} }
  @keyframes bounce   { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-5px);} }

  /* ── Shared utilities ───────────────────────── */
  .card {
    background: var(--card-bg);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 1.5rem;
    animation: fadeUp 0.6s ease both;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .card-title {
    font-family: 'Syne'; font-size: 1rem; font-weight: 700; color: var(--cream);
  }
  .card-badge { padding: .25rem .65rem; border-radius: 100px; font-size: .7rem; }
  .badge-green  { background:rgba(76,175,80,.15);  color:var(--leaf-bright); border:1px solid rgba(76,175,80,.25); }
  .badge-orange { background:rgba(255,107,53,.15); color:var(--accent);      border:1px solid rgba(255,107,53,.25); }
  .badge-blue   { background:rgba(0,180,160,.15);  color:var(--teal);        border:1px solid rgba(0,180,160,.25); }

  .tabs { display:flex; gap:.25rem; background:rgba(255,255,255,.04); border-radius:12px; padding:.25rem; }
  .tab  {
    flex:1; padding:.45rem; border-radius:9px; text-align:center; font-size:.82rem;
    cursor:pointer; transition:all .2s; color:rgba(253,246,227,.5);
    border:none; background:none; font-family:'DM Sans';
  }
  .tab.active { background:rgba(76,175,80,.2); color:var(--leaf-bright); }

  .layout  { display:flex; min-height:100vh; padding-top:64px; }
  .main    { flex:1; padding:2rem; overflow-x:hidden; }
  .grid-2  { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:2rem; }
  .grid-3  { display:grid; grid-template-columns:2fr 1fr; gap:1.5rem; margin-bottom:2rem; }

  @media (max-width:900px) { .grid-2,.grid-3 { grid-template-columns:1fr; } }
`;

export default function GlobalStyles() {
  return <style>{globalCss}</style>;
}
