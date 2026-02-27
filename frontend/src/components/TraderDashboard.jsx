import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../services/api";
import { useAuth } from "../context/AuthContext";

const TABS = {
  DASHBOARD: "dashboard",
  DEMANDS: "demands",
  PRICES: "prices",
  SUPPLY: "supply",
  PROCUREMENT: "procurement",
  LOGISTICS: "logistics",
  ALERTS: "alerts"
};

const DEMO_DATA = {
  profile: { company_name: "Demo Trading Co.", state: "Maharashtra" },
  stats: { open_demands: 0, active_offers: 0, planned_procurement: 0, unread_alerts: 0 },
  recentDemands: [],
  priceTrends: [
    { crop_name: "Wheat", mandi_name: "Vashi", current_price: 2150, trend_direction: "up", buy_signal: "buy", volatility_index: 12 },
    { crop_name: "Rice", mandi_name: "Azadpur", current_price: 3200, trend_direction: "stable", buy_signal: "wait", volatility_index: 8 },
    { crop_name: "Onion", mandi_name: "Lasalgaon", current_price: 1800, trend_direction: "down", buy_signal: "hold", volatility_index: 25 },
    { crop_name: "Tomato", mandi_name: "Vashi", current_price: 2500, trend_direction: "up", buy_signal: "buy", volatility_index: 18 }
  ]
};

export default function TraderDashboard() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [profile, setProfile] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [demands, setDemands] = useState([]);
  const [priceOffers, setPriceOffers] = useState([]);
  const [priceTrends, setPriceTrends] = useState([]);
  const [supplyData, setSupplyData] = useState([]);
  const [procurementPlans, setProcurementPlans] = useState([]);
  const [logisticsPlans, setLogisticsPlans] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ open_demands: 0, active_offers: 0, planned_procurement: 0, unread_alerts: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [useDemoData, setUseDemoData] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    company_name: "", business_type: "mandi_buyer", state: "", district: "", contact_phone: "", contact_email: "", license_number: "", storage_capacity: ""
  });
  
  const [demandForm, setDemandForm] = useState({ 
    crop_name: "", quantity_needed: "", preferred_mandi: "", offer_price: "", urgency: "normal", quality_grade: "A" 
  });
  
  const [offerForm, setOfferForm] = useState({ 
    crop_name: "", base_price: "", grade_a_bonus: 0, early_harvest_bonus: 0, bulk_volume_bonus: 0 
  });
  
  const [procurementForm, setProcurementForm] = useState({ 
    crop_name: "", planned_quantity: "", target_mandi: "" 
  });
  
  const [logisticsForm, setLogisticsForm] = useState({ 
    crop_name: "", pickup_location: "", delivery_location: "", distance_km: "", estimated_cost: "", transport_mode: "road" 
  });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await apiGet("/api/trader/dashboard", token);
      setProfile(data.profile);
      setHasProfile(!!data.profile);
      setStats(data.stats);
      setDemands(data.recentDemands || []);
      setPriceTrends(data.priceTrends || []);
      setUseDemoData(false);
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Using offline mode");
      setProfile(DEMO_DATA.profile);
      setHasProfile(true);
      setStats(DEMO_DATA.stats);
      setDemands(DEMO_DATA.recentDemands);
      setPriceTrends(DEMO_DATA.priceTrends);
      setUseDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profileForm.company_name || !profileForm.state) {
      showNotification("Please fill in Company Name and State", "error");
      return;
    }
    
    try {
      setLoading(true);
      const data = await apiPost("/api/trader/profile", profileForm, token);
      setProfile(data);
      setHasProfile(true);
      showNotification("Profile saved successfully!", "success");
      await loadDashboard();
    } catch (err) {
      console.error("Save profile error:", err);
      showNotification("Failed to save profile: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const loadDemands = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/trader/demands", token);
      setDemands(data || []);
    } catch (err) {
      console.error("Load demands error:", err);
      showNotification("Could not load demands", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadPriceOffers = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/trader/offers", token);
      setPriceOffers(data || []);
    } catch (err) {
      console.error("Load offers error:", err);
      showNotification("Could not load price offers", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadSupplyData = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/trader/supply", token);
      setSupplyData(data || []);
    } catch (err) {
      console.error("Load supply error:", err);
      setSupplyData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProcurementPlans = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/trader/procurement", token);
      setProcurementPlans(data || []);
    } catch (err) {
      console.error("Load procurement error:", err);
      setProcurementPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadLogisticsPlans = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/trader/logistics", token);
      setLogisticsPlans(data || []);
    } catch (err) {
      console.error("Load logistics error:", err);
      setLogisticsPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiGet("/api/trader/alerts", token);
      setAlerts(data || []);
    } catch (err) {
      console.error("Load alerts error:", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = async (tab) => {
    setActiveTab(tab);
    setLoading(false);
    
    if (tab === TABS.DEMANDS) {
      await loadDemands();
    } else if (tab === TABS.PRICES) {
      await loadPriceOffers();
    } else if (tab === TABS.SUPPLY) {
      await loadSupplyData();
    } else if (tab === TABS.PROCUREMENT) {
      await loadProcurementPlans();
    } else if (tab === TABS.LOGISTICS) {
      await loadLogisticsPlans();
    } else if (tab === TABS.ALERTS) {
      await loadAlerts();
    }
  };

  const createDemand = async () => {
    if (!demandForm.crop_name || !demandForm.quantity_needed) {
      showNotification("Please fill in required fields", "error");
      return;
    }
    
    if (useDemoData) {
      showNotification("Cannot create demand in offline mode", "error");
      return;
    }
    
    try {
      setLoading(true);
      await apiPost("/api/trader/demands", {
        ...demandForm,
        quantity_needed: Number(demandForm.quantity_needed),
        offer_price: demandForm.offer_price ? Number(demandForm.offer_price) : null
      }, token);
      
      setDemandForm({ crop_name: "", quantity_needed: "", preferred_mandi: "", offer_price: "", urgency: "normal", quality_grade: "A" });
      showNotification("Demand posted successfully!", "success");
      await loadDemands();
      setStats(prev => ({ ...prev, open_demands: prev.open_demands + 1 }));
    } catch (err) {
      console.error("Create demand error:", err);
      showNotification("Failed to create demand: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const createPriceOffer = async () => {
    if (!offerForm.crop_name || !offerForm.base_price) {
      showNotification("Please fill in required fields", "error");
      return;
    }
    
    if (useDemoData) {
      showNotification("Cannot create offer in offline mode", "error");
      return;
    }
    
    try {
      setLoading(true);
      await apiPost("/api/trader/offers", {
        ...offerForm,
        base_price: Number(offerForm.base_price),
        grade_a_bonus: Number(offerForm.grade_a_bonus),
        early_harvest_bonus: Number(offerForm.early_harvest_bonus),
        bulk_volume_bonus: Number(offerForm.bulk_volume_bonus)
      }, token);
      
      setOfferForm({ crop_name: "", base_price: "", grade_a_bonus: 0, early_harvest_bonus: 0, bulk_volume_bonus: 0 });
      showNotification("Price offer created!", "success");
      await loadPriceOffers();
      setStats(prev => ({ ...prev, active_offers: prev.active_offers + 1 }));
    } catch (err) {
      console.error("Create offer error:", err);
      showNotification("Failed to create price offer: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const createProcurementPlan = async () => {
    if (!procurementForm.crop_name || !procurementForm.planned_quantity) {
      showNotification("Please fill in required fields", "error");
      return;
    }
    
    if (useDemoData) {
      showNotification("Cannot create plan in offline mode", "error");
      return;
    }
    
    try {
      setLoading(true);
      await apiPost("/api/trader/procurement", {
        ...procurementForm,
        planned_quantity: Number(procurementForm.planned_quantity)
      }, token);
      
      setProcurementForm({ crop_name: "", planned_quantity: "", target_mandi: "" });
      showNotification("Procurement plan created!", "success");
      await loadProcurementPlans();
      setStats(prev => ({ ...prev, planned_procurement: prev.planned_procurement + 1 }));
    } catch (err) {
      console.error("Create procurement error:", err);
      showNotification("Failed to create procurement plan: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const createLogisticsPlan = async () => {
    if (!logisticsForm.crop_name || !logisticsForm.pickup_location || !logisticsForm.delivery_location) {
      showNotification("Please fill in required fields", "error");
      return;
    }
    
    if (useDemoData) {
      showNotification("Cannot create plan in offline mode", "error");
      return;
    }
    
    try {
      setLoading(true);
      await apiPost("/api/trader/logistics", {
        ...logisticsForm,
        distance_km: logisticsForm.distance_km ? Number(logisticsForm.distance_km) : null,
        estimated_cost: logisticsForm.estimated_cost ? Number(logisticsForm.estimated_cost) : null
      }, token);
      
      setLogisticsForm({ crop_name: "", pickup_location: "", delivery_location: "", distance_km: "", estimated_cost: "", transport_mode: "road" });
      showNotification("Logistics plan created!", "success");
      await loadLogisticsPlans();
    } catch (err) {
      console.error("Create logistics error:", err);
      showNotification("Failed to create logistics plan: " + (err.message || "Unknown error"), "error");
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal) => {
    if (signal === "buy") return "#22c55e";
    if (signal === "wait") return "#f59e0b";
    return "#6b7280";
  };

  const getTrendIcon = (trend) => {
    if (trend === "up") return "↑";
    if (trend === "down") return "↓";
    return "→";
  };

  if (loading && activeTab === TABS.DASHBOARD) {
    return <div className="trader-loading">Loading Trader Dashboard...</div>;
  }

  return (
    <div className="trader-dashboard">
      {notification && (
        <div className={`toast-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {useDemoData && (
        <div className="demo-banner">
          ⚠️ Offline Mode - Demo data shown. API unavailable.
        </div>
      )}

      {!hasProfile && !useDemoData && (
        <div className="profile-setup-card">
          <h3>👤 Set Up Your Trader Profile</h3>
          <p className="info-text">Please complete your profile to start posting demands and offers.</p>
          <div className="form-grid">
            <div className="form-group">
              <label>Company Name *</label>
              <input placeholder="Your Company Name" value={profileForm.company_name} onChange={e => setProfileForm({...profileForm, company_name: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Business Type *</label>
              <select value={profileForm.business_type} onChange={e => setProfileForm({...profileForm, business_type: e.target.value})}>
                <option value="mandi_buyer">Mandi Buyer</option>
                <option value="wholesaler">Wholesaler</option>
                <option value="aggregator">Aggregator</option>
                <option value="exporter">Exporter</option>
                <option value="fpo_buyer">FPO Buyer</option>
              </select>
            </div>
            <div className="form-group">
              <label>State *</label>
              <input placeholder="e.g., Maharashtra" value={profileForm.state} onChange={e => setProfileForm({...profileForm, state: e.target.value})} />
            </div>
            <div className="form-group">
              <label>District</label>
              <input placeholder="e.g., Mumbai" value={profileForm.district} onChange={e => setProfileForm({...profileForm, district: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input placeholder="e.g., 9876543210" value={profileForm.contact_phone} onChange={e => setProfileForm({...profileForm, contact_phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input placeholder="email@example.com" value={profileForm.contact_email} onChange={e => setProfileForm({...profileForm, contact_email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>License Number (APMC)</label>
              <input placeholder="License Number" value={profileForm.license_number} onChange={e => setProfileForm({...profileForm, license_number: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Storage Capacity (quintals)</label>
              <input placeholder="e.g., 1000" type="number" value={profileForm.storage_capacity} onChange={e => setProfileForm({...profileForm, storage_capacity: e.target.value})} />
            </div>
            <button className="btn-primary full-width" onClick={saveProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}

      {hasProfile && (
        <>
          <div className="trader-header">
            <h2>🛒 Trader Dashboard</h2>
            <p>{profile?.company_name || "Trading Company"} - {profile?.state || "Maharashtra"}</p>
          </div>

          <div className="trader-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.open_demands}</div>
              <div className="stat-label">Open Demands</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.active_offers}</div>
              <div className="stat-label">Active Offers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.planned_procurement}</div>
              <div className="stat-label">Procurement Plans</div>
            </div>
            <div className="stat-card alert-card">
              <div className="stat-value">{stats.unread_alerts}</div>
              <div className="stat-label">Unread Alerts</div>
            </div>
          </div>

          <div className="trader-tabs">
            {Object.values(TABS).map(tab => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => switchTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="trader-content">
            {activeTab === TABS.DASHBOARD && (
              <div className="dashboard-view">
                <h3>📊 Overview</h3>
                {error && <div className="error-message">{error}</div>}
                <div className="overview-grid">
                  <div className="overview-card">
                    <h4>Recent Demands</h4>
                    {demands.length > 0 ? demands.slice(0, 3).map(d => (
                      <div key={d.id} className="overview-item">
                        <span>{d.crop_name}</span>
                        <span>{d.quantity_needed} quintals</span>
                        <span className={`urgency-${d.urgency}`}>{d.urgency}</span>
                      </div>
                    )) : <p className="no-data">No demands yet</p>}
                  </div>
                  <div className="overview-card">
                    <h4>Price Signals</h4>
                    {priceTrends.length > 0 ? priceTrends.slice(0, 4).map((p, i) => (
                      <div key={i} className="overview-item">
                        <span>{p.crop_name}</span>
                        <span>₹{p.current_price}</span>
                        <span style={{ color: getSignalColor(p.buy_signal) }}>{p.buy_signal}</span>
                      </div>
                    )) : <p className="no-data">No price data available</p>}
                  </div>
                </div>
                
                {!useDemoData && (
                  <div className="quick-actions">
                    <button className="btn-quick" onClick={() => switchTab(TABS.DEMANDS)}>➕ Post Demand</button>
                    <button className="btn-quick" onClick={() => switchTab(TABS.PRICES)}>💰 Create Offer</button>
                    <button className="btn-quick" onClick={() => switchTab(TABS.ALERTS)}>🔔 View Alerts</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === TABS.DEMANDS && (
              <div className="demands-view">
                <h3>📝 Post Demand Requirements</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input placeholder="e.g., Wheat, Rice, Onion" value={demandForm.crop_name} onChange={e => setDemandForm({...demandForm, crop_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Quantity (quintals) *</label>
                    <input placeholder="e.g., 100" type="number" value={demandForm.quantity_needed} onChange={e => setDemandForm({...demandForm, quantity_needed: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Preferred Mandi</label>
                    <input placeholder="e.g., Vashi, Azadpur" value={demandForm.preferred_mandi} onChange={e => setDemandForm({...demandForm, preferred_mandi: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Offer Price (₹/quintal)</label>
                    <input placeholder="e.g., 2200" type="number" value={demandForm.offer_price} onChange={e => setDemandForm({...demandForm, offer_price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Urgency</label>
                    <select value={demandForm.urgency} onChange={e => setDemandForm({...demandForm, urgency: e.target.value})}>
                      <option value="low">Low Urgency</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quality Grade</label>
                    <select value={demandForm.quality_grade} onChange={e => setDemandForm({...demandForm, quality_grade: e.target.value})}>
                      <option value="A">Grade A</option>
                      <option value="B">Grade B</option>
                      <option value="C">Grade C</option>
                    </select>
                  </div>
                  <button className="btn-primary full-width" onClick={createDemand} disabled={loading || useDemoData}>
                    {loading ? "Posting..." : "Post Demand"}
                  </button>
                </div>

                <h4>My Demands</h4>
                {loading ? <div className="loading">Loading...</div> : demands.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Quantity</th><th>Price</th><th>Mandi</th><th>Urgency</th><th>Status</th></tr></thead>
                    <tbody>
                      {demands.map(d => (
                        <tr key={d.id}>
                          <td>{d.crop_name}</td>
                          <td>{d.quantity_needed} q</td>
                          <td>₹{d.offer_price || "Negotiable"}</td>
                          <td>{d.preferred_mandi || "-"}</td>
                          <td><span className={`badge urgency-${d.urgency}`}>{d.urgency}</span></td>
                          <td><span className={`badge status-${d.status}`}>{d.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No demands posted yet.</p>
                )}
              </div>
            )}

            {activeTab === TABS.PRICES && (
              <div className="prices-view">
                <h3>💰 Dynamic Price Offers</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input placeholder="e.g., Wheat" value={offerForm.crop_name} onChange={e => setOfferForm({...offerForm, crop_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Base Price (₹/quintal) *</label>
                    <input placeholder="e.g., 2150" type="number" value={offerForm.base_price} onChange={e => setOfferForm({...offerForm, base_price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Grade A Bonus</label>
                    <input placeholder="e.g., 100" type="number" value={offerForm.grade_a_bonus} onChange={e => setOfferForm({...offerForm, grade_a_bonus: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Early Harvest Bonus</label>
                    <input placeholder="e.g., 50" type="number" value={offerForm.early_harvest_bonus} onChange={e => setOfferForm({...offerForm, early_harvest_bonus: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Bulk Volume Bonus</label>
                    <input placeholder="e.g., 75" type="number" value={offerForm.bulk_volume_bonus} onChange={e => setOfferForm({...offerForm, bulk_volume_bonus: e.target.value})} />
                  </div>
                  <button className="btn-primary full-width" onClick={createPriceOffer} disabled={loading || useDemoData}>
                    {loading ? "Creating..." : "Create Price Offer"}
                  </button>
                </div>

                <h4>📈 Live Price Trends & Signals</h4>
                {priceTrends.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Mandi</th><th>Current Price</th><th>Trend</th><th>Volatility</th><th>Signal</th></tr></thead>
                    <tbody>
                      {priceTrends.map((p, i) => (
                        <tr key={i}>
                          <td>{p.crop_name}</td>
                          <td>{p.mandi_name}</td>
                          <td>₹{p.current_price}</td>
                          <td><span className={`trend-${p.trend_direction}`}>{getTrendIcon(p.trend_direction)} {p.trend_direction}</span></td>
                          <td>{p.volatility_index}%</td>
                          <td><span className="signal-badge" style={{ backgroundColor: getSignalColor(p.buy_signal) }}>{p.buy_signal}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No price trend data available.</p>
                )}
              </div>
            )}

            {activeTab === TABS.SUPPLY && (
              <div className="supply-view">
                <h3>🌾 Aggregated Farmer Supply</h3>
                <p className="info-text">Regional supply data - No individual farmer information shown</p>
                {loading ? <div className="loading">Loading...</div> : supplyData.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Region</th><th>Total Quantity</th><th>Farmers</th><th>Harvest Window</th></tr></thead>
                    <tbody>
                      {supplyData.map((s, i) => (
                        <tr key={i}>
                          <td>{s.crop_name}</td>
                          <td>{s.region}</td>
                          <td>{s.total_quantity?.toLocaleString()} q</td>
                          <td>{s.farmer_count || "-"}</td>
                          <td>{s.harvest_window_start || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <p>No supply data available yet.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === TABS.PROCUREMENT && (
              <div className="procurement-view">
                <h3>📅 Procurement Planning</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input placeholder="e.g., Wheat" value={procurementForm.crop_name} onChange={e => setProcurementForm({...procurementForm, crop_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Planned Quantity (quintals) *</label>
                    <input placeholder="e.g., 500" type="number" value={procurementForm.planned_quantity} onChange={e => setProcurementForm({...procurementForm, planned_quantity: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Target Mandi</label>
                    <input placeholder="e.g., Vashi" value={procurementForm.target_mandi} onChange={e => setProcurementForm({...procurementForm, target_mandi: e.target.value})} />
                  </div>
                  <button className="btn-primary full-width" onClick={createProcurementPlan} disabled={loading || useDemoData}>
                    {loading ? "Creating..." : "Create Procurement Plan"}
                  </button>
                </div>

                <h4>My Procurement Plans</h4>
                {loading ? <div className="loading">Loading...</div> : procurementPlans.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Quantity</th><th>Target Mandi</th><th>Status</th></tr></thead>
                    <tbody>
                      {procurementPlans.map(p => (
                        <tr key={p.id}>
                          <td>{p.crop_name}</td>
                          <td>{p.planned_quantity} q</td>
                          <td>{p.target_mandi || "-"}</td>
                          <td><span className={`badge status-${p.status}`}>{p.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No procurement plans yet.</p>
                )}
              </div>
            )}

            {activeTab === TABS.LOGISTICS && (
              <div className="logistics-view">
                <h3>🚚 Logistics Coordination</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input placeholder="e.g., Wheat" value={logisticsForm.crop_name} onChange={e => setLogisticsForm({...logisticsForm, crop_name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Pickup Location *</label>
                    <input placeholder="e.g., Nashik" value={logisticsForm.pickup_location} onChange={e => setLogisticsForm({...logisticsForm, pickup_location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Delivery Location *</label>
                    <input placeholder="e.g., Mumbai" value={logisticsForm.delivery_location} onChange={e => setLogisticsForm({...logisticsForm, delivery_location: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Distance (km)</label>
                    <input placeholder="e.g., 200" type="number" value={logisticsForm.distance_km} onChange={e => setLogisticsForm({...logisticsForm, distance_km: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Estimated Cost (₹)</label>
                    <input placeholder="e.g., 15000" type="number" value={logisticsForm.estimated_cost} onChange={e => setLogisticsForm({...logisticsForm, estimated_cost: e.target.value})} />
                  </div>
                  <button className="btn-primary full-width" onClick={createLogisticsPlan} disabled={loading || useDemoData}>
                    {loading ? "Planning..." : "Plan Logistics"}
                  </button>
                </div>

                <h4>My Logistics Plans</h4>
                {loading ? <div className="loading">Loading...</div> : logisticsPlans.length > 0 ? (
                  <table className="data-table">
                    <thead><tr><th>Crop</th><th>Pickup</th><th>Delivery</th><th>Distance</th><th>Cost</th><th>Status</th></tr></thead>
                    <tbody>
                      {logisticsPlans.map(l => (
                        <tr key={l.id}>
                          <td>{l.crop_name}</td>
                          <td>{l.pickup_location}</td>
                          <td>{l.delivery_location}</td>
                          <td>{l.distance_km ? `${l.distance_km} km` : "-"}</td>
                          <td>{l.estimated_cost ? `₹${l.estimated_cost.toLocaleString()}` : "-"}</td>
                          <td><span className={`badge status-${l.status}`}>{l.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="no-data">No logistics plans yet.</p>
                )}
              </div>
            )}

            {activeTab === TABS.ALERTS && (
              <div className="alerts-view">
                <h3>🔔 Alerts & Notifications</h3>
                {loading ? <div className="loading">Loading...</div> : alerts.length > 0 ? (
                  <div className="alerts-list">
                    {alerts.map(alert => (
                      <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                        <div className="alert-header">
                          <span className="alert-title">{alert.title}</span>
                          <span className={`alert-severity ${alert.severity}`}>{alert.severity}</span>
                        </div>
                        <div className="alert-message">{alert.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No alerts at this time.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .trader-dashboard { padding: 20px; max-width: 1400px; margin: 0 auto; position: relative; }
        .trader-header { margin-bottom: 20px; }
        .trader-header h2 { margin: 0; color: #1f2937; }
        .trader-header p { margin: 5px 0 0; color: #6b7280; }
        
        .profile-setup-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
        .profile-setup-card h3 { margin: 0 0 8px; color: #1f2937; }
        
        .demo-banner { background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; margin-bottom: 16px; text-align: center; }
        
        .toast-notification { position: fixed; top: 20px; right: 20px; padding: 16px 24px; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .toast-notification.success { background: #10b981; color: white; }
        .toast-notification.error { background: #ef4444; color: white; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        
        .trader-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 32px; font-weight: bold; color: #1f2937; }
        .stat-label { color: #6b7280; font-size: 14px; }
        .alert-card .stat-value { color: #ef4444; }
        
        .trader-tabs { display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; flex-wrap: wrap; }
        .tab-btn { padding: 10px 20px; border: none; background: none; cursor: pointer; font-size: 14px; color: #6b7280; border-radius: 8px; white-space: nowrap; }
        .tab-btn.active { background: #3b82f6; color: white; }
        .tab-btn:hover:not(.active) { background: #f3f4f6; }
        
        .trader-content { background: white; border-radius: 12px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .form-group { display: flex; flex-direction: column; }
        .form-group label { font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
        .form-group input, .form-group select { padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; }
        
        .btn-primary { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; }
        .btn-primary:hover { background: #2563eb; }
        .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
        .btn-primary.full-width { grid-column: 1 / -1; }
        
        .btn-quick { background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-weight: 500; }
        .btn-quick:hover { background: #e5e7eb; }
        .quick-actions { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
        
        .data-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .data-table th { background: #f9fafb; font-weight: 600; color: #374151; }
        
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .urgency-low { background: #d1fae5; color: #065f46; }
        .urgency-normal { background: #dbeafe; color: #1e40af; }
        .urgency-high { background: #fef3c7; color: #92400e; }
        .urgency-critical { background: #fee2e2; color: #991b1b; }
        .status-open { background: #d1fae5; color: #065f46; }
        
        .signal-badge { padding: 4px 12px; border-radius: 12px; color: white; font-size: 12px; font-weight: 600; text-transform: uppercase; }
        .trend-up { color: #22c55e; }
        .trend-down { color: #ef4444; }
        .trend-stable { color: #6b7280; }
        
        .overview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .overview-card { background: #f9fafb; padding: 16px; border-radius: 8px; }
        .overview-card h4 { margin: 0 0 12px; color: #374151; }
        .overview-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        
        .info-text { color: #6b7280; font-size: 14px; margin-bottom: 16px; }
        .no-data { color: #6b7280; font-style: italic; text-align: center; padding: 20px; }
        .loading { text-align: center; padding: 20px; color: #6b7280; }
        .error-message { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; margin-bottom: 16px; }
        .empty-state { text-align: center; padding: 40px; background: #f9fafb; border-radius: 8px; }
        
        .alerts-list { display: flex; flex-direction: column; gap: 12px; }
        .alert-item { padding: 16px; border-radius: 8px; border-left: 4px solid; }
        .alert-item.severity-info { background: #eff6ff; border-color: #3b82f6; }
        .alert-item.severity-warning { background: #fffbeb; border-color: #f59e0b; }
        .alert-item.severity-critical { background: #fef2f2; border-color: #ef4444; }
        .alert-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .alert-title { font-weight: 600; }
        .alert-severity { font-size: 12px; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
        .alert-severity.info { background: #3b82f6; color: white; }
        .alert-severity.warning { background: #f59e0b; color: white; }
        .alert-severity.critical { background: #ef4444; color: white; }
        .alert-message { color: #374151; }
        
        @media (max-width: 768px) {
          .trader-stats { grid-template-columns: repeat(2, 1fr); }
          .overview-grid { grid-template-columns: 1fr; }
          .form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
