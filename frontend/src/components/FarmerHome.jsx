const css = `
  .farmer-hero {
    position:relative; border-radius:20px; overflow:hidden;
    padding:3rem 2.5rem; margin-bottom:2rem;
    background:linear-gradient(135deg,#1a3a0f 0%,#0d2200 40%,#1a0f00 100%);
    border:1px solid var(--border);
    animation:fadeUp .6s ease;
  }
  .farmer-hero::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse at 70% 50%,rgba(76,175,80,.12) 0%,transparent 60%);
    pointer-events:none;
  }
  .hero-scanline {
    position:absolute; left:0; right:0; height:2px;
    background:linear-gradient(90deg,transparent,rgba(76,175,80,.4),transparent);
    animation:scanline 4s linear infinite; pointer-events:none;
  }
  .hero-tag {
    display:inline-flex; align-items:center; gap:.4rem;
    padding:.3rem .75rem; border-radius:100px;
    background:rgba(76,175,80,.15); border:1px solid rgba(76,175,80,.3);
    font-size:.75rem; color:var(--leaf-bright); margin-bottom:1rem;
    animation:pulse 2s ease infinite;
  }
  .hero-dot { width:6px; height:6px; border-radius:50%; background:var(--leaf-bright); }

  .farmer-hero h1 {
    font-family:'Syne'; font-size:clamp(1.8rem,4vw,3rem);
    font-weight:800; line-height:1.15; margin-bottom:.75rem;
  }
  .farmer-hero h1 span {
    background:linear-gradient(90deg,var(--leaf-bright),var(--sun));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  }
  .farmer-hero p { color:rgba(253,246,227,.6); font-size:.95rem; max-width:480px; line-height:1.6; }

  /* Orbit decoration */
  .hero-orbit {
    position:absolute; right:80px; top:50%; transform:translateY(-50%);
    width:120px; height:120px; display:flex; align-items:center; justify-content:center;
  }
  @media(max-width:700px){ .hero-orbit { display:none; } }

  .orbit-ring   { position:absolute; width:120px; height:120px; border-radius:50%; border:1px dashed rgba(76,175,80,.3); }
  .orbit-center {
    width:40px; height:40px; border-radius:50%;
    background:radial-gradient(circle,var(--sun),var(--sun-warm));
    box-shadow:0 0 20px var(--sun),0 0 60px rgba(245,197,24,.3);
    animation:float 3s ease infinite; z-index:2;
    display:flex; align-items:center; justify-content:center; font-size:1.2rem;
  }
  .orbit-dot {
    position:absolute; width:14px; height:14px; border-radius:50%;
    background:var(--leaf-bright); top:50%; left:50%; margin:-7px;
    animation:orbit 4s linear infinite; box-shadow:0 0 8px var(--leaf-bright);
  }
  .orbit-dot:nth-child(4){ animation-delay:-2s; background:var(--teal); box-shadow:0 0 8px var(--teal); }
`;

export default function FarmerHome({ farmerName = "Farmer" }) {
  return (
    <>
      <style>{css}</style>
      <div className="farmer-hero">
        <div className="hero-scanline" />

        <div className="hero-tag">
          <div className="hero-dot" />
          Live Market Intelligence
        </div>

        <h1>
          Welcome back, <span>{farmerName}.</span><br />
          Smart Farming,&nbsp;<span>Better Profits.</span>
        </h1>

        <p>
          AI-powered insights to help you sell at the right time, right market —
          and preserve more of what you grow.
        </p>

        <div className="hero-orbit">
          <div className="orbit-ring" />
          <div className="orbit-center">🌱</div>
          <div className="orbit-dot" />
          <div className="orbit-dot" />
        </div>
      </div>
    </>
  );
}