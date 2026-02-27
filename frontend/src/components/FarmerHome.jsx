import { useEffect, useMemo, useState, useRef, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import { LanguageContext } from "../context/LanguageContext";
import WeatherStrip from "./WeatherStrip";
import SpoilageRing from "./SpoilageRing";
import SpoilageSimulator from "./SpoilageSimulator";
import MandiTable from "./MandiTable";
import { apiGet, apiPost } from "../services/api";

const formatRange = (range) => {
  if (!range) return "-";
  return String(range).replace("[", "").replace("]", "").replace(")", "");
};

const CITY_TO_STATE = {
  nagpur:"Maharashtra",wardha:"Maharashtra",amravati:"Maharashtra",akola:"Maharashtra",
  yavatmal:"Maharashtra",pune:"Maharashtra",mumbai:"Maharashtra",nashik:"Maharashtra",
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

/* ─── Language Selector Component ──────────────────────────────────────────── */
function LanguageSelector() {
  const { language, setLanguage } = useContext(LanguageContext);
  
  return (
    <select 
      value={language} 
      onChange={(e) => setLanguage(e.target.value)}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        borderRadius: "6px",
        padding: "6px 10px",
        fontSize: "13px",
        fontWeight: 500,
        color: "var(--txt)",
        cursor: "pointer",
        outline: "none",
      }}
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="mr">मराठी</option>
    </select>
  );
}

export default function FarmerHome() {
  const { user, logout, token } = useAuth();
  const { t } = useContext(LanguageContext);
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

  const NAV_ITEMS = [
    { id: "home", icon: "🏠", label: t('dashboard') },
    { id: "recommend", icon: "✨", label: t('getRecommendation') },
    { id: "prices", icon: "₹", label: t('livePrices') },
    { id: "weather", icon: "☀", label: t('weather') },
    { id: "simulator", icon: "⚙", label: t('simulator') },
    { id: "history", icon: "⏰", label: t('history') },
  ];

  useEffect(() => {
    const init = async () => {
      try {
        const cropRows = await apiGet("/api/crops");
        setCrops(cropRows);
        if (cropRows.length && !cropId) setCropId(cropRows[0].id);
      } catch { setError(t('failedToGenerate')); }
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
      } catch {
        if (!weatherAbortRef.current?.cancelled) setWeather([]);
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
        // Get token directly from localStorage to ensure it's available
        const token = localStorage.getItem("ag_token") || token;
        if (!token) {
          console.debug("No token available for history");
          return;
        }
        const data = await apiGet("/api/recommendations/me", token);
        console.debug("[History API response - first record]", data?.[0]);
        // Normalize all records to consistent field names
        const normalized = (data || []).map(r => ({
          ...r,
          crop_name: r.crop_name || r.cropName || r.crop || crops.find(c => c.id === r.crop_id)?.name || "",
          suggested_mandi: r.suggested_mandi || r.suggestedMandi || r.mandi_name || "",
          harvest_window: r.harvest_window || r.harvestWindow || "",
          predicted_profit: Number(r.predicted_profit || r.predictedProfit || r.net_profit || 0),
          spoilage_risk: (() => {
            const raw = Number(r.spoilage_risk || r.spoilageRisk || r.risk || 0);
            return raw <= 1 ? raw : raw / 100;
          })(),
          created_at: r.created_at || r.createdAt || r.timestamp || null,
        }));
        setHistory(normalized);
      } catch { setHistory([]); }
    };
    loadHistory();
  }, []);

  const analyze = async () => {
    setError("");
    if (!cropId) { setError(t('pleaseSelectCrop')); return; }
    if (!region) { setError(t('pleaseEnterRegion')); return; }
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

      // Compute the real spoilage risk — prefer the live-simulated value if available,
      // fall back to what the API returned
      const computedSpoilageRisk = data.spoilage_risk;

      // Debug: log what the API actually returns so we can verify field names
      console.debug("[Recommendation API response]", JSON.stringify(data, null, 2));

      setResult({
        best_mandi: data.suggested_mandi,
        harvest_window: data.harvest_window,
        predicted_price: predictedPrice,
        spoilage_risk: computedSpoilageRisk,
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

      // Normalize the history record so it always has consistent field names
      // regardless of what the API returns
      const historyRecord = {
        ...data,
        id: data.id || Date.now(),
        crop_name: data.crop_name || data.cropName || crops.find(c => c.id === cropId)?.name || "",
        suggested_mandi: data.suggested_mandi || data.suggestedMandi || "",
        harvest_window: data.harvest_window || data.harvestWindow || "",
        predicted_profit: Number(data.predicted_profit || data.predictedProfit || data.net_profit || 0),
        // Always store as 0-1 decimal for consistency
        spoilage_risk: computedSpoilageRisk <= 1 ? computedSpoilageRisk : computedSpoilageRisk / 100,
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => [historyRecord, ...prev]);
      setTab("home");
    } catch (err) {
      setError(err?.message || t('failedToGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? t('goodMorning') : hour < 17 ? t('goodAfternoon') : t('goodEvening');

  const Sidebar = () => (
    <aside className="farmer-sidebar">
      <div style={{ padding: "0 18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: 1.2 }}>
            {t('farmerPortal')}
          </div>
          <LanguageSelector />
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
      <div style={{ padding: "16px 18px", borderTop: "1px solid var(--border)", marginTop: "auto" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "var(--txt3)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
          {t('quickStats')}
        </div>
        {[
          { label: t('recommendations'), val: history.length },
          { label: t('activeCrop'), val: selectedCrop?.name || "-" },
          { label: t('region'), val: region || t('notSet') },
        ].map(s => (
          <div key={s.label} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--txt3)", marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="sidebar-logout">
        <button className="sidebar-logout-btn" onClick={logout}>
          <span>🚪</span> {t('signOut')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="farmer-layout">
      <Sidebar />
      <main className="farmer-content">
        {tab === "home" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{greet}, {user?.name} 👋</h2>
              <p>{t('farmOverview')}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
              <div className="stat-card">
                <div className="stat-icon">🌾</div>
                <div className="stat-val">{crops.length}</div>
                <div className="stat-lbl">{t('cropsAvailable')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-val">{history.length}</div>
                <div className="stat-lbl">{t('recommendations')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-val">
                  {result ? `₹${Number(result.net_profit || 0).toLocaleString()}` : "--"}
                </div>
                <div className="stat-lbl">{t('latestEstProfit')}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⚠</div>
                <div className="stat-val">
                  {result ? `${Math.round(result.spoilage_risk * 100)}%` : "--"}
                </div>
                <div className="stat-lbl">{t('spoilageRisk')}</div>
              </div>
            </div>
            {!result ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="g-card-solid" style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 240, textAlign: "center", gridColumn: "1/-1" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,var(--green),var(--green-light))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20 }}>
                    🌱
                  </div>
                  <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 20, color: "var(--txt)", marginBottom: 10 }}>
                    {t('getAiRec')}
                  </div>
                  <p style={{ fontSize: 14, color: "var(--txt2)", marginBottom: 24, maxWidth: 380, fontWeight: 300, lineHeight: 1.65 }}>
                    {t('recSubtitle')}
                  </p>
                  <button className="btn-primary" onClick={() => setTab("recommend")}>
                    {t('getRecommendation')} ✨
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
                <div className="g-card-solid" style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <div className="card-icon">✨</div>
                    <div>
                      <div className="card-title">{t('aiRecommendation')}</div>
                      <div className="card-sub">{t('basedOnWeather')}</div>
                    </div>
                  </div>
                  <div className="rec-headline">
                    <div className="rec-mandi-icon">M</div>
                    <div>
                      <div className="rec-mandi-name">{result.best_mandi}</div>
                      <div className="rec-mandi-sub">{result.harvest_window} - {t('bestNetReturn')}</div>
                    </div>
                  </div>
                  <div className="rec-metrics">
                    <div className="metric">
                      <div className="metric-val">₹{result.predicted_price.toLocaleString()}</div>
                      <div className="metric-lbl">{t('priceQuintal')}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-val">₹{Number(result.net_profit).toLocaleString()}</div>
                      <div className="metric-lbl">{t('estNetProfit')}</div>
                    </div>
                    <div className="metric">
                      <div className="metric-val">{Math.round(result.spoilage_risk * 100)}%</div>
                      <div className="metric-lbl">{t('spoilageRisk')}</div>
                    </div>
                  </div>
                  <div className="ai-explain">
                    <div className="ai-explain-tag">{t('aiExplanation')}</div>
                    <p>{result.explanation}</p>
                    {result.soil_score != null && <p style={{ marginTop: 8 }}>{t('soilSuitability')}: <b style={{ color: "var(--g)" }}>{result.soil_score}%</b></p>}
                  </div>
                </div>
                <div className="g-card-solid" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <SpoilageRing risk={result.spoilage_risk} weather={result.weather} storage={storage} cropType={selectedCrop?.crop_type || "grain"} token={token} />
                </div>
              </div>
            )}
            {result && (
              <div style={{ marginTop: 20 }}>
                <WeatherStrip weather={result.weather} loading={weatherLoading} compact />
              </div>
            )}
            {result && mandis.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <MandiTable mandis={mandis} />
              </div>
            )}
          </div>
        )}
        {tab === "recommend" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{t('getRecommendation')}</h2>
              <p>{t('recSubtitle')}</p>
            </div>
            <div className="g-card-solid" style={{ padding: 28, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                <div className="card-icon">✨</div>
                <div>
                  <div className="card-title">{t('crop')} {t('region')}</div>
                  <div className="card-sub">{t('selectCrop')}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
                <div className="field">
                  <label>{t('crop')}</label>
                  <select value={cropId || ""} onChange={e => setCropId(Number(e.target.value))}>
                    {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>{t('regionState')}</label>
                  <input value={region} onChange={e => setRegion(e.target.value)} placeholder="Maharashtra" />
                </div>
                <div className="field">
                  <label>{t('quantity')}</label>
                  <input value={qty} onChange={e => setQty(e.target.value)} placeholder="100" type="number" />
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <button className="btn-primary" style={{ width: "100%", padding: "12px" }} onClick={analyze} disabled={loading}>
                    {loading ? t('analyzing') : `${t('analyze')} ✨`}
                  </button>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>
                  🌱 {t('soilData')}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 14 }}>
                  <div className="field"><label>{t('soilPh')}</label><input value={soil.ph} onChange={e => setSoil({ ...soil, ph: e.target.value })} placeholder="6.5" /></div>
                  <div className="field"><label>{t('nitrogen')}</label><input value={soil.n} onChange={e => setSoil({ ...soil, n: e.target.value })} placeholder="90" /></div>
                  <div className="field"><label>{t('phosphorus')}</label><input value={soil.p} onChange={e => setSoil({ ...soil, p: e.target.value })} placeholder="50" /></div>
                  <div className="field"><label>{t('potassium')}</label><input value={soil.k} onChange={e => setSoil({ ...soil, k: e.target.value })} placeholder="60" /></div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
                <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, marginBottom: 14 }}>
                  ❄ {t('storageConditions')}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                  <div className="field"><label>{t('storageTemp')}</label><input value={storage.temp} onChange={e => setStorage({ ...storage, temp: e.target.value })} placeholder="18" /></div>
                  <div className="field"><label>{t('humidity')}</label><input value={storage.humidity} onChange={e => setStorage({ ...storage, humidity: e.target.value })} placeholder="60" /></div>
                  <div className="field"><label>{t('transitTime')}</label><input value={storage.transit} onChange={e => setStorage({ ...storage, transit: e.target.value })} placeholder="6" /></div>
                </div>
              </div>
              {error && (
                <div style={{ marginTop: 16, padding: 12, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 9, color: "var(--red)", fontSize: 13 }}>
                  ⚠ {error}
                </div>
              )}
            </div>
            {loading && (
              <div className="g-card-solid" style={{ padding: 48, textAlign: "center" }}>
                <div className="loading-dots"><span /><span /><span /></div>
                <p style={{ color: "var(--txt2)", fontSize: 14, fontWeight: 300 }}>{t('analyzing')}</p>
              </div>
            )}
            {!loading && result && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr", gap: 20, marginBottom: 20 }}>
                  <div className="rec-card">
                    <h3>{t('aiRecommendation')}</h3>
                    <div className="rec-headline">
                      <div className="rec-mandi-icon">M</div>
                      <div>
                        <div className="rec-mandi-name">{result.best_mandi}</div>
                        <div className="rec-mandi-sub">{result.harvest_window} - {t('bestNetReturn')}</div>
                      </div>
                    </div>
                    <div className="rec-metrics">
                      <div className="metric"><div className="metric-val">₹{result.predicted_price.toLocaleString()}</div><div className="metric-lbl">{t('priceQuintal')}</div></div>
                      <div className="metric"><div className="metric-val">₹{Number(result.net_profit).toLocaleString()}</div><div className="metric-lbl">{t('estNetProfit')}</div></div>
                      <div className="metric"><div className="metric-val">{Math.round(result.spoilage_risk * 100)}%</div><div className="metric-lbl">{t('spoilageRisk')}</div></div>
                    </div>
                    <div className="ai-explain">
                      <div className="ai-explain-tag">{t('aiExplanation')}</div>
                      <p>{result.explanation}</p>
                      {result.soil_score != null && <p style={{ marginTop: 8 }}>{t('soilSuitability')}: <b style={{ color: "var(--g)" }}>{result.soil_score}%</b></p>}
                    </div>
                    {selectedCrop && (
                      <div style={{ marginTop: 16, padding: 14, background: "rgba(255,255,255,0.03)", borderRadius: 10, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, marginBottom: 8 }}>{t('cropOptimalRanges')}</div>
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
                        <div style={{ fontSize: 12, color: "var(--txt3)", fontWeight: 600, marginBottom: 10 }}>📦 {t('preservationRecommendations')}</div>
                        {result.preservation_actions.map((a) => (
                          <div key={a.id} style={{ display: "flex", gap: 12, padding: "10px 14px", background: "rgba(74,222,128,0.04)", border: "1px solid var(--border)", borderRadius: 9, marginBottom: 8 }}>
                            <span style={{ color: "var(--g)" }}>✓</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--txt)" }}>{a.action_name}</div>
                              <div style={{ fontSize: 12, color: "var(--txt2)", fontWeight: 300 }}>{a.description} - {t('cost')}: {a.cost_score}/5 - {t('effectiveness')}: {a.effectiveness_score}/5</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <SpoilageRing risk={result.spoilage_risk} weather={result.weather} storage={storage} cropType={selectedCrop?.crop_type || "grain"} token={token} />
                </div>
                <WeatherStrip weather={result.weather} loading={weatherLoading} compact />
                <MandiTable mandis={mandis} />
              </>
            )}
          </div>
        )}
        {tab === "prices" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{t('livePrices')}</h2>
              <p>{t('enterRegionCrop')}</p>
            </div>
            {result && (
              <div className="ai-suggestion-box" style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "var(--g)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>✨ {t('aiRecommendation')}</div>
                <div style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: 22, color: "var(--txt)", marginBottom: 4 }}>{result.best_mandi}</div>
                <div style={{ fontSize: 13, color: "var(--txt2)" }}>
                  {t('priceQuintal')}: ₹{result.predicted_price.toLocaleString()}/q - {t('estNetProfit')}: ₹{Number(result.net_profit).toLocaleString()} - {t('spoilageRisk')}: {Math.round(result.spoilage_risk * 100)}%
                </div>
              </div>
            )}
            {mandiLoading && (
              <div className="g-card-solid" style={{ padding: 48, textAlign: "center" }}>
                <div className="loading-dots"><span /><span /><span /></div>
                <p style={{ color: "var(--txt2)", fontSize: 14 }}>{t('loading')}</p>
              </div>
            )}
            {!mandiLoading && mandis.length > 0 && (
              <MandiTable mandis={mandis} />
            )}
            {!mandiLoading && mandis.length === 0 && (
              <div className="g-card-solid" style={{ padding: 48 }}>
                <div className="empty-state">
                  <div className="empty-icon">🏪</div>
                  <p>{t('noLivePrices')}</p>
                  <p style={{ fontSize: 12, marginTop: 8 }}>{t('enterRegionCrop')}</p>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "weather" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{t('weather')}</h2>
              <p>{t('dayWeatherForecast')} {region || t('notSet')}</p>
            </div>
            <WeatherStrip
              region={region}
              weather={weather.map((w) => ({
                day: new Date(w.forecast_date).toLocaleDateString(undefined, { weekday: "short" }),
                temp: Number(w.temperature || 0),
                rain: Number(w.rainfall || 0),
                humidity: Number(w.humidity || 0),
              }))}
              loading={weatherLoading}
            />
          </div>
        )}
        {tab === "simulator" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{t('simulator')}</h2>
              <p>{t('spoilageRiskEstimator')}</p>
            </div>
            <SpoilageSimulator />
          </div>
        )}
        {tab === "history" && (
          <div style={{ animation: "fadeUp .5s ease" }}>
            <div className="page-greet">
              <h2>{t('history')}</h2>
              <p>{t('pastRecommendations')}</p>
            </div>
            {history.length === 0 ? (
              <div className="g-card-solid" style={{ padding: 48 }}>
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>{t('noRecommendations')}</p>
                </div>
              </div>
            ) : (
              <div className="g-card-solid" style={{ padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div className="card-icon">📋</div>
                  <div className="card-title">{t('pastRecommendations')}</div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="g-table">
                    <thead>
                      <tr>
                        <th>{t('crop')}</th>
                        <th>Mandi</th>
                        <th>{t('harvestWindow')}</th>
                        <th>{t('estNetProfit')}</th>
                        <th>{t('spoilageRisk')}</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(0, 20).map((r, idx) => {
                        const cropName = r.crop_name || r.cropName || r.crop || crops.find(c => c.id === r.crop_id)?.name || "—";
                        const mandi = r.suggested_mandi || r.suggestedMandi || r.mandi_name || r.mandi || "—";
                        const harvestWindow = r.harvest_window || r.harvestWindow || r.harvest_date || "—";
                        const profit = Number(r.predicted_profit || r.predictedProfit || r.net_profit || r.netProfit || 0);
                        const rawRisk = Number(r.spoilage_risk || r.spoilageRisk || r.risk || 0);
                        const riskPct = rawRisk <= 1 ? Math.round(rawRisk * 100) : Math.round(rawRisk);
                        const riskClass = riskPct > 50 ? "risk-high" : riskPct > 25 ? "risk-med" : "risk-low";
                        const date = r.created_at || r.createdAt || r.timestamp || null;
                        const dateStr = date ? new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : `#${idx + 1}`;
                        return (
                          <tr key={r.id || idx} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "12px 16px" }}><span className="pill green">{cropName}</span></td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "var(--txt)", fontWeight: 600 }}>{mandi}</td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{harvestWindow}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "var(--g)" }}>
                              {profit > 0 ? `₹${profit.toLocaleString("en-IN")}` : "—"}
                            </td>
                            <td style={{ padding: "12px 16px" }}><span className={`risk-chip ${riskClass}`}>{riskPct}%</span></td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--txt3)" }}>{dateStr}</td>
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