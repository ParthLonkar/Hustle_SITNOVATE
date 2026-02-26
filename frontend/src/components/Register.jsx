import { useState } from "react";

const css = `
  /* reuses .auth-root / .auth-box / .field / .auth-btn from Login */
  .role-grid { display:grid; grid-template-columns:1fr 1fr; gap:.6rem; margin-bottom:1.1rem; }
  .role-card {
    padding:.7rem; border-radius:10px; text-align:center; cursor:pointer;
    background:rgba(255,255,255,.04); border:1px solid var(--border);
    transition:all .2s; font-size:.82rem;
  }
  .role-card.selected { background:rgba(76,175,80,.12); border-color:rgba(76,175,80,.4); color:var(--leaf-bright); }
  .role-card:hover { border-color:rgba(76,175,80,.3); }
  .role-icon { font-size:1.4rem; margin-bottom:.25rem; }
`;

const ROLES = [
  { icon: "👨‍🌾", label: "Farmer"  },
  { icon: "🏪",  label: "Trader"  },
  { icon: "📦",  label: "Storage" },
  { icon: "🚚",  label: "Transporter" },
];

export default function Register({ onRegister, onSwitch }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [role,  setRole]  = useState("Farmer");

  const handle = (e) => {
    e.preventDefault();
    onRegister?.({ name, email, password: pass, role });
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-root">
        <div className="auth-box">
          <div className="auth-logo">🌿 SITNOVATE</div>
          <div className="auth-sub">Smart Farming Platform</div>
          <div className="auth-title">Create Account</div>

          <form onSubmit={handle}>
            <div className="field">
              <label>Full Name</label>
              <input type="text" placeholder="Ramesh Kumar" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field">
              <label>Email / Mobile</label>
              <input type="text" placeholder="farmer@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={pass} onChange={e => setPass(e.target.value)} />
            </div>

            <div className="field">
              <label>I am a…</label>
              <div className="role-grid">
                {ROLES.map(r => (
                  <div
                    key={r.label}
                    className={`role-card ${role === r.label ? "selected" : ""}`}
                    onClick={() => setRole(r.label)}
                  >
                    <div className="role-icon">{r.icon}</div>
                    {r.label}
                  </div>
                ))}
              </div>
            </div>

            <button className="auth-btn" type="submit">Create Account →</button>
          </form>

          <div className="auth-footer">
            Already registered?{" "}
            <span className="auth-link" onClick={onSwitch}>Sign In</span>
          </div>
        </div>
      </div>
    </>
  );
}