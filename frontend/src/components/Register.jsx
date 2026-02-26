import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Register({ onSuccess, onSwitch }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", region: "", role: "farmer", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await register(form);
      onSuccess();
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-left-logo">Agri रक्षक</div>
        <h2>Join thousands of farmers earning more.</h2>
        <p>Create your account and get AI-powered market intelligence tailored to your region and crops.</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h3>Create account</h3>
          <p>Get started in under a minute</p>
          <div className="field"><label>Full Name</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ramesh Patil" /></div>
          <div className="field"><label>Email</label><input value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" /></div>
          <div className="field"><label>Region (State)</label><input value={form.region} onChange={e => set("region", e.target.value)} placeholder="Maharashtra" /></div>
          <div className="field"><label>Role</label><select value={form.role} onChange={e => set("role", e.target.value)}><option value="farmer">Farmer</option><option value="trader">Trader</option><option value="admin">Admin</option></select></div>
          <div className="field"><label>Password</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Create a password" /></div>
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? "Creating..." : "Create Account ->"}</button>
          <div className="auth-switch">Already have an account? <span onClick={onSwitch}>Sign in</span></div>
        </div>
      </div>
    </div>
  );
}
