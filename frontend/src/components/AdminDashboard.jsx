import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [crops, setCrops] = useState([]);
  const [actions, setActions] = useState([]);
  const [cropForm, setCropForm] = useState({
    name: "",
    optimal_ph_range: "[6.0,7.5]",
    optimal_n_range: "[80,120]",
    optimal_p_range: "[40,60]",
    optimal_k_range: "[40,60]",
  });
  const [actionForm, setActionForm] = useState({
    action_name: "",
    description: "",
    cost_score: 3,
    effectiveness_score: 3,
  });
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await apiGet("/api/recommendations/all", token);
      setRows(data);
    } catch {
      setRows([]);
    }
  };

  const loadCrops = async () => {
    try {
      const data = await apiGet("/api/crops");
      setCrops(data);
    } catch {
      setCrops([]);
    }
  };

  const loadActions = async () => {
    try {
      const data = await apiGet("/api/preservation-actions");
      setActions(data);
    } catch {
      setActions([]);
    }
  };

  useEffect(() => {
    load();
    loadCrops();
    loadActions();
  }, [token]);

  const createCrop = async () => {
    setError("");
    if (!cropForm.name) {
      setError("Crop name is required.");
      return;
    }
    try {
      await apiPost("/api/crops", cropForm, token);
      setCropForm({
        name: "",
        optimal_ph_range: "[6.0,7.5]",
        optimal_n_range: "[80,120]",
        optimal_p_range: "[40,60]",
        optimal_k_range: "[40,60]",
      });
      loadCrops();
    } catch (err) {
      setError(err?.message || "Failed to create crop.");
    }
  };

  const createAction = async () => {
    setError("");
    if (!actionForm.action_name || !actionForm.description) {
      setError("Action name and description are required.");
      return;
    }
    try {
      await apiPost("/api/preservation-actions", actionForm, token);
      setActionForm({ action_name: "", description: "", cost_score: 3, effectiveness_score: 3 });
      loadActions();
    } catch (err) {
      setError(err?.message || "Failed to create preservation action.");
    }
  };

  return (
    <div className="admin-dash">
      <div className="page-greet"><h2>Admin Dashboard</h2><p>System overview and management.</p></div>

      <div className="admin-stats">
        {[
          { val: String(rows.length), lbl: "Total Recommendations", change: "Live", up: true },
          { val: String(crops.length), lbl: "Total Crops", change: "Live", up: true },
          { val: String(actions.length), lbl: "Preservation Actions", change: "Live", up: true },
          { val: "--", lbl: "Profit Generated", change: "Live", up: true }
        ].map((s, i) => (
          <div className="astat" key={i}>
            <div className="astat-val">{s.val}</div>
            <div className="astat-lbl">{s.lbl}</div>
            <div className={`astat-change ${s.up ? "up" : "down"}`}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="rec-card" style={{ marginBottom: 20 }}>
        <h3>Add Crop</h3>
        <div className="field"><label>Name</label><input value={cropForm.name} onChange={e => setCropForm({ ...cropForm, name: e.target.value })} placeholder="Wheat" /></div>
        <div className="field"><label>pH Range</label><input value={cropForm.optimal_ph_range} onChange={e => setCropForm({ ...cropForm, optimal_ph_range: e.target.value })} /></div>
        <div className="field"><label>N Range</label><input value={cropForm.optimal_n_range} onChange={e => setCropForm({ ...cropForm, optimal_n_range: e.target.value })} /></div>
        <div className="field"><label>P Range</label><input value={cropForm.optimal_p_range} onChange={e => setCropForm({ ...cropForm, optimal_p_range: e.target.value })} /></div>
        <div className="field"><label>K Range</label><input value={cropForm.optimal_k_range} onChange={e => setCropForm({ ...cropForm, optimal_k_range: e.target.value })} /></div>
        <button className="btn-submit" onClick={createCrop}>Create Crop</button>
      </div>

      <div className="rec-card" style={{ marginBottom: 20 }}>
        <h3>Add Preservation Action</h3>
        <div className="field"><label>Action Name</label><input value={actionForm.action_name} onChange={e => setActionForm({ ...actionForm, action_name: e.target.value })} placeholder="Cold storage" /></div>
        <div className="field"><label>Description</label><input value={actionForm.description} onChange={e => setActionForm({ ...actionForm, description: e.target.value })} placeholder="Store at 4-10C" /></div>
        <div className="field"><label>Cost Score (1-5)</label><input value={actionForm.cost_score} onChange={e => setActionForm({ ...actionForm, cost_score: Number(e.target.value) })} type="number" /></div>
        <div className="field"><label>Effectiveness Score (1-5)</label><input value={actionForm.effectiveness_score} onChange={e => setActionForm({ ...actionForm, effectiveness_score: Number(e.target.value) })} type="number" /></div>
        <button className="btn-submit" onClick={createAction}>Create Action</button>
        {error && <div style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}
      </div>

      <div className="admin-table-card" style={{ marginBottom: 20 }}>
        <h3>Crop List</h3>
        <table>
          <thead><tr><th>Name</th><th>pH</th><th>N</th><th>P</th><th>K</th></tr></thead>
          <tbody>
            {crops.map((c) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td>{c.optimal_ph_range}</td>
                <td>{c.optimal_n_range}</td>
                <td>{c.optimal_p_range}</td>
                <td>{c.optimal_k_range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-table-card" style={{ marginBottom: 20 }}>
        <h3>Preservation Actions</h3>
        <table>
          <thead><tr><th>Action</th><th>Description</th><th>Cost</th><th>Effectiveness</th></tr></thead>
          <tbody>
            {actions.map((a) => (
              <tr key={a.id}>
                <td style={{ fontWeight: 600 }}>{a.action_name}</td>
                <td>{a.description}</td>
                <td>{a.cost_score}/5</td>
                <td>{a.effectiveness_score}/5</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-table-card">
        <h3>Recent Recommendations</h3>
        <table>
          <thead><tr><th>Farmer</th><th>Crop</th><th>Region</th><th>Recommended Mandi</th><th>Est. Net Profit</th><th>Spoilage Risk</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600 }}>{r.user_name}</td>
                <td>{r.crop_name}</td>
                <td>{r.region || "-"}</td>
                <td>{r.suggested_mandi}</td>
                <td className="profit-val">Rs {Number(r.predicted_profit || 0).toLocaleString()}</td>
                <td>{Number(r.spoilage_risk || 0) * 100}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
