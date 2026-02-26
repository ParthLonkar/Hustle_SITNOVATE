import { useState } from "react";
import { useAuth } from "../context/AuthContext";

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
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">AGRiCHAIN</div>
        <h2>Welcome back.</h2>
        <p>Your personalized harvest and market intelligence is waiting. Log in to see today's recommendations.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h3>Sign in</h3>
          <p>Enter your credentials to continue</p>
          <div className="field"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div>
          <div className="field"><label>Password</label><input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="********" /></div>
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? "Signing in..." : "Sign In ->"}</button>
          <div className="auth-switch">Don't have an account? <span onClick={onSwitch}>Register here</span></div>
        </div>
      </div>
    </div>
  );
}
