import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import WeatherStrip from "./WeatherStrip";
import SpoilageRing from "./SpoilageRing";
import MandiTable from "./MandiTable";
import { apiGet, apiPost } from "../services/api";

const formatRange = (range) => {
  if (!range) return "-";
  return String(range).replace("[", "").replace("]", "").replace(")", "");
};

export default function FarmerHome() {
  const { user } = useAuth();
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState(null);
  const [region, setRegion] = useState(user?.region || "");
  const [qty, setQty] = useState("100");
  const [soil, setSoil] = useState({ ph: "", n: "", p: "", k: "" });
  const [storage, setStorage] = useState({ temp: "", humidity: "", transit: "" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [weather, setWeather] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("home");

  const selectedCrop = useMemo(() => crops.find((c) => c.id === cropId), [crops, cropId]);

  useEffect(() => {
    const init = async () => {
      try {
        const cropRows = await apiGet("/api/crops");
        setCrops(cropRows);
        if (cropRows.length && !cropId) setCropId(cropRows[0].id);
      } catch (err) {
        setError(err?.message || "Failed to load crops.");
      }
    };
    init();
  }, [cropId]);

  useEffect(() => {
    if (!region) return;
    const loadWeather = async () => {
      try {
        const data = await apiGet(`/api/weather?region=${encodeURIComponent(region)}&live=1`);
        setWeather(data);
      } catch (err) {
        setWeather([]);
      }
    };
    loadWeather();
  }, [region]);

  useEffect(() => {
    if (!selectedCrop?.name) return;
    const loadMandis = async () => {
      try {
        const data = await apiGet(`/api/mandi-prices?live=1&crop=${encodeURIComponent(selectedCrop.name)}&state=${encodeURIComponent(region)}`);
        setMandis(data);
      } catch (err) {
        setMandis([]);
      }
    };
    loadMandis();
  }, [selectedCrop, region]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await apiGet("/api/recommendations/me", localStorage.getItem("ag_token"));
        setHistory(data);
      } catch (err) {
        setHistory([]);
      }
    };
    loadHistory();
  }, []);

  const analyze = async () => {
    setError("");
    if (!cropId) {
      setError("Please select a crop.");
      return;
    }
    if (!region) {
      setError("Please enter a region/state.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem("ag_token");
      const data = await apiPost(
        "/api/recommendations/generate",
        {
          crop_id: cropId,
          region,
          quantity: Number(qty || 0),
          soil_ph: soil.ph ? Number(soil.ph) : undefined,
          soil_n: soil.n ? Number(soil.n) : undefined,
          soil_p: soil.p ? Number(soil.p) : undefined,
          soil_k: soil.k ? Number(soil.k) : undefined,
          storage_temp: storage.temp ? Number(storage.temp) : undefined,
          storage_humidity: storage.humidity ? Number(storage.humidity) : undefined,
          transit_hours: storage.transit ? Number(storage.transit) : undefined,
        },
        token
      );

      const predictedPrice = Number(data.predicted_price || 0);

      setResult({
        best_mandi: data.suggested_mandi,
        harvest_window: data.harvest_window,
        predicted_price: predictedPrice,
        spoilage_risk: data.spoilage_risk,
        net_profit: data.predicted_profit,
        explanation: data.explanation_text,
        weather: weather.map((w) => ({
          day: new Date(w.forecast_date).toLocaleDateString(undefined, { weekday: "short" }),
          temp: Number(w.temperature || 0),
          rain: Number(w.rainfall || 0),
          humidity: Number(w.humidity || 0),
        })),
        preservation_actions: data.preservation_actions || [],
        soil_score: data.soil_score,
      });
      setHistory((prev) => [data, ...prev]);
      setTab("home");
    } catch (err) {
      setError(err?.message || "Failed to generate recommendation.");
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="farmer-home">
      <div className="page-greet">
        <h2>{greet}, {user?.name}</h2>
        <p>Enter your crop details below to get today's harvest and market recommendation.</p>
      </div>

      <div className="nav-tabs" style={{ marginBottom: 16 }}>
        {[
          { id: "home", label: "Home" },
          { id: "prices", label: "Prices" },
          { id: "weather", label: "Weather" },
          { id: "history", label: "History" },
        ].map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="input-card">
        <h3>Crop Analysis Input</h3>
        <div className="input-grid">
          <div className="field" style={{ margin: 0 }}>
            <label>Crop</label>
            <select value={cropId || ""} onChange={e => setCropId(Number(e.target.value))}>
              {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Region (State)</label>
            <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Maharashtra" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Quantity (quintals)</label>
            <input value={qty} onChange={e => setQty(e.target.value)} placeholder="100" type="number" />
          </div>
          <button className="btn-analyze" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Get Recommendation ->"}
          </button>
        </div>

        <div className="input-grid" style={{ marginTop: 16 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Soil pH</label>
            <input value={soil.ph} onChange={e => setSoil({ ...soil, ph: e.target.value })} placeholder="6.5" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Soil N</label>
            <input value={soil.n} onChange={e => setSoil({ ...soil, n: e.target.value })} placeholder="90" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Soil P</label>
            <input value={soil.p} onChange={e => setSoil({ ...soil, p: e.target.value })} placeholder="50" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Soil K</label>
            <input value={soil.k} onChange={e => setSoil({ ...soil, k: e.target.value })} placeholder="60" />
          </div>
        </div>

        <div className="input-grid" style={{ marginTop: 16 }}>
          <div className="field" style={{ margin: 0 }}>
            <label>Storage Temp (C)</label>
            <input value={storage.temp} onChange={e => setStorage({ ...storage, temp: e.target.value })} placeholder="18" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Storage Humidity (%)</label>
            <input value={storage.humidity} onChange={e => setStorage({ ...storage, humidity: e.target.value })} placeholder="60" />
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Transit Time (hours)</label>
            <input value={storage.transit} onChange={e => setStorage({ ...storage, transit: e.target.value })} placeholder="6" />
          </div>
        </div>

        {error && <div style={{ color: "var(--red)", fontSize: 13, marginTop: 10 }}>{error}</div>}
      </div>

      {tab === "home" && loading && (
        <div className="rec-card loading-card">
          <div className="loading-dots"><span /><span /><span /></div>
          <p>Running AI models - price forecasting, spoilage estimation, route optimization...</p>
        </div>
      )}

      {tab === "home" && !loading && !result && (
        <div className="rec-card">
          <div className="empty-state">
            <div className="empty-icon">AC</div>
            <p>Select your crop, region, and quantity above and click <strong>Get Recommendation</strong></p>
          </div>
        </div>
      )}

      {tab === "home" && result && (
        <>
          <div className="results-grid">
            <div className="rec-card">
              <h3>AI Recommendation</h3>
              <div className="rec-headline">
                <div className="rec-mandi-icon">M</div>
                <div>
                  <div className="rec-mandi-name">{result.best_mandi}</div>
                  <div className="rec-mandi-sub">{result.harvest_window} - Best net return</div>
                </div>
              </div>
              <div className="rec-metrics">
                <div className="metric">
                  <div className="metric-val">Rs {result.predicted_price.toLocaleString()}</div>
                  <div className="metric-lbl">Predicted Price/q</div>
                </div>
                <div className="metric">
                  <div className="metric-val">Rs {result.net_profit.toLocaleString()}</div>
                  <div className="metric-lbl">Est. Net Profit</div>
                </div>
                <div className="metric">
                  <div className="metric-val">{Math.round(result.spoilage_risk * 100)}%</div>
                  <div className="metric-lbl">Spoilage Risk</div>
                </div>
              </div>
              <div className="ai-explain">
                <div className="ai-explain-tag">AI Explanation</div>
                <p>{result.explanation}</p>
                {result.soil_score !== null && result.soil_score !== undefined && (
                  <p>Soil suitability score: {result.soil_score}%</p>
                )}
              </div>

              {selectedCrop && (
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--textMid)" }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Crop Optimal Ranges</div>
                  <div>pH: {formatRange(selectedCrop.optimal_ph_range)}</div>
                  <div>N: {formatRange(selectedCrop.optimal_n_range)}</div>
                  <div>P: {formatRange(selectedCrop.optimal_p_range)}</div>
                  <div>K: {formatRange(selectedCrop.optimal_k_range)}</div>
                </div>
              )}

              {result.preservation_actions?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>Preservation Actions</div>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {result.preservation_actions.map((a) => (
                      <li key={a.id}>{a.action_name} - {a.description} (Cost: {a.cost_score}/5, Effectiveness: {a.effectiveness_score}/5)</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <SpoilageRing risk={result.spoilage_risk} />
          </div>

          <WeatherStrip weather={result.weather} />
          <MandiTable mandis={mandis} />
        </>
      )}

      {tab === "prices" && (
        <div className="mandi-table-card">
          <h3>Live Mandi Prices</h3>
          <MandiTable mandis={mandis} />
        </div>
      )}

      {tab === "weather" && (
        <div className="mandi-table-card">
          <h3>Live Weather Forecast</h3>
          <WeatherStrip weather={weather.map((w) => ({
            day: new Date(w.forecast_date).toLocaleDateString(undefined, { weekday: "short" }),
            temp: Number(w.temperature || 0),
            rain: Number(w.rainfall || 0),
            humidity: Number(w.humidity || 0),
          }))} />
        </div>
      )}

      {tab === "history" && history.length > 0 && (
        <div className="mandi-table-card" style={{ marginTop: 20 }}>
          <h3>Recent Recommendations</h3>
          <table>
            <thead>
              <tr>
                <th>Crop</th>
                <th>Mandi</th>
                <th>Harvest Window</th>
                <th>Profit</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 10).map((r) => (
                <tr key={r.id}>
                  <td>{r.crop_name || selectedCrop?.name}</td>
                  <td>{r.suggested_mandi}</td>
                  <td>{r.harvest_window}</td>
                  <td className="profit-val">Rs {Number(r.predicted_profit || 0).toLocaleString()}</td>
                  <td>{Number(r.spoilage_risk || 0) * 100}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
