import { useState } from "react";
import { apiPost } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function SpoilageSimulator() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    crop_type: "vegetable",
    quantity: 100,
    initial_quality: 1.0,
    storage_temp: 20,
    storage_humidity: 60,
    transit_hours: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/api/recommendations/simulate/spoilage", form, token);
      setResult(data);
    } catch (err) {
      setError(err?.message || "Simulation failed");
    }
    setLoading(false);
  };

  const getRiskColor = (risk) => {
    if (risk === "CRITICAL") return "#dc2626";
    if (risk === "HIGH") return "#ea580c";
    if (risk === "MEDIUM") return "#ca8a04";
    return "#16a34a";
  };

  return (
    <div className="spoilage-simulator" style={{ padding: 20, background: "#fff", borderRadius: 8, marginTop: 20 }}>
      <h3>🧪 Spoilage Simulator</h3>
      <p style={{ color: "#666", marginBottom: 16 }}>Simulate spoilage risk based on storage and transit conditions</p>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="field">
          <label>Crop Type</label>
          <select value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })}>
            <option value="vegetable">Vegetable</option>
            <option value="fruit">Fruit</option>
            <option value="grain">Grain</option>
            <option value="pulses">Pulses</option>
          </select>
        </div>
        
        <div className="field">
          <label>Quantity (quintals)</label>
          <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
        </div>
        
        <div className="field">
          <label>Initial Quality (0-1)</label>
          <input type="number" step="0.1" min="0" max="1" value={form.initial_quality} onChange={e => setForm({ ...form, initial_quality: Number(e.target.value) })} />
        </div>
        
        <div className="field">
          <label>Storage Temp (°C)</label>
          <input type="number" value={form.storage_temp} onChange={e => setForm({ ...form, storage_temp: Number(e.target.value) })} />
        </div>
        
        <div className="field">
          <label>Storage Humidity (%)</label>
          <input type="number" value={form.storage_humidity} onChange={e => setForm({ ...form, storage_humidity: Number(e.target.value) })} />
        </div>
        
        <div className="field">
          <label>Transit Hours</label>
          <input type="number" value={form.transit_hours} onChange={e => setForm({ ...form, transit_hours: Number(e.target.value) })} />
        </div>
      </div>

      <button className="btn-submit" onClick={handleSubmit} disabled={loading}>
        {loading ? "Simulating..." : "Run Simulation"}
      </button>

      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}

      {result && (
        <div style={{ marginTop: 24 }}>
          <div style={{ 
            padding: 16, 
            background: getRiskColor(result.risk_level) + "20", 
            border: `2px solid ${getRiskColor(result.risk_level)}`,
            borderRadius: 8,
            marginBottom: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: 24, fontWeight: "bold", color: getRiskColor(result.risk_level) }}>
                  {result.risk_level}
                </span>
                <span style={{ marginLeft: 12, color: "#666" }}>
                  Final Spoilage: {result.final_spoilage_percent}%
                </span>
              </div>
            </div>
            <p style={{ marginTop: 8, fontWeight: 500 }}>{result.recommendation}</p>
          </div>

          <h4>📊 7-Day Spoilage Projection</h4>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
            {result.simulation_results?.map((day) => (
              <div key={day.day} style={{ 
                minWidth: 80, 
                padding: 12, 
                background: day.cumulative_spoilage > 30 ? "#fee2e2" : day.cumulative_spoilage > 15 ? "#fef3c7" : "#dcfce7",
                borderRadius: 8,
                textAlign: "center"
              }}>
                <div style={{ fontWeight: "bold" }}>Day {day.day}</div>
                <div style={{ fontSize: 12, color: "#666" }}>Daily: {day.spoilage_rate}%</div>
                <div style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>{day.cumulative_spoilage}%</div>
                <div style={{ fontSize: 10, color: "#666" }}>remaining</div>
              </div>
            ))}
          </div>

          <h4 style={{ marginTop: 16 }}>⚙️ Impact Factors</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Temperature Impact</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>+{result.factors?.temperature_impact || 0}%</div>
            </div>
            <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Humidity Impact</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>+{result.factors?.humidity_impact || 0}%</div>
            </div>
            <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Transit Impact</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>+{result.factors?.transit_impact || 0}%</div>
            </div>
            <div style={{ padding: 12, background: "#f3f4f6", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#666" }}>Weather Impact</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>+{result.factors?.weather_impact || 0}%</div>
            </div>
          </div>

          <h4 style={{ marginTop: 16 }}>✅ Optimal Conditions</h4>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span style={{ padding: "4px 12px", background: "#dbeafe", borderRadius: 16 }}>
              🌡️ Temp: {result.optimal_conditions?.suggested_temp}
            </span>
            <span style={{ padding: "4px 12px", background: "#dbeafe", borderRadius: 16 }}>
              💧 Humidity: {result.optimal_conditions?.suggested_humidity}
            </span>
            <span style={{ padding: "4px 12px", background: "#dbeafe", borderRadius: 16 }}>
              🚛 Max Transit: {result.optimal_conditions?.max_transit_hours}h
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
