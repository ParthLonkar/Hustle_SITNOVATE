import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/AgriRakshak.png";

export default function Login({ onSuccess, onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
      onSuccess();
    } catch (err) {
      setError(err?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="auth-wrap">
      {/* ── Left panel ── */}
      <div className="auth-left">
        {/* Logo */}
        <div className="auth-left-logo">
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: "linear-gradient(135deg,#166534,#14532d)",
            border: "1px solid rgba(74,222,128,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 14, color: "#4ade80",
          }}>AC</div>
          Agriरक्षक
        </div>

        <h2>Welcome<br />back.</h2>
        <p style={{ marginBottom: 40 }}>
          Your personalized harvest and market intelligence is waiting.
          Log in to see today's AI recommendations.
        </p>

        {/* Feature list */}
        {[
          "7-day weather harvest windows",
          "Live mandi price predictions",
          "Transport cost optimisation",
          "Explainable AI insights",
        ].map((f) => (
          <div className="auth-feat" key={f}>
            <div className="auth-feat-dot" />
            <span>{f}</span>
          </div>
        ))}

        {/* Decorative crop illustration using CSS */}
        <div style={{
          marginTop: 48, padding: 20, borderRadius: 16,
          background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.12)",
        }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--g)", marginBottom: 10 }}>
            Today's Market Pulse
          </div>
          {[
            { crop: "Wheat", mandi: "Nagpur APMC", price: "₹2,180/q", trend: "+3.2%" },
            { crop: "Soybean", mandi: "Pune APMC", price: "₹4,450/q", trend: "+1.8%" },
            { crop: "Cotton", mandi: "Aurangabad", price: "₹6,200/q", trend: "-0.5%" },
          ].map((item) => (
            <div key={item.crop} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(74,222,128,0.08)" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{item.crop}</div>
                <div style={{ fontSize: 11, color: "var(--txt3)" }}>{item.mandi}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--txt)" }}>{item.price}</div>
                <div style={{ fontSize: 11, color: item.trend.startsWith("+") ? "var(--g)" : "var(--red)", fontWeight: 600 }}>{item.trend}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="auth-right">
        <div className="auth-card" style={{ animation: "fadeUp .6s ease" }}>
          {/* Mini logo for mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 7,
              background: "linear-gradient(135deg,#166534,#14532d)",
              border: "1px solid rgba(74,222,128,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 10, color: "#4ade80",
            }}>AC</div>
            <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 14, color: "var(--txt)" }}>
              AGRi<span style={{ color: "var(--g)" }}>रक्षक</span>
            </span>
          </div>

          <h3>Sign in</h3>
          <p>Enter your credentials to continue</p>

          <div className="auth-fields">
            <div className="field">
              <label>Email address</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                onKeyDown={handleKey}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}

          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div className="auth-switch">
            Don't have an account?{" "}
            <span onClick={onSwitch}>Register here</span>
          </div>

          <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.1)", fontSize: 12, color: "var(--txt3)", textAlign: "center" }}>
            🔒 Secured · Data sourced from Agmarknet & Open-Meteo
          </div>
        </div>
      </div>
    </div>
  );
}