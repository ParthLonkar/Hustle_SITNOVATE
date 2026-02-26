import { useState } from "react";

const css = `
  .auth-root {
    min-height:100vh; display:flex; align-items:center; justify-content:center;
    padding:2rem; position:relative; overflow:hidden;
  }
  .auth-root::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(ellipse 50% 60% at 50% 40%, rgba(45,90,39,.2) 0%, transparent 70%);
  }

  .auth-box {
    position:relative; z-index:1; width:100%; max-width:420px;
    background:rgba(255,255,255,.04); border:1px solid var(--border);
    border-radius:24px; padding:2.5rem;
    animation:fadeUp .6s ease;
  }

  .auth-logo {
    font-family:'Syne'; font-size:1.4rem; font-weight:800; text-align:center;
    background:linear-gradient(90deg,var(--sun),var(--leaf-bright));
    background-size:200% auto;
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    animation:shimmer 3s linear infinite; margin-bottom:.5rem;
  }
  .auth-sub  { text-align:center; font-size:.85rem; color:rgba(253,246,227,.4); margin-bottom:2rem; }
  .auth-title { font-family:'Syne'; font-size:1.5rem; font-weight:700; text-align:center; margin-bottom:1.75rem; }

  .field { margin-bottom:1.1rem; }
  .field label { display:block; font-size:.78rem; color:rgba(253,246,227,.55); margin-bottom:.4rem; letter-spacing:.05em; }
  .field input {
    width:100%; padding:.7rem 1rem; border-radius:10px;
    background:rgba(255,255,255,.05); border:1px solid var(--border);
    color:var(--cream); font-family:'DM Sans'; font-size:.9rem;
    outline:none; transition:border-color .2s, box-shadow .2s;
  }
  .field input:focus { border-color:rgba(76,175,80,.5); box-shadow:0 0 0 3px rgba(76,175,80,.1); }
  .field input::placeholder { color:rgba(253,246,227,.2); }

  .auth-btn {
    width:100%; padding:.8rem; border-radius:12px; border:none; cursor:pointer; margin-top:.5rem;
    background:linear-gradient(135deg,var(--leaf),var(--leaf-bright));
    color:#fff; font-family:'Syne'; font-weight:700; font-size:.95rem;
    transition:all .25s; box-shadow:0 4px 20px rgba(76,175,80,.25);
  }
  .auth-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(76,175,80,.4); }

  .auth-footer { text-align:center; margin-top:1.25rem; font-size:.82rem; color:rgba(253,246,227,.4); }
  .auth-link   { color:var(--leaf-bright); cursor:pointer; text-decoration:underline; }
`;

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");

  const handle = (e) => {
    e.preventDefault();
    onLogin?.({ email, password: pass });
  };

  return (
    <>
      <style>{css}</style>
      <div className="auth-root">
        <div className="auth-box">
          <div className="auth-logo">🌿 SITNOVATE</div>
          <div className="auth-sub">Smart Farming Platform</div>
          <div className="auth-title">Welcome back 👋</div>

          <form onSubmit={handle}>
            <div className="field">
              <label>Email / Mobile</label>
              <input
                type="text" placeholder="farmer@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password" placeholder="••••••••"
                value={pass} onChange={(e) => setPass(e.target.value)}
              />
            </div>
            <button className="auth-btn" type="submit">Sign In →</button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <span className="auth-link" onClick={onSwitch}>Register</span>
          </div>
        </div>
      </div>
    </>
  );
}