import { useState, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";

export default function Register({ onSuccess, onSwitch }) {
  const { register } = useAuth();
  const { t } = useContext(LanguageContext);
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
        <div className="auth-left-logo">AgriRakshak</div>
        <h2>{t('joinThousands')}</h2>
        <p>{t('registerSubtitle')}</p>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h3>{t('createAccount')}</h3>
          <p>{t('getStartedMinute')}</p>
          <div className="field"><label>{t('name')}</label><input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ramesh Patil" /></div>
          <div className="field"><label>{t('email')}</label><input value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" /></div>
          <div className="field"><label>{t('regionState')}</label><input value={form.region} onChange={e => set("region", e.target.value)} placeholder="Maharashtra" /></div>
          <div className="field"><label>{t('role')}</label><select value={form.role} onChange={e => set("role", e.target.value)}>
            <option value="farmer">{t('farmer')}</option>
            <option value="trader">{t('trader')}</option>
            <option value="admin">{t('admin')}</option>
          </select></div>
          <div className="field"><label>{t('password')}</label><input type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder={t('createPassword')} /></div>
          {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{error}</div>}
          <button className="btn-submit" onClick={handleSubmit} disabled={loading}>{loading ? t('creatingAccount') : `${t('createAccount')} ->`}</button>
          <div className="auth-switch">{t('hasAccount')} <span onClick={onSwitch}>{t('loginHere')}</span></div>
        </div>
      </div>
    </div>
  );
}
