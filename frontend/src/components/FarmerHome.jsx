import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { crops, regions, mockRecommendation, mockMandis } from "./mockData";
import WeatherStrip from "./WeatherStrip";
import SpoilageRing from "./SpoilageRing";
import MandiTable from "./MandiTable";

export default function FarmerHome() {
  const { user } = useAuth();
  const [crop, setCrop] = useState(crops[0]);
  const [region, setRegion] = useState(regions[0]);
  const [qty, setQty] = useState("100");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setLoading(false);
      setResult(mockRecommendation);
    }, 1800);
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="farmer-home">
      <div className="page-greet">
        <h2>{greet}, {user?.name}</h2>
        <p>Enter your crop details below to get today's harvest and market recommendation.</p>
      </div>

      <div className="input-card">
        <h3>Crop Analysis Input</h3>
        <div className="input-grid">
          <div className="field" style={{ margin: 0 }}>
            <label>Crop</label>
            <select value={crop} onChange={e => setCrop(e.target.value)}>{crops.map(c => <option key={c}>{c}</option>)}</select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Region</label>
            <select value={region} onChange={e => setRegion(e.target.value)}>{regions.map(r => <option key={r}>{r}</option>)}</select>
          </div>
          <div className="field" style={{ margin: 0 }}>
            <label>Quantity (quintals)</label>
            <input value={qty} onChange={e => setQty(e.target.value)} placeholder="100" type="number" />
          </div>
          <button className="btn-analyze" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing..." : "Get Recommendation ->"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="rec-card loading-card">
          <div className="loading-dots"><span /><span /><span /></div>
          <p>Running AI models - price forecasting, spoilage estimation, route optimization...</p>
        </div>
      )}

      {!loading && !result && (
        <div className="rec-card">
          <div className="empty-state">
            <div className="empty-icon">AC</div>
            <p>Select your crop, region, and quantity above and click <strong>Get Recommendation</strong></p>
          </div>
        </div>
      )}

      {result && (
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
              </div>
            </div>
            <SpoilageRing risk={result.spoilage_risk} />
          </div>

          <WeatherStrip weather={result.weather} />
          <MandiTable mandis={mockMandis} />
        </>
      )}
    </div>
  );
}
