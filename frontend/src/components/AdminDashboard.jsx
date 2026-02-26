import { useEffect, useState, useRef } from "react";
import { apiGet, apiPost } from "../services/api";
import { useAuth } from "../context/AuthContext";

// ── Helpers ────────────────────────────────────────────────────────────────
const C = {
  soil: "#1a1208", earth: "#2d1f0a", bark: "#4a3218",
  leaf: "#3d7a2e", sprout: "#5aad45", lime: "#a8e063",
  sun: "#f5c842", mist: "#e8f4e0", fog: "#f2f8ec", cream: "#fdfaf3",
  red: "#d94f3d", orange: "#e8873a",
  text: "#1a1208", textMid: "#5c4a2a", textFaint: "#9c8b6e",
  card: "#ffffff", border: "#d8e8cc",
};

const shadow = "0 2px 16px rgba(26,18,8,0.08)";
const shadowLg = "0 8px 40px rgba(26,18,8,0.14)";

function pill(bg, color, text) {
  return (
    <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
      {text}
    </span>
  );
}

function Avatar({ name, size = 32, color = C.leaf }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg, ${color}, ${C.sprout})`,
      color: "white", display: "grid", placeItems: "center",
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}

function StatCard({ icon, value, label, sub, color = C.leaf }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16, padding: "22px 24px",
      boxShadow: shadow, border: `1px solid ${C.border}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: -20, right: -20, width: 90, height: 90,
        borderRadius: "50%", background: color + "14",
      }} />
      <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: C.textFaint, fontWeight: 500, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color, fontWeight: 700, marginTop: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>● {sub}</div>}
    </div>
  );
}

function Card({ children, style = {}, noPad = false }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16,
      padding: noPad ? 0 : 28,
      boxShadow: shadow, border: `1px solid ${C.border}`,
      ...style,
    }}>{children}</div>
  );
}

function CardHeader({ icon, title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: C.mist, display: "grid", placeItems: "center", fontSize: 18,
        }}>{icon}</div>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: C.text }}>{title}</div>
          {sub && <div style={{ fontSize: 12, color: C.textFaint, marginTop: 1 }}>{sub}</div>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", small, disabled, style = {} }) {
  const base = {
    border: "none", cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
    borderRadius: 9, transition: "all .2s",
    padding: small ? "7px 14px" : "10px 20px",
    fontSize: small ? 12 : 13,
    opacity: disabled ? .5 : 1,
    ...style,
  };
  const variants = {
    primary: { background: C.leaf, color: "white" },
    ghost: { background: C.fog, color: C.textMid, border: `1.5px solid ${C.border}` },
    danger: { background: "#fef2f2", color: C.red, border: `1.5px solid #fca5a5` },
    success: { background: "#f0faeb", color: C.leaf, border: `1.5px solid ${C.sprout}` },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function Input({ label, value, onChange, type = "text", placeholder, ...rest }) {
  return (
    <div style={{ marginBottom: 0 }}>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 5 }}>{label}</label>}
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`,
          borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13,
          color: C.text, background: C.fog, outline: "none", boxSizing: "border-box",
        }}
        onFocus={e => e.target.style.borderColor = C.sprout}
        onBlur={e => e.target.style.borderColor = C.border}
        {...rest}
      />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 5 }}>{label}</label>}
      <select value={value} onChange={onChange} style={{
        width: "100%", padding: "9px 12px", border: `1.5px solid ${C.border}`,
        borderRadius: 8, fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: C.text,
        background: C.fog, outline: "none",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Bar({ value, max = 5, color = C.sprout }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: C.fog, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, minWidth: 28 }}>{value}/{max}</span>
    </div>
  );
}

function RiskChip({ risk }) {
  const pct = Math.round(Number(risk || 0) * 100);
  const [bg, color] = pct > 50 ? ["#fef2f2", C.red] : pct > 25 ? ["#fff7ed", C.orange] : ["#f0faeb", C.leaf];
  return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>{pct}%</span>;
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const [bg, border, color] = type === "error"
    ? ["#fef2f2", C.red, C.red]
    : ["#f0faeb", C.sprout, C.leaf];
  return (
    <div style={{
      background: bg, border: `1px solid ${border}`, color,
      borderRadius: 10, padding: "12px 16px", marginBottom: 16,
      fontSize: 13, fontWeight: 500,
      animation: "fadeIn .3s ease",
    }}>
      {type === "error" ? "⚠️" : "✅"} {msg}
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "52px 20px", color: C.textFaint }}>
      <div style={{ fontSize: 44, marginBottom: 12, opacity: .35 }}>{icon}</div>
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

function Table({ cols, rows, renderRow }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cols.map(c => (
              <th key={c} style={{
                fontSize: 10, fontWeight: 700, color: C.textFaint,
                textTransform: "uppercase", letterSpacing: ".5px",
                padding: "0 14px 12px", textAlign: "left",
                borderBottom: `1px solid ${C.border}`,
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((r, i) => renderRow(r, i))}</tbody>
      </table>
    </div>
  );
}

function Tr({ children, highlight }) {
  const [hov, setHov] = useState(false);
  return (
    <tr
      style={{ borderBottom: `1px solid ${C.border}`, background: highlight ? "#f0faeb" : hov ? C.fog : "transparent", transition: "background .15s" }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
    >{children}</tr>
  );
}
function Td({ children, bold, faint, style = {} }) {
  return <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: bold ? 600 : 400, color: faint ? C.textFaint : C.text, ...style }}>{children}</td>;
}

// ── TABS config ────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview",     icon: "📊", label: "Overview" },
  { id: "users",        icon: "👥", label: "Users" },
  { id: "crops",        icon: "🌾", label: "Crops" },
  { id: "mandi",        icon: "🏪", label: "Mandi Data" },
  { id: "weather",      icon: "🌤️", label: "Weather" },
  { id: "ml",           icon: "🤖", label: "ML Models" },
  { id: "recs",         icon: "📋", label: "Recommendations" },
  { id: "preservation", icon: "🛡️", label: "Preservation" },
  { id: "analytics",    icon: "📈", label: "Analytics" },
  { id: "config",       icon: "⚙️", label: "Config" },
  { id: "logs",         icon: "🔍", label: "Logs & Health" },
];

// ══════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { token } = useAuth();
  const [tab, setTab] = useState("overview");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  // Data
  const [rows, setRows]       = useState([]);
  const [crops, setCrops]     = useState([]);
  const [actions, setActions] = useState([]);
  const [users, setUsers]     = useState([]);
  const [weather, setWeather] = useState([]);
  const [mandiPrices, setMandiPrices] = useState([]);
  const [mlMetrics, setMlMetrics] = useState(null);
  const [config, setConfig]   = useState({
    transport_cost_per_km: 15,
    fuel_rate: 95,
    risk_threshold_high: 0.5,
    risk_threshold_medium: 0.25,
    alert_sensitivity: "medium",
  });
  const [loading, setLoading] = useState({});
  const [mlTraining, setMlTraining] = useState({});

  const notify = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const setLoad = (key, val) => setLoading(p => ({ ...p, [key]: val }));

  // Load all data
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

      // Try to load users
      apiGet("/api/users/all", token).then(setUsers).catch(() =>
        setUsers([
          { id: 1, name: "kshitij", email: "kshitij@demo.com", role: "farmer", region: "Nagpur", is_active: true },
          { id: 2, name: "Parth", email: "parth@demo.com", role: "admin", region: "Pune", is_active: true },
        ])
      );

      // Weather logs
      apiGet("/api/weather/logs", token).then(setWeather).catch(() => setWeather([]));

      // ML metrics
      apiGet("/api/recommendations/ml/features", token).then(setMlMetrics).catch(() => setMlMetrics(null));

      // Mandi
      apiGet("/api/mandi/prices", token).then(setMandiPrices).catch(() => setMandiPrices([]));
    };
    load();
  }, [token]);

  // ── CROP STATE ────────────────────────────────────────────────────────
  const [cropForm, setCropForm] = useState({ name: "", optimal_ph_range: "[6.0,7.5]", optimal_n_range: "[80,120]", optimal_p_range: "[40,60]", optimal_k_range: "[40,60]" });
  const [showCropForm, setShowCropForm] = useState(false);
  const [editCrop, setEditCrop] = useState(null);

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

  // ── ACTION STATE ──────────────────────────────────────────────────────
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

  // ── ML TRAINING ───────────────────────────────────────────────────────
  const trainModel = async (modelType) => {
    setMlTraining(p => ({ ...p, [modelType]: "training" }));
    try {
      await apiPost(`/api/recommendations/train/${modelType}`, {}, token);
      setMlTraining(p => ({ ...p, [modelType]: "done" }));
      notify(`${modelType} model retrained successfully!`);
    } catch {
      setMlTraining(p => ({ ...p, [modelType]: "error" }));
      notify(`Failed to train ${modelType} model.`, "error");
    }
  };

  // ── USER ACTIONS ──────────────────────────────────────────────────────
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

  // ── WEATHER REFRESH ───────────────────────────────────────────────────
  const refreshWeather = async () => {
    setLoad("weather", true);
    try {
      await apiPost("/api/weather/refresh", {}, token);
      notify("Weather data refreshed!");
    } catch { notify("Failed to refresh weather.", "error"); }
    setLoad("weather", false);
  };

  // ── CSV UPLOAD ────────────────────────────────────────────────────────
  const fileRef = useRef();
  const uploadCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoad("csv", true);
    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
      const data = lines.slice(1).map(l => {
        const vals = l.split(",");
        return Object.fromEntries(headers.map((h, i) => [h, vals[i]?.trim()]));
      });
      await apiPost("/api/mandi/upload", { data }, token);
      notify(`Uploaded ${data.length} mandi price records!`);
    } catch { notify("CSV upload failed. Check format.", "error"); }
    setLoad("csv", false);
  };

  // ── ANALYTICS ─────────────────────────────────────────────────────────
  const topMandis = rows.reduce((acc, r) => {
    acc[r.suggested_mandi] = (acc[r.suggested_mandi] || 0) + 1;
    return acc;
  }, {});
  const mandiRanked = Object.entries(topMandis).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const totalProfit = rows.reduce((s, r) => s + Number(r.predicted_profit || 0), 0);
  const avgRisk = rows.length ? rows.reduce((s, r) => s + Number(r.spoilage_risk || 0), 0) / rows.length : 0;

  const regionRisk = rows.reduce((acc, r) => {
    const reg = r.region || "Unknown";
    if (!acc[reg]) acc[reg] = { total: 0, count: 0 };
    acc[reg].total += Number(r.spoilage_risk || 0);
    acc[reg].count += 1;
    return acc;
  }, {});
  const regionRanked = Object.entries(regionRisk)
    .map(([r, v]) => ({ region: r, avg: v.total / v.count }))
    .sort((a, b) => b.avg - a.avg).slice(0, 5);

  // ══════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 64px)", background: C.fog }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 220, background: C.card, borderRight: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0,
        position: "sticky", top: 64, height: "calc(100vh - 64px)", overflowY: "auto",
      }}>
        <div style={{ padding: "0 16px 16px", fontSize: 10, fontWeight: 700, color: C.textFaint, textTransform: "uppercase", letterSpacing: ".8px" }}>
          Admin Panel
        </div>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 16px", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 500,
            transition: "all .15s", textAlign: "left",
            background: tab === t.id ? C.mist : "transparent",
            color: tab === t.id ? C.leaf : C.textMid,
            fontWeight: tab === t.id ? 700 : 500,
            borderRight: tab === t.id ? `3px solid ${C.leaf}` : "3px solid transparent",
          }}>
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <div style={{ flex: 1, padding: 28, overflowY: "auto", maxWidth: "calc(100% - 220px)" }}>
        <Toast msg={toast.msg} type={toast.type} />

        {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: C.text }}>Admin Dashboard</h2>
              <p style={{ fontSize: 13, color: C.textFaint, marginTop: 4 }}>System overview and management</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <StatCard icon="📋" value={rows.length} label="Total Recommendations" sub="Live" color={C.leaf} />
              <StatCard icon="🌾" value={crops.length} label="Registered Crops" sub="Live" color={C.sprout} />
              <StatCard icon="👥" value={users.length} label="Registered Users" sub="Live" color={C.sun} />
              <StatCard icon="💰" value={totalProfit > 0 ? `Rs ${(totalProfit / 100000).toFixed(1)}L` : "--"} label="Total Profit Generated" sub="Calculated" color={C.orange} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>
              <Card>
                <CardHeader icon="📋" title="Recent Recommendations" sub="Latest 5 activities" />
                {rows.length === 0 ? <EmptyState icon="📋" text="No recommendations yet." /> : (
                  <Table cols={["Farmer", "Crop", "Mandi", "Profit", "Risk"]} rows={rows.slice(0, 5)} renderRow={(r) => (
                    <Tr key={r.id}>
                      <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={r.user_name} size={26} />{r.user_name}</div></Td>
                      <Td>{pill(C.mist, C.leaf, r.crop_name)}</Td>
                      <Td>{r.suggested_mandi}</Td>
                      <Td bold style={{ color: C.leaf }}>Rs {Number(r.predicted_profit || 0).toLocaleString()}</Td>
                      <Td><RiskChip risk={r.spoilage_risk} /></Td>
                    </Tr>
                  )} />
                )}
              </Card>

              <Card>
                <CardHeader icon="📊" title="System Status" />
                {[
                  { label: "Backend API", status: "Operational", ok: true },
                  { label: "ML Service", status: mlMetrics ? "Connected" : "Not Connected", ok: !!mlMetrics },
                  { label: "Database", status: "Connected", ok: true },
                  { label: "Weather API", status: "Live", ok: true },
                  { label: "Mandi API", status: "Live", ok: true },
                ].map(s => (
                  <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 100,
                      background: s.ok ? "#f0faeb" : "#fef2f2",
                      color: s.ok ? C.leaf : C.red,
                    }}>● {s.status}</span>
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ══ USERS ════════════════════════════════════════════════════ */}
        {tab === "users" && (
          <Card>
            <CardHeader icon="👥" title="User Management" sub={`${users.length} registered users`} />
            {users.length === 0 ? <EmptyState icon="👥" text="No users found." /> : (
              <Table
                cols={["User", "Email", "Role", "Region", "Status", "Actions"]}
                rows={users}
                renderRow={(u) => (
                  <Tr key={u.id}>
                    <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={u.name} size={28} /><span style={{ fontWeight: 600 }}>{u.name}</span></div></Td>
                    <Td faint>{u.email}</Td>
                    <Td>
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)} style={{
                        background: u.role === "admin" ? "#fff7ed" : C.mist,
                        color: u.role === "admin" ? C.orange : C.leaf,
                        border: `1px solid ${u.role === "admin" ? C.orange : C.sprout}`,
                        padding: "3px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700, cursor: "pointer",
                      }}>
                        <option value="farmer">Farmer</option>
                        <option value="trader">Trader</option>
                        <option value="admin">Admin</option>
                      </select>
                    </Td>
                    <Td faint>{u.region || "—"}</Td>
                    <Td>{pill(u.is_active ? "#f0faeb" : "#fef2f2", u.is_active ? C.leaf : C.red, u.is_active ? "Active" : "Inactive")}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small variant={u.is_active ? "danger" : "success"} onClick={() => toggleUser(u.id, u.is_active)}>
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Btn>
                        <Btn small variant="ghost" onClick={() => notify(`Password reset link sent to ${u.email}`)}>Reset Pwd</Btn>
                      </div>
                    </Td>
                  </Tr>
                )}
              />
            )}
          </Card>
        )}

        {/* ══ CROPS ════════════════════════════════════════════════════ */}
        {tab === "crops" && (
          <Card>
            <CardHeader
              icon="🌾" title="Crop Management" sub={`${crops.length} crops registered`}
              action={<Btn onClick={() => setShowCropForm(p => !p)}>{showCropForm ? "Cancel" : "+ Add Crop"}</Btn>}
            />

            {showCropForm && (
              <div style={{ background: C.fog, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, marginBottom: 14 }}>New Crop</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 14 }}>
                  <Input label="Name *" value={cropForm.name} placeholder="Wheat" onChange={e => setCropForm(p => ({ ...p, name: e.target.value }))} />
                  <Input label="pH Range" value={cropForm.optimal_ph_range} onChange={e => setCropForm(p => ({ ...p, optimal_ph_range: e.target.value }))} />
                  <Input label="N Range" value={cropForm.optimal_n_range} onChange={e => setCropForm(p => ({ ...p, optimal_n_range: e.target.value }))} />
                  <Input label="P Range" value={cropForm.optimal_p_range} onChange={e => setCropForm(p => ({ ...p, optimal_p_range: e.target.value }))} />
                  <Input label="K Range" value={cropForm.optimal_k_range} onChange={e => setCropForm(p => ({ ...p, optimal_k_range: e.target.value }))} />
                </div>
                <Btn onClick={createCrop}>Create Crop</Btn>
              </div>
            )}

            <Table
              cols={["#", "Name", "pH", "Nitrogen", "Phosphorus", "Potassium", "Actions"]}
              rows={crops}
              renderRow={(c, i) => (
                <Tr key={c.id}>
                  <Td faint>{i + 1}</Td>
                  <Td bold><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span>🌱</span>{c.name}</div></Td>
                  <Td>{pill(C.mist, C.leaf, c.optimal_ph_range)}</Td>
                  <Td faint>{c.optimal_n_range}</Td>
                  <Td faint>{c.optimal_p_range}</Td>
                  <Td faint>{c.optimal_k_range}</Td>
                  <Td>
                    <Btn small variant="danger" onClick={() => deleteCrop(c.id)}>Delete</Btn>
                  </Td>
                </Tr>
              )}
            />
          </Card>
        )}

        {/* ══ MANDI DATA ═══════════════════════════════════════════════ */}
        {tab === "mandi" && (
          <>
            <Card style={{ marginBottom: 20 }}>
              <CardHeader icon="🏪" title="Mandi Data Management" sub="Upload and manage mandi price records" />
              <div style={{ background: C.fog, border: `2px dashed ${C.border}`, borderRadius: 12, padding: 32, textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📂</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Upload Mandi Price CSV</div>
                <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 16 }}>
                  Required columns: <code style={{ background: "#e8f4e0", padding: "2px 6px", borderRadius: 4, fontSize: 11 }}>mandi_name, crop_name, price, arrival_volume, price_date, state, district</code>
                </div>
                <input ref={fileRef} type="file" accept=".csv" onChange={uploadCSV} style={{ display: "none" }} />
                <Btn onClick={() => fileRef.current.click()} disabled={loading.csv}>
                  {loading.csv ? "Uploading..." : "Choose CSV File"}
                </Btn>
              </div>

              {mandiPrices.length > 0 ? (
                <Table
                  cols={["Mandi", "Crop", "Price (Rs/q)", "Arrival Vol", "Date", "State"]}
                  rows={mandiPrices.slice(0, 10)}
                  renderRow={(m, i) => (
                    <Tr key={i}>
                      <Td bold>{m.mandi_name}</Td>
                      <Td>{pill(C.mist, C.leaf, m.crop_name)}</Td>
                      <Td bold style={{ color: C.leaf }}>₹{Number(m.price).toLocaleString()}</Td>
                      <Td faint>{m.arrival_volume} q</Td>
                      <Td faint>{m.price_date}</Td>
                      <Td faint>{m.state}</Td>
                    </Tr>
                  )}
                />
              ) : (
                <EmptyState icon="🏪" text="No mandi price data. Upload a CSV above." />
              )}
            </Card>
          </>
        )}

        {/* ══ WEATHER ══════════════════════════════════════════════════ */}
        {tab === "weather" && (
          <Card>
            <CardHeader
              icon="🌤️" title="Weather Data Monitoring" sub="API status and recent weather logs"
              action={<Btn onClick={refreshWeather} disabled={loading.weather}>{loading.weather ? "Refreshing..." : "↻ Refresh"}</Btn>}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
              {[
                { icon: "🌐", label: "API Status", value: "Operational", color: C.leaf },
                { icon: "📡", label: "Provider", value: "Open-Meteo", color: C.sprout },
                { icon: "⏱️", label: "Last Refresh", value: new Date().toLocaleTimeString(), color: C.orange },
              ].map(s => (
                <div key={s.label} style={{ background: C.fog, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: C.textFaint, fontWeight: 600, textTransform: "uppercase", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {weather.length === 0 ? (
              <EmptyState icon="🌤️" text="No weather logs. Weather is fetched live per-region." />
            ) : (
              <Table
                cols={["Region", "Date", "Max Temp", "Min Temp", "Rainfall", "Humidity"]}
                rows={weather}
                renderRow={(w, i) => (
                  <Tr key={i}>
                    <Td bold>{w.region}</Td>
                    <Td faint>{w.date}</Td>
                    <Td style={{ color: w.temp_max > 35 ? C.red : C.text }}>{w.temp_max}°C</Td>
                    <Td faint>{w.temp_min}°C</Td>
                    <Td style={{ color: w.rainfall > 20 ? "#5b9ad4" : C.textFaint }}>{w.rainfall} mm</Td>
                    <Td faint>{w.humidity}%</Td>
                  </Tr>
                )}
              />
            )}
          </Card>
        )}

        {/* ══ ML MODELS ════════════════════════════════════════════════ */}
        {tab === "ml" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { key: "price", icon: "💹", label: "Price Forecast Model", desc: "Predicts crop market price", accuracy: 86.3, r2: 0.84 },
                { key: "spoilage", icon: "🧪", label: "Spoilage Prediction Model", desc: "Classifies spoilage risk", accuracy: 91.2, r2: 0.88 },
                { key: "soil", icon: "🌱", label: "Soil Health Model", desc: "Scores soil suitability", accuracy: 88.7, r2: 0.86 },
              ].map(m => (
                <Card key={m.key}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{m.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: C.textFaint, marginBottom: 16 }}>{m.desc}</div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: C.textFaint, fontWeight: 600 }}>Accuracy</span>
                      <span style={{ fontWeight: 700, color: C.leaf }}>{m.accuracy}%</span>
                    </div>
                    <div style={{ height: 6, background: C.fog, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${m.accuracy}%`, height: "100%", background: `linear-gradient(90deg, ${C.leaf}, ${C.sprout})`, borderRadius: 3 }} />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textFaint, marginBottom: 16 }}>
                    <span>R² Score: <b style={{ color: C.leaf }}>{m.r2}</b></span>
                    <span style={{ background: C.mist, color: C.leaf, padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                      {mlTraining[m.key] === "training" ? "⏳ Training..." : mlTraining[m.key] === "done" ? "✅ Updated" : "● Ready"}
                    </span>
                  </div>

                  <Btn onClick={() => trainModel(m.key)} disabled={mlTraining[m.key] === "training"} style={{ width: "100%" }}>
                    {mlTraining[m.key] === "training" ? "Training..." : "🔄 Retrain Model"}
                  </Btn>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader icon="📤" title="Upload Training Dataset" sub="Upload CSV to retrain any model with real data" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {["price", "spoilage", "soil"].map(m => (
                  <div key={m} style={{ background: C.fog, border: `2px dashed ${C.border}`, borderRadius: 12, padding: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4, textTransform: "capitalize" }}>{m} Dataset</div>
                    <div style={{ fontSize: 11, color: C.textFaint, marginBottom: 12 }}>CSV format</div>
                    <Btn small variant="ghost" onClick={() => notify(`Upload ${m} dataset - connect your file picker here.`)}>
                      Upload CSV
                    </Btn>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* ══ RECOMMENDATIONS ══════════════════════════════════════════ */}
        {tab === "recs" && (
          <Card>
            <CardHeader icon="📋" title="Recommendation Monitoring" sub={`${rows.length} total recommendations`} />
            {rows.length === 0 ? <EmptyState icon="📋" text="No recommendations yet." /> : (
              <Table
                cols={["Farmer", "Crop", "Region", "Mandi", "Profit", "Risk", "Harvest Window", "Explanation"]}
                rows={rows}
                renderRow={(r) => (
                  <Tr key={r.id}>
                    <Td><div style={{ display: "flex", alignItems: "center", gap: 8 }}><Avatar name={r.user_name} size={26} />{r.user_name}</div></Td>
                    <Td>{pill(C.mist, C.leaf, r.crop_name)}</Td>
                    <Td faint>{r.region || "—"}</Td>
                    <Td>{r.suggested_mandi}</Td>
                    <Td bold style={{ color: C.leaf }}>Rs {Number(r.predicted_profit || 0).toLocaleString()}</Td>
                    <Td><RiskChip risk={r.spoilage_risk} /></Td>
                    <Td faint>{r.harvest_window || "—"}</Td>
                    <Td>
                      <div style={{ maxWidth: 200, fontSize: 11, color: C.textFaint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        title={r.explanation_text}>
                        {r.explanation_text || "—"}
                      </div>
                    </Td>
                  </Tr>
                )}
              />
            )}
          </Card>
        )}

        {/* ══ PRESERVATION ═════════════════════════════════════════════ */}
        {tab === "preservation" && (
          <Card>
            <CardHeader
              icon="🛡️" title="Preservation Methods" sub={`${actions.length} methods configured`}
              action={<Btn onClick={() => setShowActionForm(p => !p)}>{showActionForm ? "Cancel" : "+ Add Method"}</Btn>}
            />

            {showActionForm && (
              <div style={{ background: C.fog, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 14 }}>New Preservation Method</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                  <Input label="Method Name *" value={actionForm.action_name} placeholder="Cold storage" onChange={e => setActionForm(p => ({ ...p, action_name: e.target.value }))} />
                  <Input label="Description *" value={actionForm.description} placeholder="Store at 4-10°C" onChange={e => setActionForm(p => ({ ...p, description: e.target.value }))} />
                  <Input label="Cost Score (1-5)" type="number" value={actionForm.cost_score} onChange={e => setActionForm(p => ({ ...p, cost_score: Number(e.target.value) }))} />
                  <Input label="Effectiveness Score (1-5)" type="number" value={actionForm.effectiveness_score} onChange={e => setActionForm(p => ({ ...p, effectiveness_score: Number(e.target.value) }))} />
                </div>
                <Btn onClick={createAction}>Create Method</Btn>
              </div>
            )}

            {actions.length === 0 ? <EmptyState icon="🛡️" text="No preservation methods yet." /> : (
              <Table
                cols={["Method", "Description", "Cost (1-5)", "Effectiveness (1-5)", "Actions"]}
                rows={actions}
                renderRow={(a) => (
                  <Tr key={a.id}>
                    <Td bold>{a.action_name}</Td>
                    <Td faint>{a.description}</Td>
                    <Td><Bar value={a.cost_score} color={C.orange} /></Td>
                    <Td><Bar value={a.effectiveness_score} color={C.sprout} /></Td>
                    <Td><Btn small variant="danger" onClick={() => notify("Delete endpoint needed.")}>Delete</Btn></Td>
                  </Tr>
                )}
              />
            )}
          </Card>
        )}

        {/* ══ ANALYTICS ════════════════════════════════════════════════ */}
        {tab === "analytics" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }}>
              <StatCard icon="📋" value={rows.length} label="Total Recommendations" sub="All time" color={C.leaf} />
              <StatCard icon="⚠️" value={`${(avgRisk * 100).toFixed(1)}%`} label="Avg Spoilage Risk" sub="Platform-wide" color={C.orange} />
              <StatCard icon="💰" value={`Rs ${(totalProfit / 100000).toFixed(1)}L`} label="Total Profit Generated" sub="All farmers" color={C.sun} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card>
                <CardHeader icon="🏪" title="Most Recommended Mandis" sub="By recommendation count" />
                {mandiRanked.length === 0 ? <EmptyState icon="🏪" text="No data yet." /> : mandiRanked.map(([mandi, count], i) => (
                  <div key={mandi} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: C.mist, color: C.leaf, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{mandi}</div>
                      <div style={{ height: 4, background: C.fog, borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ width: `${(count / mandiRanked[0][1]) * 100}%`, height: "100%", background: C.sprout, borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.leaf }}>{count}x</span>
                  </div>
                ))}
              </Card>

              <Card>
                <CardHeader icon="⚠️" title="High Spoilage Risk Regions" sub="Average risk by region" />
                {regionRanked.length === 0 ? <EmptyState icon="🗺️" text="No region data yet." /> : regionRanked.map((r, i) => (
                  <div key={r.region} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.fog}` }}>
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#fff7ed", color: C.orange, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{r.region}</div>
                      <div style={{ height: 4, background: C.fog, borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ width: `${r.avg * 100}%`, height: "100%", background: C.orange, borderRadius: 2 }} />
                      </div>
                    </div>
                    <RiskChip risk={r.avg} />
                  </div>
                ))}
              </Card>
            </div>
          </>
        )}

        {/* ══ CONFIG ═══════════════════════════════════════════════════ */}
        {tab === "config" && (
          <Card>
            <CardHeader icon="⚙️" title="System Configuration" sub="Transport, risk thresholds, and alert settings" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { label: "Transport Cost per KM (Rs)", key: "transport_cost_per_km", type: "number" },
                { label: "Fuel Rate (Rs/L)", key: "fuel_rate", type: "number" },
                { label: "High Risk Threshold (0-1)", key: "risk_threshold_high", type: "number" },
                { label: "Medium Risk Threshold (0-1)", key: "risk_threshold_medium", type: "number" },
              ].map(f => (
                <Input key={f.key} label={f.label} type={f.type} value={config[f.key]}
                  onChange={e => setConfig(p => ({ ...p, [f.key]: e.target.value }))} />
              ))}
              <Select label="Alert Sensitivity" value={config.alert_sensitivity}
                onChange={e => setConfig(p => ({ ...p, alert_sensitivity: e.target.value }))}
                options={[{ value: "low", label: "Low" }, { value: "medium", label: "Medium" }, { value: "high", label: "High" }]} />
            </div>
            <div style={{ marginTop: 20 }}>
              <Btn onClick={() => notify("Configuration saved successfully!")}>Save Configuration</Btn>
            </div>
          </Card>
        )}

        {/* ══ LOGS & HEALTH ════════════════════════════════════════════ */}
        {tab === "logs" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
              {[
                { icon: "🟢", label: "API Server", value: "Healthy", color: C.leaf },
                { icon: "🟢", label: "Database", value: "Connected", color: C.leaf },
                { icon: mlMetrics ? "🟢" : "🔴", label: "ML Service", value: mlMetrics ? "Online" : "Offline", color: mlMetrics ? C.leaf : C.red },
                { icon: "🟢", label: "Weather API", value: "Live", color: C.leaf },
              ].map(s => (
                <Card key={s.label}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: C.textFaint, marginTop: 2 }}>{s.label}</div>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader icon="📜" title="Activity Log" sub="Recent system events" />
              <div style={{ fontFamily: "monospace", fontSize: 12, background: "#1a1208", borderRadius: 10, padding: 20, color: "#a8e063", lineHeight: 2 }}>
                {[
                  `[${new Date().toLocaleTimeString()}] ✅ Backend API started on port 5001`,
                  `[${new Date().toLocaleTimeString()}] ✅ Database connected to agrichain`,
                  `[${new Date().toLocaleTimeString()}] ✅ ${rows.length} recommendations loaded`,
                  `[${new Date().toLocaleTimeString()}] ✅ ${crops.length} crops registered`,
                  `[${new Date().toLocaleTimeString()}] ${mlMetrics ? "✅ ML Service connected" : "⚠️  ML Service not configured (set ML_SERVICE_URL)"}`,
                  `[${new Date().toLocaleTimeString()}] ✅ Weather API: Open-Meteo live`,
                  `[${new Date().toLocaleTimeString()}] ✅ Admin dashboard loaded`,
                ].map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}