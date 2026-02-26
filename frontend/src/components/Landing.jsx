const css = `
  .landing-root {
    min-height:100vh; display:flex; flex-direction:column;
    align-items:center; justify-content:center;
    position:relative; overflow:hidden; text-align:center; padding:2rem;
  }

  /* animated gradient mesh background */
  .landing-root::before {
    content:''; position:absolute; inset:0; z-index:0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 40%, rgba(45,90,39,.35) 0%, transparent 70%),
      radial-gradient(ellipse 50% 60% at 80% 60%, rgba(245,197,24,.08) 0%, transparent 60%),
      var(--soil);
  }

  .landing-content { position:relative; z-index:1; max-width:660px; }

  .landing-tag {
    display:inline-flex; align-items:center; gap:.5rem;
    padding:.4rem 1rem; border-radius:100px;
    background:rgba(76,175,80,.12); border:1px solid rgba(76,175,80,.25);
    font-size:.8rem; color:var(--leaf-bright); margin-bottom:2rem;
    animation:fadeUp .6s ease both;
  }
  .tag-dot { width:7px; height:7px; border-radius:50%; background:var(--leaf-bright); animation:pulse 2s ease infinite; }

  .landing-h1 {
    font-family:'Syne'; font-size:clamp(2.4rem,7vw,4.5rem); font-weight:800; line-height:1.1;
    margin-bottom:1.25rem; animation:fadeUp .7s .1s ease both;
  }
  .landing-h1 span {
    background:linear-gradient(90deg,var(--leaf-bright),var(--sun),var(--leaf-bright));
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    animation:shimmer 4s linear infinite;
  }

  .landing-sub {
    font-size:1.05rem; color:rgba(253,246,227,.6); line-height:1.7;
    max-width:480px; margin:0 auto 2.5rem;
    animation:fadeUp .7s .2s ease both;
  }

  .landing-cta { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; animation:fadeUp .7s .3s ease both; }
  .btn-primary {
    padding:.75rem 2rem; border-radius:100px; border:none; cursor:pointer;
    background:linear-gradient(135deg,var(--leaf),var(--leaf-bright));
    color:#fff; font-family:'Syne'; font-weight:700; font-size:.95rem;
    transition:all .25s; box-shadow:0 4px 20px rgba(76,175,80,.3);
  }
  .btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(76,175,80,.45); }

  .btn-ghost {
    padding:.75rem 2rem; border-radius:100px; cursor:pointer;
    background:transparent; border:1px solid var(--border);
    color:rgba(253,246,227,.75); font-family:'Syne'; font-weight:600; font-size:.95rem;
    transition:all .25s;
  }
  .btn-ghost:hover { border-color:var(--leaf-bright); color:var(--cream); }

  .landing-stats {
    display:flex; gap:2.5rem; justify-content:center; margin-top:4rem;
    animation:fadeUp .7s .5s ease both;
  }
  .lstat-val { font-family:'Syne'; font-size:2rem; font-weight:800; color:var(--sun); }
  .lstat-lbl { font-size:.78rem; color:rgba(253,246,227,.4); margin-top:.2rem; }

  /* floating orbs */
  .orb {
    position:absolute; border-radius:50%; pointer-events:none; z-index:0;
    filter:blur(60px);
  }
  .orb-1 { width:300px; height:300px; background:rgba(45,90,39,.3); top:-80px; left:-80px; animation:float 8s ease infinite; }
  .orb-2 { width:200px; height:200px; background:rgba(245,197,24,.08); bottom:60px; right:-40px; animation:float 6s 2s ease infinite; }
`;

export default function Landing({ onEnter }) {
  return (
    <>
      <style>{css}</style>
      <div className="landing-root">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="landing-content">
          <div className="landing-tag">
            <div className="tag-dot" />
            AI-Powered Agri Intelligence
          </div>

          <h1 className="landing-h1">
            Grow Smarter.<br />
            <span>Earn More.</span>
          </h1>

          <p className="landing-sub">
            Real-time mandi prices, spoilage risk alerts, and AI-driven market
            recommendations — all built for Indian farmers.
          </p>

          <div className="landing-cta">
            <button className="btn-primary" onClick={onEnter}>Get Started →</button>
            <button className="btn-ghost">Watch Demo</button>
          </div>

          <div className="landing-stats">
            {[
              { val: "38+",   lbl: "Live Markets" },
              { val: "1.4T",  lbl: "Spoilage Saved" },
              { val: "₹4.2L", lbl: "Avg. Season Savings" },
            ].map((s) => (
              <div key={s.lbl} style={{ textAlign: "center" }}>
                <div className="lstat-val">{s.val}</div>
                <div className="lstat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
