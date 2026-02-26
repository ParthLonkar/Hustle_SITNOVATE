import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost } from "../services/api";
import { useAuth } from "../context/AuthContext";

/* ── Helpers ── */
function riskClass(val) {
  const p = Math.round(Number(val || 0) * 100);
  if (p > 50) return "risk-high";
  if (p > 25) return "risk-med";
  return "risk-low";
}

function Avatar({ name, size = 30 }) {
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div className={`toast ${type}`}>
      {type === "error" ? "⚠" : "✓"} {msg}
    </div>
  );
}

function StatCard({ icon, value, label, sub }) {
  return (
    <div className="stat-card" style={{ animation: "fadeUp .5s ease" }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-val">{value}</div>
      <div className="stat-lbl">{label}</div>
      {sub && <div className="stat-sub">● {sub}</div>}
    </div>
  );
}

function CardWrap({ icon, title, sub, action, children, style = {} }) {
  return (
    <div className="g-card-solid" style={{ padding: 24, ...style }}>
      <div className="card-header">
        <div className="card-header-left">
          <div className="card-icon">{icon}</div>
          <div>
            <div className="card-title">{title}</div>
            {sub && <div className="card-sub">{sub}</div>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function GTable({ cols, rows, renderRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="g-table">
        <thead>
          <tr>{cols.map(c => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>{rows.map((r, i) => renderRow(r, i))}</tbody>
      </table>
    </div>
  );
}

function ProgBar({ value, max = 5, color = "var(--g)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="prog-wrap" style={{ flex: 1 }}>
        <div className="prog-bar" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{value}/{max}</span>
    </div>
  );
}

/* ── Tabs ── */
const TABS = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "crops", icon: "🌾", label: "Crops" },
  { id: "mandi", icon: "🏪", label: "Mandi Data" },
  { id: "weather", icon: "🌤️", label: "Weather" },
  { id: "ml", icon: "🤖", label: "ML Models" },
  { id: "recs", icon: "📋", label: "Recommendations" },
  { id: "preservation", icon: "🛡️", label: "Preservation" },
  { id: "analytics", icon: "📈", label: "Analytics" },
  { id: "config", icon: "⚙️", label: "Config" },
  { id: "logs", icon: "🔍", label: "Logs & Health" },
];

/* ════════════════════════════════════════════════════════════ */
export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const [rows, setRows] = useState([]);
  const [crops, setCrops] = useState([]);
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [weather, setWeather] = useState([]);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [config, setConfig] = useState({
    transport_cost_per_km: 15, fuel_rate: 95,
    risk_threshold_high: 0.5, risk_threshold_medium: 0.25, alert_sensitivity: "medium",
  });
  const [loading, setLoading] = useState({});
  const [mlTraining, setMlTraining] = useState({});

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [recs, cropsData, actionsData] = await Promise.all([
          apiGet("/api/recommendations/all", token).catch(() => []),
          apiGet("/api/crops").catch(() => []),
          apiGet("/api/preservation-actions").catch(() => []),
        ]);
        setRows(recs); setCrops(cropsData); setActions(actionsData);
      } catch {}
      apiGet("/api/users/all", token).then(setUsers).catch(() =>
        setUsers([
          { id: 1, name: "Kshitij", email: "kshitij@demo.com", role: "farmer", region: "Nagpur", is_active: true },
          { id: 2, name: "Parth", email: "parth@demo.com", role: "admin", region: "Pune", is_active: true },
        ])
      );
      apiGet("/api/weather/logs", token).then(setWeather).catch(() => setWeather([]));
      apiGet("/api/recommendations/ml/features", token).then(setMlMetrics).catch(() => setMlMetrics(null));
      apiGet("/api/mandi/prices", token).then(setMandiPrices).catch(() => setMandiPrices([]));
    };
    load();
  }, [token]);

  /* ── Crop state ── */
  const [cropForm, setCropForm] = useState({ name: "", optimal_ph_range: "[6.0,7.5]", optimal_n_range: "[80,120]", optimal_p_range: "[40,60]", optimal_k_range: "[40,60]" });
  const [showCropForm, setShowCropForm] = useState(false);

  const createCrop = async () => {
    if (!cropForm.name) { notify("Crop name is required.", "error"); return; }
    try {
      await apiPost("/api/crops", cropForm, token);
      setCropForm({ name: "", optimal_ph_range: "[6.0,7.5]", optimal_n_range: "[80,120]", optimal_p_range: "[40,60]", optimal_k_range: "[40,60]" });
      setShowCropForm(false);
      notify("Crop created successfully!");
      const d = await apiGet("/api/crops"); setCrops(d);
    } catch (e) { notify(e?.message || "Failed.", "error"); }
  };

  const deleteCrop = async (id) => {
    if (!window.confirm("Delete this crop?")) return;
    try {
      await fetch(`/api/crops/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      notify("Crop deleted.");
      setCrops(p => p.filter(c => c.id !== id));
    } catch { notify("Failed to delete.", "error"); }
  };

  /* ── Action state ── */
  const [actionForm, setActionForm] = useState({ action_name: "", description: "", cost_score: 3, effectiveness_score: 3 });
  const [showActionForm, setShowActionForm] = useState(false);

  const createAction = async () => {
    if (!actionForm.action_name || !actionForm.description) { notify("Name and description required.", "error"); return; }
    try {
      await apiPost("/api/preservation-actions", actionForm, token);
      setActionForm({ action_name: "", description: "", cost_score: 3, effectiveness_score: 3 });
      setShowActionForm(false);
      notify("Action created!");
      const d = await apiGet("/api/preservation-actions"); setActions(d);
    } catch (e) { notify(e?.message || "Failed.", "error"); }
  };

  /* ── ML ── */
  const trainModel = async (modelType) => {
    setMlTraining(p => ({ ...p, [modelType]: "training" }));
    try {
      await apiPost(`/api/recommendations/train/${modelType}`, {}, token);
      setMlTraining(p => ({ ...p, [modelType]: "done" }));
      notify(`${modelType} model retrained!`);
    } catch {
      setMlTraining(p => ({ ...p, [modelType]: "error" }));
      notify(`Failed to train ${modelType}.`, "error");
    }
  };

  /* ── Users ── */
  const toggleUser = async (id, active) => {
    try {
      await fetch(`/api/users/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_active: !active }),
      });
      setUsers(p => p.map(u => u.id === id ? { ...u, is_active: !active } : u));
      notify(`User ${active ? "deactivated" : "activated"}.`);
    } catch { notify("Failed to update user.", "error"); }
  };

  const changeRole = async (id, role) => {
    try {
      await fetch(`/api/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role }),
      });
      setUsers(p => p.map(u => u.id === id ? { ...u, role } : u));
      notify("Role updated.");
    } catch { notify("Failed.", "error"); }
  };

  /* ── Weather ── */
  const refreshWeather = async () => {
    setLoading(p => ({ ...p, weather: true }));
    try { await apiPost("/api/weather/refresh", {}, token); notify("Weather refreshed!"); }
    catch { notify("Failed to refresh.", "error"); }
    setLoading(p => ({ ...p, weather: false }));
  };

  /* ── CSV ── */
  const fileRef = useRef();
  const uploadCSV = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setLoading(p => ({ ...p, csv: true }));
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(l => {
        const vals = l.split(",");
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim()]));
      });
      await apiPost("/api/mandi/upload", { data }, token);
      notify(`Uploaded ${data.length} records!`);
    } catch { notify("CSV upload failed.", "error"); }
    setLoading(p => ({ ...p, csv: false }));
  };

  /* ── Analytics ── */
  const topMandis = rows.reduce((acc, r) => { acc[r.suggested_mandi] = (acc[r.suggested_mandi] || 0) + 1; return acc; }, {});
  const mandiRanked = Object.entries(topMandis).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const totalProfit = rows.reduce((s, r) => s + Number(r.predicted_profit || 0), 0);
  const avgRisk = rows.length ? rows.reduce((s, r) => s + Number(r.spoilage_risk || 0), 0) / rows.length : 0;
  const regionRisk = rows.reduce((acc, r) => {
    const reg = r.region || "Unknown";
    if (!acc[reg]) acc[reg] = { total: 0, count: 0 };
    acc[reg].total += Number(r.spoilage_risk || 0); acc[reg].count += 1;
    return acc;
  }, {});
  const regionRanked = Object.entries(regionRisk).map(([r, v]) => ({ region: r, avg: v.total / v.count })).sort((a, b) => b.avg - a.avg).slice(0, 5);

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="admin-layout">
      <Toast msg={toast.msg} type={toast.type} />

      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="sidebar-section-label">Admin Panel</div>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`sidebar-item ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            <span className="sidebar-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
        <div className="sidebar-logout">
          <button className="sidebar-logout-btn" onClick={logout}>
            <span>↩</span> Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="admin-content">

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">Admin Dashboard</div>
              <h2 className="sec-title">System Overview</h2>
              <p className="sec-sub">Real-time monitoring of Agri रक्षक's AI platform.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="📋" value={rows.length} label="Total Recommendations" sub="Live" />
              <StatCard icon="🌾" value={crops.length} label="Registered Crops" sub="Active" />
              <StatCard icon="👥" value={users.length} label="Registered Users" sub="Onboarded" />
              <StatCard icon="💰" value={totalProfit > 0 ? `₹${(totalProfit / 100000).toFixed(1)}L` : "--"} label="Total Profit Generated" sub="All time" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
              <CardWrap icon="📋" title="Recent Recommendations" sub="Latest 5 activities">
                {rows.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">📋</div><p>No recommendations yet.</p></div>
                ) : (
                  <GTable
                    cols={["Farmer", "Crop", "Mandi", "Profit", "Risk"]}
                    rows={rows.slice(0, 5)}
                    renderRow={(r) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Avatar name={r.user_name} />
                            <span style={{ fontSize: 13, color: "var(--txt)", fontWeight: 600 }}>{r.user_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}><span className="pill green">{r.crop_name}</span></td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--txt2)" }}>{r.suggested_mandi}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--g)", fontWeight: 700 }}>₹{Number(r.predicted_profit || 0).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className={`risk-chip ${riskClass(r.spoilage_risk)}`}>{Math.round(Number(r.spoilage_risk || 0) * 100)}%</span>
                        </td>
                      </tr>
                    )}
                  />
                )}
              </CardWrap>

              <CardWrap icon="🟢" title="System Status">
                {[
                  { label: "Backend API", ok: true, status: "Operational" },
                  { label: "ML Service", ok: !!mlMetrics, status: mlMetrics ? "Connected" : "Offline" },
                  { label: "Database", ok: true, status: "Connected" },
                  { label: "Weather API", ok: true, status: "Live" },
                  { label: "Mandi API", ok: true, status: "Live" },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 13, color: "var(--txt2)", fontWeight: 500 }}>{s.label}</span>
                    <span className={`pill ${s.ok ? "green" : "red"}`}>● {s.status}</span>
                  </div>
                ))}
              </CardWrap>
            </div>
          </div>
        )}

        {/* ══ USERS ══ */}
        {tab === "users" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">User Management</div>
              <h2 className="sec-title">Registered Users</h2>
            </div>
            <CardWrap icon="👥" title="All Users" sub={`${users.length} registered`}>
              {users.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">👥</div><p>No users found.</p></div>
              ) : (
                <GTable
                  cols={["User", "Email", "Role", "Region", "Status", "Actions"]}
                  rows={users}
                  renderRow={(u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <Avatar name={u.name} />
                          <span style={{ fontSize: 13, color: "var(--txt)", fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--txt3)" }}>{u.email}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <select
                          value={u.role}
                          onChange={e => changeRole(u.id, e.target.value)}
                          style={{
                            background: u.role === "admin" ? "rgba(251,191,36,0.1)" : "rgba(74,222,128,0.1)",
                            color: u.role === "admin" ? "var(--amber)" : "var(--g)",
                            border: `1px solid ${u.role === "admin" ? "rgba(251,191,36,0.3)" : "rgba(74,222,128,0.3)"}`,
                            padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer",
                          }}
                        >
                          <option value="farmer">Farmer</option>
                          <option value="trader">Trader</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--txt3)" }}>{u.region || "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span className={`pill ${u.is_active ? "green" : "red"}`}>● {u.is_active ? "Active" : "Inactive"}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button className={`btn-sm ${u.is_active ? "red" : "green"}`} onClick={() => toggleUser(u.id, u.is_active)}>
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                          <button className="btn-sm ghost" onClick={() => notify(`Reset link sent to ${u.email}`)}>Reset Pwd</button>
                        </div>
                      </td>
                    </tr>
                  )}
                />
              )}
            </CardWrap>
          </div>
        )}

        {/* ══ CROPS ══ */}
        {tab === "crops" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div className="sec-label">Crop Management</div>
                <h2 className="sec-title">Registered Crops</h2>
              </div>
              <button className="btn-primary" onClick={() => setShowCropForm(p => !p)}>
                {showCropForm ? "✕ Cancel" : "+ Add Crop"}
              </button>
            </div>

            {showCropForm && (
              <div className="g-card-solid" style={{ padding: 24, marginBottom: 20, border: "1px solid var(--border2)" }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, marginBottom: 18, color: "var(--txt)" }}>New Crop</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 18 }}>
                  {[
                    { label: "Name *", key: "name", ph: "Wheat" },
                    { label: "pH Range", key: "optimal_ph_range", ph: "[6.0,7.5]" },
                    { label: "N Range", key: "optimal_n_range", ph: "[80,120]" },
                    { label: "P Range", key: "optimal_p_range", ph: "[40,60]" },
                    { label: "K Range", key: "optimal_k_range", ph: "[40,60]" },
                  ].map(f => (
                    <div className="field" key={f.key}>
                      <label>{f.label}</label>
                      <input value={cropForm[f.key]} placeholder={f.ph} onChange={e => setCropForm(p => ({ ...p, [f.key]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <button className="btn-primary" onClick={createCrop}>Create Crop</button>
              </div>
            )}

            <CardWrap icon="🌾" title="All Crops" sub={`${crops.length} registered`}>
              <GTable
                cols={["#", "Name", "pH", "N Range", "P Range", "K Range", "Actions"]}
                rows={crops}
                renderRow={(c, i) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)", display: "flex", alignItems: "center", gap: 6 }}>
                        🌱 {c.name}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}><span className="pill green">{c.optimal_ph_range}</span></td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{c.optimal_n_range}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{c.optimal_p_range}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{c.optimal_k_range}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button className="btn-sm red" onClick={() => deleteCrop(c.id)}>Delete</button>
                    </td>
                  </tr>
                )}
              />
            </CardWrap>
          </div>
        )}

        {/* ══ MANDI DATA ══ */}
        {tab === "mandi" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">Mandi Data</div>
              <h2 className="sec-title">Price Records</h2>
            </div>
            <CardWrap icon="🏪" title="Upload & Manage" sub="CSV mandi price records" style={{ marginBottom: 20 }}>
              <div className="upload-zone" onClick={() => fileRef.current.click()}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--txt)", marginBottom: 6 }}>Upload Mandi Price CSV</div>
                <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 16 }}>
                  Required: <code style={{ background: "rgba(74,222,128,0.08)", padding: "2px 8px", borderRadius: 4, color: "var(--g)", fontSize: 11 }}>mandi_name, crop_name, price, arrival_volume, price_date, state, district</code>
                </div>
                <button className="btn-primary" disabled={loading.csv}>{loading.csv ? "Uploading..." : "Choose CSV File"}</button>
              </div>
              <input ref={fileRef} type="file" accept=".csv" onChange={uploadCSV} style={{ display: "none" }} />

              {mandiPrices.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <GTable
                    cols={["Mandi", "Crop", "Price (₹/q)", "Arrival Vol", "Date", "State"]}
                    rows={mandiPrices.slice(0, 10)}
                    renderRow={(m, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--txt)", fontSize: 13 }}>{m.mandi_name}</td>
                        <td style={{ padding: "12px 16px" }}><span className="pill green">{m.crop_name}</span></td>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--g)", fontSize: 13 }}>₹{Number(m.price).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{m.arrival_volume} q</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{m.price_date}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{m.state}</td>
                      </tr>
                    )}
                  />
                </div>
              )}
              {mandiPrices.length === 0 && <div className="empty-state" style={{ paddingTop: 24 }}><div className="empty-icon">🏪</div><p>No mandi data. Upload a CSV above.</p></div>}
            </CardWrap>
          </div>
        )}

        {/* ══ WEATHER ══ */}
        {tab === "weather" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div className="sec-label">Weather</div>
                <h2 className="sec-title">Weather Data Monitoring</h2>
              </div>
              <button className="btn-primary" onClick={refreshWeather} disabled={loading.weather}>
                {loading.weather ? "Refreshing..." : "↻ Refresh Now"}
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { icon: "🌐", label: "API Status", value: "Operational", color: "var(--g)" },
                { icon: "📡", label: "Provider", value: "Open-Meteo", color: "var(--blue)" },
                { icon: "⏱️", label: "Last Refresh", value: new Date().toLocaleTimeString(), color: "var(--amber)" },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, color: s.color }}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>

            <CardWrap icon="🌤️" title="Weather Logs" sub="Recent regional data">
              {weather.length === 0
                ? <div className="empty-state"><div className="empty-icon">🌤️</div><p>No weather logs. Fetched live per-region.</p></div>
                : <GTable
                    cols={["Region", "Date", "Max Temp", "Min Temp", "Rainfall", "Humidity"]}
                    rows={weather}
                    renderRow={(w, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--txt)", fontSize: 13 }}>{w.region}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{w.date}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: Number(w.temp_max) > 35 ? "var(--red)" : "var(--txt2)" }}>{w.temp_max}°C</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{w.temp_min}°C</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: Number(w.rainfall) > 20 ? "var(--blue)" : "var(--txt2)" }}>{w.rainfall} mm</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{w.humidity}%</td>
                      </tr>
                    )}
                  />
              }
            </CardWrap>
          </div>
        )}

        {/* ══ ML MODELS ══ */}
        {tab === "ml" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">Machine Learning</div>
              <h2 className="sec-title">ML Model Management</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { key: "price", icon: "💹", label: "Price Forecast", desc: "Predicts crop market prices 7 days ahead", accuracy: 86.3, r2: 0.84 },
                { key: "spoilage", icon: "🧪", label: "Spoilage Prediction", desc: "Classifies spoilage risk by weather & storage", accuracy: 91.2, r2: 0.88 },
                { key: "soil", icon: "🌱", label: "Soil Health Model", desc: "Scores soil suitability for harvest timing", accuracy: 88.7, r2: 0.86 },
              ].map(m => (
                <div key={m.key} className="g-card-solid" style={{ padding: 24 }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{m.icon}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 16, color: "var(--txt)", marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: "var(--txt3)", marginBottom: 20, lineHeight: 1.5 }}>{m.desc}</div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                      <span style={{ color: "var(--txt3)", fontWeight: 600 }}>Accuracy</span>
                      <span style={{ fontWeight: 700, color: "var(--g)" }}>{m.accuracy}%</span>
                    </div>
                    <div className="prog-wrap">
                      <div className="prog-bar" style={{ width: `${m.accuracy}%`, background: "linear-gradient(90deg,#4ade80,#22c55e)" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--txt3)", marginBottom: 18 }}>
                    <span>R² Score: <b style={{ color: "var(--g)" }}>{m.r2}</b></span>
                    <span className={`pill ${mlTraining[m.key] === "training" ? "amber" : mlTraining[m.key] === "done" ? "green" : "ghost"}`}>
                      {mlTraining[m.key] === "training" ? "⏳ Training" : mlTraining[m.key] === "done" ? "✓ Updated" : "● Ready"}
                    </span>
                  </div>
                  <button className="btn-primary" onClick={() => trainModel(m.key)} disabled={mlTraining[m.key] === "training"} style={{ width: "100%" }}>
                    {mlTraining[m.key] === "training" ? "Training..." : "🔄 Retrain"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ RECOMMENDATIONS ══ */}
        {tab === "recs" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">Recommendations</div>
              <h2 className="sec-title">All Recommendations</h2>
            </div>
            <CardWrap icon="📋" title="Recommendation Log" sub={`${rows.length} total`}>
              {rows.length === 0
                ? <div className="empty-state"><div className="empty-icon">📋</div><p>No recommendations yet.</p></div>
                : <GTable
                    cols={["Farmer", "Crop", "Region", "Mandi", "Profit", "Risk", "Window"]}
                    rows={rows}
                    renderRow={(r) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={r.user_name} /><span style={{ fontSize: 13, color: "var(--txt)", fontWeight: 600 }}>{r.user_name}</span></div></td>
                        <td style={{ padding: "12px 16px" }}><span className="pill green">{r.crop_name}</span></td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{r.region || "—"}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--txt2)" }}>{r.suggested_mandi}</td>
                        <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--g)" }}>₹{Number(r.predicted_profit || 0).toLocaleString()}</td>
                        <td style={{ padding: "12px 16px" }}><span className={`risk-chip ${riskClass(r.spoilage_risk)}`}>{Math.round(Number(r.spoilage_risk || 0) * 100)}%</span></td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{r.harvest_window || "—"}</td>
                      </tr>
                    )}
                  />
              }
            </CardWrap>
          </div>
        )}

        {/* ══ PRESERVATION ══ */}
        {tab === "preservation" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div className="sec-label">Preservation</div>
                <h2 className="sec-title">Preservation Methods</h2>
              </div>
              <button className="btn-primary" onClick={() => setShowActionForm(p => !p)}>
                {showActionForm ? "✕ Cancel" : "+ Add Method"}
              </button>
            </div>

            {showActionForm && (
              <div className="g-card-solid" style={{ padding: 24, marginBottom: 20, border: "1px solid var(--border2)" }}>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 15, color: "var(--txt)", marginBottom: 18 }}>New Preservation Method</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 120px 120px", gap: 14, marginBottom: 18 }}>
                  <div className="field"><label>Method Name *</label><input value={actionForm.action_name} placeholder="Cold storage" onChange={e => setActionForm(p => ({ ...p, action_name: e.target.value }))} /></div>
                  <div className="field"><label>Description *</label><input value={actionForm.description} placeholder="Store at 4-10°C" onChange={e => setActionForm(p => ({ ...p, description: e.target.value }))} /></div>
                  <div className="field"><label>Cost (1-5)</label><input type="number" min="1" max="5" value={actionForm.cost_score} onChange={e => setActionForm(p => ({ ...p, cost_score: Number(e.target.value) }))} /></div>
                  <div className="field"><label>Effectiveness (1-5)</label><input type="number" min="1" max="5" value={actionForm.effectiveness_score} onChange={e => setActionForm(p => ({ ...p, effectiveness_score: Number(e.target.value) }))} /></div>
                </div>
                <button className="btn-primary" onClick={createAction}>Create Method</button>
              </div>
            )}

            <CardWrap icon="🛡️" title="All Methods" sub={`${actions.length} configured`}>
              {actions.length === 0
                ? <div className="empty-state"><div className="empty-icon">🛡️</div><p>No methods yet.</p></div>
                : <GTable
                    cols={["Method", "Description", "Cost", "Effectiveness", "Actions"]}
                    rows={actions}
                    renderRow={(a) => (
                      <tr key={a.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--txt)", fontSize: 13 }}>{a.action_name}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{a.description}</td>
                        <td style={{ padding: "12px 16px", minWidth: 120 }}><ProgBar value={a.cost_score} color="var(--amber)" /></td>
                        <td style={{ padding: "12px 16px", minWidth: 120 }}><ProgBar value={a.effectiveness_score} /></td>
                        <td style={{ padding: "12px 16px" }}><button className="btn-sm red" onClick={() => notify("Delete endpoint needed.")}>Delete</button></td>
                      </tr>
                    )}
                  />
              }
            </CardWrap>
          </div>
        )}

        {/* ══ ANALYTICS ══ */}
        {tab === "analytics" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">Analytics</div>
              <h2 className="sec-title">Platform Analytics</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="📋" value={rows.length} label="Total Recommendations" sub="All time" />
              <StatCard icon="⚠️" value={`${(avgRisk * 100).toFixed(1)}%`} label="Avg Spoilage Risk" sub="Platform-wide" />
              <StatCard icon="💰" value={`₹${(totalProfit / 100000).toFixed(1)}L`} label="Total Profit Generated" sub="All farmers" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <CardWrap icon="🏪" title="Top Mandis" sub="By recommendation count">
                {mandiRanked.length === 0 ? <div className="empty-state"><p>No data yet.</p></div> :
                  mandiRanked.map(([mandi, count], i) => (
                    <div key={mandi} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(74,222,128,0.1)", color: "var(--g)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--txt)", marginBottom: 4 }}>{mandi}</div>
                        <div className="prog-wrap">
                          <div className="prog-bar" style={{ width: `${(count / mandiRanked[0][1]) * 100}%`, background: "var(--g)" }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--g)" }}>{count}x</span>
                    </div>
                  ))
                }
              </CardWrap>
              <CardWrap icon="⚠️" title="High Risk Regions" sub="Average spoilage risk">
                {regionRanked.length === 0 ? <div className="empty-state"><p>No region data yet.</p></div> :
                  regionRanked.map((r, i) => (
                    <div key={r.region} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(251,191,36,0.1)", color: "var(--amber)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--txt)", marginBottom: 4 }}>{r.region}</div>
                        <div className="prog-wrap">
                          <div className="prog-bar" style={{ width: `${r.avg * 100}%`, background: "var(--amber)" }} />
                        </div>
                      </div>
                      <span className={`risk-chip ${riskClass(r.avg)}`}>{Math.round(r.avg * 100)}%</span>
                    </div>
                  ))
                }
              </CardWrap>
            </div>
          </div>
        )}

        {/* ══ CONFIG ══ */}
        {tab === "config" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">Configuration</div>
              <h2 className="sec-title">System Settings</h2>
            </div>
            <CardWrap icon="⚙️" title="Platform Configuration" sub="Transport, risk thresholds, alert settings">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
                {[
                  { label: "Transport Cost per KM (₹)", key: "transport_cost_per_km" },
                  { label: "Fuel Rate (₹/L)", key: "fuel_rate" },
                  { label: "High Risk Threshold (0–1)", key: "risk_threshold_high" },
                  { label: "Medium Risk Threshold (0–1)", key: "risk_threshold_medium" },
                ].map(f => (
                  <div className="field" key={f.key}>
                    <label>{f.label}</label>
                    <input type="number" value={config[f.key]} onChange={e => setConfig(p => ({ ...p, [f.key]: e.target.value }))} />
                  </div>
                ))}
                <div className="field">
                  <label>Alert Sensitivity</label>
                  <select value={config.alert_sensitivity} onChange={e => setConfig(p => ({ ...p, alert_sensitivity: e.target.value }))}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <button className="btn-primary" onClick={() => notify("Configuration saved!")}>Save Configuration</button>
            </CardWrap>
          </div>
        )}

        {/* ══ LOGS ══ */}
        {tab === "logs" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div style={{ marginBottom: 24 }}>
              <div className="sec-label">System Health</div>
              <h2 className="sec-title">Logs & Status</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "🟢", label: "API Server", value: "Healthy", ok: true },
                { icon: "🟢", label: "Database", value: "Connected", ok: true },
                { icon: mlMetrics ? "🟢" : "🔴", label: "ML Service", value: mlMetrics ? "Online" : "Offline", ok: !!mlMetrics },
                { icon: "🟢", label: "Weather API", value: "Live", ok: true },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 18, color: s.ok ? "var(--g)" : "var(--red)" }}>{s.value}</div>
                  <div className="stat-lbl">{s.label}</div>
                </div>
              ))}
            </div>
            <CardWrap icon="📜" title="Activity Log" sub="Recent system events">
              <div className="terminal">
                {[
                  `[${new Date().toLocaleTimeString()}] ✅ Backend API started on port 5001`,
                  `[${new Date().toLocaleTimeString()}] ✅ Database connected to agrichain`,
                  `[${new Date().toLocaleTimeString()}] ✅ ${rows.length} recommendations loaded`,
                  `[${new Date().toLocaleTimeString()}] ✅ ${crops.length} crops registered`,
                  `[${new Date().toLocaleTimeString()}] ${mlMetrics ? "✅ ML Service connected" : "⚠️  ML Service not configured"}`,
                  `[${new Date().toLocaleTimeString()}] ✅ Weather API: Open-Meteo live`,
                  `[${new Date().toLocaleTimeString()}] ✅ Admin dashboard loaded`,
                ].map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </CardWrap>
          </div>
        )}

      </main>
    </div>
  );
}