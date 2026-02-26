import { useState } from "react";
import { apiPost } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function FarmerDashboard() {
  const { token } = useAuth();
  const [form, setForm] = useState({ crop_id: "", region: "", quantity: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const submit = async () => {
    setError("");
    try {
      const data = await apiPost(
        "/api/recommendations/generate",
        { crop_id: Number(form.crop_id), region: form.region, quantity: Number(form.quantity) },
        token
      );
      setResult(data);
    } catch (err) {
      setError(err?.message || "Failed to generate");
    }
  };

  return (
    <div className="rec-card" style={{ margin: 32 }}>
      <h3>Quick Recommendation</h3>
      <div className="field"><label>Crop ID</label><input value={form.crop_id} onChange={e => setForm({ ...form, crop_id: e.target.value })} /></div>
      <div className="field"><label>Region</label><input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
      <div className="field"><label>Quantity</label><input value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} /></div>
      <button className="btn-submit" onClick={submit}>Generate</button>
      {error && <div style={{ color: "var(--red)", marginTop: 10 }}>{error}</div>}
      {result && (
        <div style={{ marginTop: 12 }}>
          <div>Suggested mandi: {result.suggested_mandi}</div>
          <div>Harvest window: {result.harvest_window}</div>
          <div>Profit: Rs {result.predicted_profit}</div>
        </div>
      )}
    </div>
  );
}
