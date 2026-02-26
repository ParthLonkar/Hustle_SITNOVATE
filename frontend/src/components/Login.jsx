import { useState, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import logo from "../assets/AgriRakshak.png";

export default function Login({ onSuccess, onSwitch }) {
  const { login } = useAuth();
  const { t } = useContext(LanguageContext);
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
          }}>AR</div>
          AgriRakshak
        </div>

        <h2>{t('welcomeBack')}</h2>
        <p style={{ marginBottom: 40 }}>
          {t('loginSubtitle')}
        </p>

        {/* Feature list */}
        {[
          t('feature1'),
          t('feature2'),
          t('feature3'),
          t('feature4'),
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
            {t('todaysMarket')}
          </div>
          {[
            { crop: t('wheat'), mandi: t('nagpurApmc'), price: "₹2,180/q", trend: "+3.2%" },
            { crop: t('soybean'), mandi: t('puneApmc'), price: "₹4,450/q", trend: "+1.8%" },
            { crop: t('cotton'), mandi: t('aurangabad'), price: "₹6,200/q", trend: "-0.5%" },
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
            }}>AR</div>
            <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 14, color: "var(--txt)" }}>
              AGRi<span style={{ color: "var(--g)" }}>Rakshak</span>
            </span>
          </div>

          <h3>{t('signIn')}</h3>
          <p>{t('enterCredentials')}</p>

          <div className="auth-fields">
            <div className="field">
              <label>{t('email')}</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="you@example.com"
                type="email"
              />
            </div>
            <div className="field">
              <label>{t('password')}</label>
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
            {loading ? t('signingIn') : `${t('signIn')} →`}
          </button>

          <div className="auth-switch">
            {t('noAccount')}{" "}
            <span onClick={onSwitch}>{t('registerHere')}</span>
          </div>

          <div style={{ marginTop: 24, padding: 14, borderRadius: 10, background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.1)", fontSize: 12, color: "var(--txt3)", textAlign: "center" }}>
            🔒 {t('secured')} · {t('dataSource')}
          </div>
        </div>
      </div>
    </div>
  );
}
