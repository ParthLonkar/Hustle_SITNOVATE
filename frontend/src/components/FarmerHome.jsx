import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import WeatherStrip from "./WeatherStrip";
import SpoilageRing from "./SpoilageRing";
import SpoilageSimulator from "./SpoilageSimulator";
import MandiTable from "./MandiTable";
import { apiGet, apiPost } from "../services/api";

const formatRange = (range) => {
  if (!range) return "-";
  return String(range).replace("[", "").replace("]", "").replace(")", "");
};

/* Resolve city/district input → proper Indian state name for API queries */
const CITY_TO_STATE = {
  nagpur:"Maharashtra",wardha:"Maharashtra",amravati:"Maharashtra",akola:"Maharashtra",
  yavatmal:"Maharashtra",pune:"Maharashtra",mumbai:"Maharashtra",nashik:"Maharashtra",
  aurangabad:"Maharashtra",solapur:"Maharashtra",kolhapur:"Maharashtra",sangli:"Maharashtra",
  satara:"Maharashtra",latur:"Maharashtra",nanded:"Maharashtra",chandrapur:"Maharashtra",
  buldhana:"Maharashtra",washim:"Maharashtra",hingoli:"Maharashtra",parbhani:"Maharashtra",
  jalna:"Maharashtra",beed:"Maharashtra",osmanabad:"Maharashtra",raigad:"Maharashtra",
  ratnagiri:"Maharashtra",thane:"Maharashtra",ahmednagar:"Maharashtra",
  dhule:"Maharashtra",nandurbar:"Maharashtra",jalgaon:"Maharashtra",
  gondia:"Maharashtra",bhandara:"Maharashtra",gadchiroli:"Maharashtra",
  indore:"Madhya Pradesh",bhopal:"Madhya Pradesh",gwalior:"Madhya Pradesh",
  jabalpur:"Madhya Pradesh",ujjain:"Madhya Pradesh",sagar:"Madhya Pradesh",
  ratlam:"Madhya Pradesh",dewas:"Madhya Pradesh",mandsaur:"Madhya Pradesh",
  neemuch:"Madhya Pradesh",
  lucknow:"Uttar Pradesh",kanpur:"Uttar Pradesh",agra:"Uttar Pradesh",
  varanasi:"Uttar Pradesh",allahabad:"Uttar Pradesh",meerut:"Uttar Pradesh",
  ludhiana:"Punjab",amritsar:"Punjab",jalandhar:"Punjab",patiala:"Punjab",
  bathinda:"Punjab",moga:"Punjab",ferozepur:"Punjab",sangrur:"Punjab",
  ambala:"Haryana",karnal:"Haryana",panipat:"Haryana",hisar:"Haryana",
  rohtak:"Haryana",sirsa:"Haryana",fatehabad:"Haryana",
  jaipur:"Rajasthan",jodhpur:"Rajasthan",kota:"Rajasthan",ajmer:"Rajasthan",
  bikaner:"Rajasthan",udaipur:"Rajasthan",alwar:"Rajasthan",bharatpur:"Rajasthan",
  ahmedabad:"Gujarat",surat:"Gujarat",vadodara:"Gujarat",rajkot:"Gujarat",
  bhavnagar:"Gujarat",anand:"Gujarat",gandhinagar:"Gujarat",junagadh:"Gujarat",
  bangalore:"Karnataka",mysore:"Karnataka",hubli:"Karnataka",belgaum:"Karnataka",
  gulbarga:"Karnataka",
  vijayawada:"Andhra Pradesh",guntur:"Andhra Pradesh",kurnool:"Andhra Pradesh",
  nellore:"Andhra Pradesh",visakhapatnam:"Andhra Pradesh",
  warangal:"Telangana",nizamabad:"Telangana",karimnagar:"Telangana",
  chennai:"Tamil Nadu",coimbatore:"Tamil Nadu",madurai:"Tamil Nadu",
  kolkata:"West Bengal",howrah:"West Bengal",burdwan:"West Bengal",
  patna:"Bihar",gaya:"Bihar",bhagalpur:"Bihar",muzaffarpur:"Bihar",
};

function resolveStateForQuery(input) {
  if (!input) return input;
  const lower = input.trim().toLowerCase();
  return CITY_TO_STATE[lower] || input.trim();
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const NAV_ITEMS = [
  { id: "home", icon: "🏠", label: "Dashboard" },
  { id: "recommend", icon: "🤖", label: "Get Recommendation" },
  { id: "prices", icon: "📊", label: "Live Prices" },
  { id: "weather", icon: "🌤️", label: "Weather" },
  { id: "simulator", icon: "🧪", label: "Simulator" },
  { id: "history", icon: "📋", label: "History" },
];

export default function FarmerHome() {
  const { user, logout } = useAuth();
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
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [mandiLoading, setMandiLoading] = useState(false);

  const debouncedRegion = useDebounce(region, 500);
  const weatherAbortRef = useRef(null);
  const mandiAbortRef = useRef(null);

  const selectedCrop = useMemo(() => crops.find((c) => c.id === cropId), [crops, cropId]);

  useEffect(() => {
    const init = async () => {
      try {
        const cropRows = await apiGet("/api/crops");
        setCrops(cropRows);
        if (cropRows.length && !cropId) setCropId(cropRows[0].id);
      } catch { setError("Failed to load crops."); }
    };
    init();
  }, []);

  useEffect(() => {
    if (!debouncedRegion) return;
    const loadWeather = async () => {
      if (weatherAbortRef.current) weatherAbortRef.current.cancelled = true;
      setWeatherLoading(true);
      try {
        const controller = { cancelled: false };
        weatherAbortRef.current = controller;
        const data = await apiGet(`/api/weather?region=${encodeURIComponent(debouncedRegion)}&live=1`);
        if (!controller.cancelled) setWeather(data);
      } catch (err) {
        if (!weatherAbortRef.current?.cancelled) { setWeather([]); }
      } finally {
        if (!weatherAbortRef.current?.cancelled) setWeatherLoading(false);
      }
    };
    loadWeather();
    return () => { if (weatherAbortRef.current) weatherAbortRef.current.cancelled = true; };
  }, [debouncedRegion]);

  useEffect(() => {
    if (!selectedCrop?.name || !debouncedRegion) return;
    const loadMandis = async () => {
      if (mandiAbortRef.current) mandiAbortRef.current.cancelled = true;
      setMandiLoading(true);
      try {
        const controller = { cancelled: false };
        mandiAbortRef.current = controller;
        const stateForQuery = resolveStateForQuery(debouncedRegion);
        const data = await apiGet(`/api/mandi-prices?live=1&crop=${encodeURIComponent(selectedCrop.name)}&state=${encodeURIComponent(stateForQuery)}&limit=100`);
        if (!controller.cancelled) setMandis(data);
      } catch {
        if (!mandiAbortRef.current?.cancelled) setMandis([]);
      } finally {
        if (!mandiAbortRef.current?.cancelled) setMandiLoading(false);
      }
    };
    loadMandis();
    return () => { if (mandiAbortRef.current) mandiAbortRef.current.cancelled = true; };
  }, [selectedCrop, debouncedRegion]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const token = localStorage.getItem("ag_token");
        const data = await apiGet("/api/recommendations/me", token);
        setHistory(data);
      } catch { setHistory([]); }
    };
    loadHistory();
  }, []);

  const analyze = async () => {
    setError("");
    if (!cropId) { setError("Please select a crop."); return; }
    if (!region) { setError("Please enter a region/state."); return; }
    setLoading(true);
    setResult(null);
    try {
      const token = localStorage.getItem("ag_token");
      const data = await apiPost(
        "/api/recommendations/generate",
        {
          crop_id: cropId, region, quantity: Number(qty || 0),
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

  /* ── Sidebar ── */
  const Sidebar = () => (
    <aside className="farmer-sidebar">
      <div style={{ padding: "0 18px 20px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
          Farmer Portal
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${tab === item.id ? "active" : ""}`}
            onClick={() => setTab(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Quick stats in sidebar */}
      <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
          Quick Stats
        </div>
        {[
          { label: "Recommendations", val: history.length },
          { label: "Active Crop", val: selectedCrop?.name || "—" },
          { label: "Region", val: region || "Not set" },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--txt3)", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="sidebar-logout">
        <button className="sidebar-logout-btn" onClick={logout}>
          <span>↩</span> Sign out
        </button>
      </div>
    </aside>
  );

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return (
    <div className="farmer-layout">
      <Sidebar />

      <main className="farmer-content">

        {/* ══ HOME / DASHBOARD ══ */}
        {tab === "home" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{greet}, {user?.name} 👋</h2>
              <p>Here's your farm intelligence overview for today.</p>
            </div>

            {/* Summary cards like agricltur */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-icon">🌾</div>
                <div className="stat-val">{crops.length}</div>
                <div className="stat-lbl">Crops Available</div>
                <div className="stat-sub">● Registered</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-val">{history.length}</div>
                <div className="stat-lbl">Recommendations</div>
                <div className="stat-sub">● All time</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-val">
                  {result ? `₹${Number(result.net_profit || 0).toLocaleString()}` : "--"}
                </div>
                <div className="stat-lbl">Latest Est. Profit</div>
                <div className="stat-sub">● Last recommendation</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠️</div>
                <div className="stat-val">
                  {result ? `${Math.round(result.spoilage_risk * 100)}%` : "--"}
                </div>
                <div className="stat-lbl">Spoilage Risk</div>
                <div className="stat-sub">● Current</div>
              </div>
            </div>

            {/* Latest result or empty prompt */}
            {!result ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Prompt card */}
                <div className="g-card-solid" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 240, textAlign: "center", gridColumn: "1/-1" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,var(--gd),var(--gm))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20, boxShadow: "0 0 30px rgba(74,222,128,0.2)" }}>
                    🤖
                  </div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: "var(--txt)", marginBottom: 10 }}>
                    Get your AI recommendation
                  </div>
                  <p style={{ fontSize: 14, color: "var(--txt2)", marginBottom: 24, maxWidth: 380, fontWeight: 300, lineHeight: 1.65 }}>
                    Select your crop, region, and quantity in the recommendation tab to get today's AI-powered harvest and market advice.
                  </p>
                  <button className="btn-primary" onClick={() => setTab("recommend")}>
                    Get Recommendation →
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                {/* AI Result */}
                <div className="g-card-solid" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div className="card-icon">🤖</div>
                    <div>
                      <div className="card-title">AI Recommendation</div>
                      <div className="card-sub">Based on weather, prices & soil data</div>
                    </div>
                  </div>
                  <div className="rec-headline">
                    <div className="rec-mandi-icon">M</div>
                    <div>
                      <div className="rec-mandi-name">{result.best_mandi}</div>
                      <div className="rec-mandi-sub">{result.harvest_window} · Best net return</div>
                    </div>
                  </div>
                  <div className="rec-metrics">
                    <div className="metric">
                      <div className="metric-val">₹{result.predicted_price.toLocaleString()}</div>
                      <div className="metric-lbl">Price/quintal</div>
                    </div>
                    <div className="metric">
                      <div className="metric-val">₹{Number(result.net_profit).toLocaleString()}</div>
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
                    {result.soil_score != null && <p style={{ marginTop: 8 }}>Soil suitability: <b style={{ color: "var(--g)" }}>{result.soil_score}%</b></p>}
                  </div>
                </div>
                {/* Spoilage ring */}
                <div className="g-card-solid" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <SpoilageRing risk={result.spoilage_risk} />
                </div>
              </div>
            )}

            {/* Weather strip if available */}
            {result && (
              <div style={{ marginTop: 20 }}>
                <WeatherStrip weather={result.weather} loading={weatherLoading} />
              </div>
            )}

            {/* Mandi table */}
            {result && mandis.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <MandiTable mandis={mandis} />
              </div>
            )}
          </div>
        )}

        {/* ══ RECOMMEND ══ */}
        {tab === "recommend" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>Get AI Recommendation</h2>
              <p>Enter your crop details to generate today's harvest and market advice.</p>
            </div>

            {/* Main form */}
            <div className="g-card-solid" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div className="card-icon">🌾</div>
                <div>
                  <div className="card-title">Crop & Region</div>
                  <div className="card-sub">Required for recommendation</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
                <div className="field">
                  <label>Crop</label>
                  <select value={cropId || ""} onChange={e => setCropId(Number(e.target.value))}>
                    {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Region (State)</label>
                  <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Maharashtra" />
                </div>
                <div className="field">
                  <label>Quantity (quintals)</label>
                  <input value={qty} onChange={e => setQty(e.target.value)} placeholder="100" type="number" />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn-primary" style={{ width: "100%", padding: "12px" }} onClick={analyze} disabled={loading}>
                    {loading ? "Analyzing..." : "Get Recommendation →"}
                  </button>
                </div>
              </div>

              {/* Optional soil inputs */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>
                  🌱 Soil Data (Optional — improves accuracy)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
                  <div className="field"><label>Soil pH</label><input value={soil.ph} onChange={e => setSoil({ ...soil, ph: e.target.value })} placeholder="6.5" /></div>
                  <div className="field"><label>Nitrogen (N)</label><input value={soil.n} onChange={e => setSoil({ ...soil, n: e.target.value })} placeholder="90" /></div>
                  <div className="field"><label>Phosphorus (P)</label><input value={soil.p} onChange={e => setSoil({ ...soil, p: e.target.value })} placeholder="50" /></div>
                  <div className="field"><label>Potassium (K)</label><input value={soil.k} onChange={e => setSoil({ ...soil, k: e.target.value })} placeholder="60" /></div>
                </div>
              </div>

              {/* Optional storage inputs */}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>
                  📦 Storage Conditions (Optional)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                  <div className="field"><label>Storage Temp (°C)</label><input value={storage.temp} onChange={e => setStorage({ ...storage, temp: e.target.value })} placeholder="18" /></div>
                  <div className="field"><label>Humidity (%)</label><input value={storage.humidity} onChange={e => setStorage({ ...storage, humidity: e.target.value })} placeholder="60" /></div>
                  <div className="field"><label>Transit Time (hrs)</label><input value={storage.transit} onChange={e => setStorage({ ...storage, transit: e.target.value })} placeholder="6" /></div>
                </div>
              </div>

              {error && (
                <div style={{ marginTop: 16, padding: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 9, color: "var(--red)", fontSize: 13 }}>
                  ⚠ {error}
                </div>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="g-card-solid" style={{ padding: 48, textAlign: "center" }}>
                <div className="loading-dots"><span /><span /><span /></div>
                <p style={{ color: "var(--txt2)", fontSize: 14, fontWeight: 300 }}>Running AI models — price forecasting, spoilage estimation, route optimisation...</p>
              </div>
            )}

            {/* Result */}
            {!loading && result && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div className="rec-card">
                    <h3>AI Recommendation</h3>
                    <div className="rec-headline">
                      <div className="rec-mandi-icon">M</div>
                      <div>
                        <div className="rec-mandi-name">{result.best_mandi}</div>
                        <div className="rec-mandi-sub">{result.harvest_window} · Best net return</div>
                      </div>
                    </div>
                    <div className="rec-metrics">
                      <div className="metric"><div className="metric-val">₹{result.predicted_price.toLocaleString()}</div><div className="metric-lbl">Price/quintal</div></div>
                      <div className="metric"><div className="metric-val">₹{Number(result.net_profit).toLocaleString()}</div><div className="metric-lbl">Est. Net Profit</div></div>
                      <div className="metric"><div className="metric-val">{Math.round(result.spoilage_risk * 100)}%</div><div className="metric-lbl">Spoilage Risk</div></div>
                    </div>
                    <div className="ai-explain">
                      <div className="ai-explain-tag">AI Explanation</div>
                      <p>{result.explanation}</p>
                      {result.soil_score != null && <p style={{ marginTop: 8 }}>Soil suitability: <b style={{ color: "var(--g)" }}>{result.soil_score}%</b></p>}
                    </div>
                    {selectedCrop && (
                      <div style={{ marginTop: 16, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, marginBottom: 8 }}>Crop Optimal Ranges</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                          {[
                            { label: "pH", val: formatRange(selectedCrop.optimal_ph_range) },
                            { label: "N", val: formatRange(selectedCrop.optimal_n_range) },
                            { label: "P", val: formatRange(selectedCrop.optimal_p_range) },
                            { label: "K", val: formatRange(selectedCrop.optimal_k_range) },
                          ].map(r => (
                            <div key={r.label} style={{ textAlign: "center", padding: "8px 6px", background: "rgba(74,222,128,0.04)", borderRadius: 8, border: "1px solid var(--border)" }}>
                              <div style={{ fontSize: 10, color: "var(--txt3)", marginBottom: 4 }}>{r.label}</div>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--g)" }}>{r.val}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {result.preservation_actions?.length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, marginBottom: 10 }}>🛡️ Preservation Recommendations</div>
                        {result.preservation_actions.map((a) => (
                          <div key={a.id} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "rgba(74,222,128,0.04)", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 8 }}>
                            <span style={{ color: "var(--g)" }}>●</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{a.action_name}</div>
                              <div style={{ fontSize: 12, color: "var(--txt2)", fontWeight: 300 }}>{a.description} · Cost: {a.cost_score}/5 · Effectiveness: {a.effectiveness_score}/5</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <SpoilageRing risk={result.spoilage_risk} />
                </div>
                <WeatherStrip weather={result.weather} loading={weatherLoading} />
                <MandiTable mandis={mandis} />
              </>
            )}
          </div>
        )}

        {/* ══ PRICES ══ */}
        {tab === "prices" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>Live Mandi Prices</h2>
              <p>Real-time APMC prices for {selectedCrop?.name || "your crop"} in {region || "your region"}.</p>
            </div>

            {result && (
              <div className="ai-suggestion-box" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "var(--g)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>🤖 AI Recommended</div>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: "var(--txt)", marginBottom: 4 }}>{result.best_mandi}</div>
                <div style={{ fontSize: 13, color: "var(--txt2)" }}>
                  Predicted Price: ₹{result.predicted_price.toLocaleString()}/q · Est. Profit: ₹{Number(result.net_profit).toLocaleString()} · Risk: {Math.round(result.spoilage_risk * 100)}%
                </div>
              </div>
            )}

            {mandiLoading && (
              <div className="g-card-solid" style={{ padding: 48, textAlign: "center" }}>
                <div className="loading-dots"><span /><span /><span /></div>
                <p style={{ color: "var(--txt2)", fontSize: 14 }}>Loading live prices...</p>
              </div>
            )}

            {!mandiLoading && mandis.length > 0 && (
              <>
                <MandiTable mandis={mandis} />
                {result && (
                  <div className="g-card-solid" style={{ padding: 24, marginTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                      <div className="card-icon">📊</div>
                      <div className="card-title">Profitability Comparison</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
                      {mandis.slice(0, 5).map((m, i) => {
                        const isRec = m.mandi_name === result.best_mandi;
                        const transportCost = m.distance ? m.distance * 25 : 0;
                        const profit = (Number(m.price || 0) * Number(qty || 0)) - transportCost;
                        return (
                          <div key={i} style={{
                            padding: 16, borderRadius: 12,
                            border: isRec ? "1.5px solid var(--g)" : "1px solid var(--border)",
                            background: isRec ? "rgba(74,222,128,0.06)" : "rgba(255,255,255,0.03)",
                          }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{m.mandi_name}</span>
                              {isRec && <span style={{ fontSize: 10, color: "var(--g)", fontWeight: 700, letterSpacing: 1 }}>✓ BEST</span>}
                            </div>
                            <div style={{ fontSize: 12, color: "var(--txt3)", lineHeight: 1.8 }}>
                              <div>Price: <b style={{ color: "var(--txt)" }}>₹{Number(m.price || 0).toLocaleString()}/q</b></div>
                              <div>Transport: <b style={{ color: "var(--amber)" }}>₹{transportCost.toLocaleString()}</b></div>
                              <div>Est. Profit: <b style={{ color: profit > 0 ? "var(--g)" : "var(--red)" }}>₹{profit.toLocaleString()}</b></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}

            {!mandiLoading && mandis.length === 0 && (
              <div className="g-card-solid" style={{ padding: 48 }}>
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <p>No live mandi prices available.</p>
                  <p style={{ fontSize: 12, marginTop: 8 }}>Enter a region and select a crop to see prices.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══ WEATHER ══ */}
        {tab === "weather" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>Live Weather Forecast</h2>
              <p>7-day weather analysis for {region || "your region"}.</p>
            </div>
            <div className="mandi-table-card">
              <h3>Weather Forecast</h3>
              <WeatherStrip
                weather={weather.map((w) => ({
                  day: new Date(w.forecast_date).toLocaleDateString(undefined, { weekday: "short" }),
                  temp: Number(w.temperature || 0),
                  rain: Number(w.rainfall || 0),
                  humidity: Number(w.humidity || 0),
                }))}
                loading={weatherLoading}
              />
            </div>
          </div>
        )}

        {/* ══ SIMULATOR ══ */}
        {tab === "simulator" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>Spoilage Simulator</h2>
              <p>Test how different storage conditions affect spoilage risk.</p>
            </div>
            <SpoilageSimulator />
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {tab === "history" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>Recommendation History</h2>
              <p>All your past AI-generated recommendations.</p>
            </div>
            {history.length === 0 ? (
              <div className="g-card-solid" style={{ padding: 48 }}>
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No recommendations yet. Go to Get Recommendation to start.</p>
                </div>
              </div>
            ) : (
              <div className="g-card-solid" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div className="card-icon">📋</div>
                  <div className="card-title">Past Recommendations</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="g-table">
                    <thead>
                      <tr>
                        <th>Crop</th>
                        <th>Mandi</th>
                        <th>Harvest Window</th>
                        <th>Est. Profit</th>
                        <th>Risk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 20).map((r) => {
                        const risk = Number(r.spoilage_risk || 0) * 100;
                        const riskClass = risk > 50 ? "risk-high" : risk > 25 ? "risk-med" : "risk-low";
                        return (
                          <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "12px 16px" }}><span className="pill green">{r.crop_name || selectedCrop?.name}</span></td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--txt)", fontWeight: 600 }}>{r.suggested_mandi}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{r.harvest_window}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--g)" }}>₹{Number(r.predicted_profit || 0).toLocaleString()}</td>
                            <td style={{ padding: "12px 16px" }}><span className={`risk-chip ${riskClass}`}>{Math.round(risk)}%</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}