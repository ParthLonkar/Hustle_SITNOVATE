import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost, apiPut } from "../services/api";

const VENDOR_TABS = {
  OVERVIEW: "overview",
  PRICES: "prices",
  TRANSPORT: "transport",
  STORAGE: "storage",
  BOOKINGS: "bookings",
  DEMAND: "demand",
  ANALYTICS: "analytics"
};

export default function VendorDashboard() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState(VENDOR_TABS.OVERVIEW);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [priceForm, setPriceForm] = useState({
    crop_name: "",
    price_per_quintal: "",
    quantity_quintal: "",
    pickup_location: "",
    validity_date: ""
  });
  
  const [transportForm, setTransportForm] = useState({
    vehicle_type: "truck",
    vehicle_number: "",
    capacity_quintal: "",
    cost_per_km: "",
    is_refrigerated: false,
    available_from: "",
    available_to: ""
  });

  const [storageForm, setStorageForm] = useState({
    facility_name: "",
    facility_type: "warehouse",
    temperature_min: "",
    temperature_max: "",
    humidity_min: "",
    humidity_max: "",
    capacity_quintal: "",
    cost_per_day: "",
    address: "",
    district: "",
    state: ""
  });

  const [demandForm, setDemandForm] = useState({
    crop_name: "",
    quantity_needed: "",
    preferred_price: "",
    urgency: "normal",
    valid_until: ""
  });

  const [prices, setPrices] = useState([]);
  const [transport, setTransport] = useState([]);
  const [storage, setStorage] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [demands, setDemands] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadVendorProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      loadVendorData();
    }
  }, [profile, activeTab]);

  const loadVendorProfile = async () => {
    try {
      const data = await apiGet("/api/vendors/profile", token);
      setProfile(data);
      setLoading(false);
    } catch (err) {
      setError("Vendor profile not found. Please complete registration.");
      setLoading(false);
    }
  };

  const loadVendorData = async () => {
    try {
      setError("");
      switch (activeTab) {
        case VENDOR_TABS.PRICES:
          const pricesData = await apiGet("/api/vendors/my-prices", token);
          setPrices(pricesData);
          break;
        case VENDOR_TABS.TRANSPORT:
          const transportData = await apiGet("/api/vendors/my-transport", token);
          setTransport(transportData);
          break;
        case VENDOR_TABS.STORAGE:
          // Storage is managed internally, just set empty for now
          setStorage([]);
          break;
        case VENDOR_TABS.BOOKINGS:
          const bookingsData = await apiGet("/api/vendors/vendor-bookings", token);
          setBookings(bookingsData);
          break;
        case VENDOR_TABS.DEMAND:
          // Load demands posted by this vendor
          const demandsData = await apiGet("/api/vendors/demand/active", token);
          setDemands(demandsData);
          break;
        case VENDOR_TABS.ANALYTICS:
          const analyticsData = await apiGet("/api/vendors/analytics", token);
          setAnalytics(analyticsData);
          break;
      }
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    try {
      const data = await apiPost("/api/vendors/profile", profile, token);
      setProfile(data);
      setSuccess("Vendor profile created successfully!");
    } catch (err) {
      setError(err.message || "Failed to create profile");
    }
  };

  const handleAddPrice = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/vendors/prices", priceForm, token);
      setSuccess("Price offer added!");
      setPriceForm({ crop_name: "", price_per_quintal: "", quantity_quintal: "", pickup_location: "", validity_date: "" });
      loadVendorData();
    } catch (err) {
      setError(err.message || "Failed to add price");
    }
  };

  const handleAddTransport = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/vendors/transport", transportForm, token);
      setSuccess("Transport added!");
      setTransportForm({ vehicle_type: "truck", vehicle_number: "", capacity_quintal: "", cost_per_km: "", is_refrigerated: false, available_from: "", available_to: "" });
      loadVendorData();
    } catch (err) {
      setError(err.message || "Failed to add transport");
    }
  };

  const handleAddStorage = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/vendors/storage", storageForm, token);
      setSuccess("Storage facility added!");
      setStorageForm({ facility_name: "", facility_type: "warehouse", temperature_min: "", temperature_max: "", humidity_min: "", humidity_max: "", capacity_quintal: "", cost_per_day: "", address: "", district: "", state: "" });
      loadVendorData();
    } catch (err) {
      setError(err.message || "Failed to add storage");
    }
  };

  const handleAddDemand = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiPost("/api/vendors/demand", demandForm, token);
      setSuccess("Demand posted!");
      setDemandForm({ crop_name: "", quantity_needed: "", preferred_price: "", urgency: "normal", valid_until: "" });
      loadVendorData();
    } catch (err) {
      setError(err.message || "Failed to post demand");
    }
  };

  const handleUpdateBooking = async (bookingId, status) => {
    try {
      await apiPut(`/api/vendors/bookings/${bookingId}/status`, { status }, token);
      setSuccess(`Booking ${status}!`);
      loadVendorData();
    } catch (err) {
      setError(err.message || "Failed to update booking");
    }
  };

  if (loading) {
    return <div className="vendor-dashboard"><div className="loading">Loading...</div></div>;
  }

  if (!profile) {
    return (
      <div className="vendor-dashboard">
        <div className="vendor-setup-card">
          <h2>Setup Your Vendor Profile</h2>
          <p>Complete your profile to start trading</p>
          
          {error && <div className="error-msg">{error}</div>}
          {success && <div className="success-msg">{success}</div>}

          <form onSubmit={handleCreateProfile}>
            <div className="form-row">
              <div className="form-group">
                <label>Company Name *</label>
                <input 
                  type="text" 
                  value={profile?.company_name || ""}
                  onChange={e => setProfile({...profile, company_name: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Company Type *</label>
                <select 
                  value={profile?.company_type || ""}
                  onChange={e => setProfile({...profile, company_type: e.target.value})}
                  required
                >
                  <option value="">Select type</option>
                  <option value="trader">Trader</option>
                  <option value="processor">Processor</option>
                  <option value="retailer">Retailer</option>
                  <option value="exporter">Exporter</option>
                  <option value="cold_storage">Cold Storage Provider</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>State *</label>
                <input 
                  type="text" 
                  value={profile?.state || ""}
                  onChange={e => setProfile({...profile, state: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>District *</label>
                <input 
                  type="text" 
                  value={profile?.district || ""}
                  onChange={e => setProfile({...profile, district: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  value={profile?.contact_phone || ""}
                  onChange={e => setProfile({...profile, contact_phone: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={profile?.contact_email || ""}
                  onChange={e => setProfile({...profile, contact_email: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Supported Crops (comma separated)</label>
              <input 
                type="text" 
                placeholder="Tomato, Onion, Potato..."
                value={profile?.supported_crops?.join(", ") || ""}
                onChange={e => setProfile({...profile, supported_crops: e.target.value.split(",").map(c => c.trim())})}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Storage Capacity (quintals)</label>
                <input 
                  type="number" 
                  value={profile?.storage_capacity || ""}
                  onChange={e => setProfile({...profile, storage_capacity: e.target.value})}
                />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input 
                    type="checkbox" 
                    checked={profile?.has_refrigerated || false}
                    onChange={e => setProfile({...profile, has_refrigerated: e.target.checked})}
                  />
                  Has Refrigerated Storage
                </label>
              </div>
            </div>

            <button type="submit" className="btn-primary">Create Profile</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="vendor-header">
        <h2>Welcome, {profile.company_name}</h2>
        <span className="vendor-type">{profile.company_type}</span>
        <span className="vendor-location">{profile.district}, {profile.state}</span>
      </div>

      {error && <div className="error-msg">{error}</div>}
      {success && <div className="success-msg">{success}</div>}

      <div className="vendor-tabs">
        <button className={activeTab === VENDOR_TABS.OVERVIEW ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.OVERVIEW)}>Overview</button>
        <button className={activeTab === VENDOR_TABS.PRICES ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.PRICES)}>Price Offers</button>
        <button className={activeTab === VENDOR_TABS.TRANSPORT ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.TRANSPORT)}>Transport</button>
        <button className={activeTab === VENDOR_TABS.STORAGE ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.STORAGE)}>Storage</button>
        <button className={activeTab === VENDOR_TABS.BOOKINGS ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.BOOKINGS)}>Bookings</button>
        <button className={activeTab === VENDOR_TABS.DEMAND ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.DEMAND)}>Demand</button>
        <button className={activeTab === VENDOR_TABS.ANALYTICS ? "active" : ""} onClick={() => setActiveTab(VENDOR_TABS.ANALYTICS)}>Analytics</button>
      </div>

      <div className="vendor-content">
        {activeTab === VENDOR_TABS.OVERVIEW && (
          <div className="overview-tab">
            <div className="stat-cards">
              <div className="stat-card">
                <h3>{profile.supported_crops?.length || 0}</h3>
                <p>Crops Supported</p>
              </div>
              <div className="stat-card">
                <h3>{profile.storage_capacity || 0}</h3>
                <p>Storage Capacity (q)</p>
              </div>
              <div className="stat-card">
                <h3>{profile.has_refrigerated ? "Yes" : "No"}</h3>
                <p>Refrigerated</p>
              </div>
            </div>
            
            <div className="vendor-info-section">
              <h3>Contact Information</h3>
              <p><strong>Phone:</strong> {profile.contact_phone || "Not provided"}</p>
              <p><strong>Email:</strong> {profile.contact_email || "Not provided"}</p>
              <p><strong>Address:</strong> {profile.description || "Not provided"}</p>
            </div>
          </div>
        )}

        {activeTab === VENDOR_TABS.PRICES && (
          <div className="prices-tab">
            <div className="form-card">
              <h3>Add New Price Offer</h3>
              <form onSubmit={handleAddPrice}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input type="text" value={priceForm.crop_name} onChange={e => setPriceForm({...priceForm, crop_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Price per Quintal (₹) *</label>
                    <input type="number" value={priceForm.price_per_quintal} onChange={e => setPriceForm({...priceForm, price_per_quintal: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity (quintals) *</label>
                    <input type="number" value={priceForm.quantity_quintal} onChange={e => setPriceForm({...priceForm, quantity_quintal: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Pickup Location *</label>
                    <input type="text" value={priceForm.pickup_location} onChange={e => setPriceForm({...priceForm, pickup_location: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Valid Until *</label>
                  <input type="date" value={priceForm.validity_date} onChange={e => setPriceForm({...priceForm, validity_date: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary">Add Price Offer</button>
              </form>
            </div>

            <div className="list-card">
              <h3>Your Active Price Offers</h3>
              {prices.length === 0 ? (
                <p className="empty-state">No price offers yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Price/q</th>
                      <th>Quantity</th>
                      <th>Location</th>
                      <th>Valid Until</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map(price => (
                      <tr key={price.id}>
                        <td>{price.crop_name}</td>
                        <td>₹{price.price_per_quintal}</td>
                        <td>{price.quantity_quintal} q</td>
                        <td>{price.pickup_location}</td>
                        <td>{new Date(price.validity_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === VENDOR_TABS.TRANSPORT && (
          <div className="transport-tab">
            <div className="form-card">
              <h3>Add Transport Vehicle</h3>
              <form onSubmit={handleAddTransport}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Type *</label>
                    <select value={transportForm.vehicle_type} onChange={e => setTransportForm({...transportForm, vehicle_type: e.target.value})}>
                      <option value="truck">Truck</option>
                      <option value="tempo">Tempo</option>
                      <option value="lorry">Lorry</option>
                      <option value="refrigerated_truck">Refrigerated Truck</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Vehicle Number *</label>
                    <input type="text" value={transportForm.vehicle_number} onChange={e => setTransportForm({...transportForm, vehicle_number: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity (quintals) *</label>
                    <input type="number" value={transportForm.capacity_quintal} onChange={e => setTransportForm({...transportForm, capacity_quintal: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Cost per KM (₹) *</label>
                    <input type="number" value={transportForm.cost_per_km} onChange={e => setTransportForm({...transportForm, cost_per_km: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group checkbox-group">
                  <label>
                    <input type="checkbox" checked={transportForm.is_refrigerated} onChange={e => setTransportForm({...transportForm, is_refrigerated: e.target.checked})} />
                    Refrigerated Vehicle
                  </label>
                </div>
                <button type="submit" className="btn-primary">Add Transport</button>
              </form>
            </div>

            <div className="list-card">
              <h3>Your Transport Fleet</h3>
              {transport.length === 0 ? (
                <p className="empty-state">No transport added yet</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Number</th>
                      <th>Capacity</th>
                      <th>Cost/km</th>
                      <th>Refrigerated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transport.map(t => (
                      <tr key={t.id}>
                        <td>{t.vehicle_type}</td>
                        <td>{t.vehicle_number}</td>
                        <td>{t.capacity_quintal} q</td>
                        <td>₹{t.cost_per_km}</td>
                        <td>{t.is_refrigerated ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === VENDOR_TABS.STORAGE && (
          <div className="storage-tab">
            <div className="form-card">
              <h3>Add Storage Facility</h3>
              <form onSubmit={handleAddStorage}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Facility Name *</label>
                    <input type="text" value={storageForm.facility_name} onChange={e => setStorageForm({...storageForm, facility_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Facility Type *</label>
                    <select value={storageForm.facility_type} onChange={e => setStorageForm({...storageForm, facility_type: e.target.value})}>
                      <option value="warehouse">Warehouse</option>
                      <option value="cold_storage">Cold Storage</option>
                      <option value="godown">Godown</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Min Temperature (°C)</label>
                    <input type="number" value={storageForm.temperature_min} onChange={e => setStorageForm({...storageForm, temperature_min: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Max Temperature (°C)</label>
                    <input type="number" value={storageForm.temperature_max} onChange={e => setStorageForm({...storageForm, temperature_max: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Capacity (quintals) *</label>
                    <input type="number" value={storageForm.capacity_quintal} onChange={e => setStorageForm({...storageForm, capacity_quintal: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Cost per Day (₹) *</label>
                    <input type="number" value={storageForm.cost_per_day} onChange={e => setStorageForm({...storageForm, cost_per_day: e.target.value})} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input type="text" value={storageForm.address} onChange={e => setStorageForm({...storageForm, address: e.target.value})} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>District *</label>
                    <input type="text" value={storageForm.district} onChange={e => setStorageForm({...storageForm, district: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input type="text" value={storageForm.state} onChange={e => setStorageForm({...storageForm, state: e.target.value})} required />
                  </div>
                </div>
                <button type="submit" className="btn-primary">Add Storage Facility</button>
              </form>
            </div>
          </div>
        )}

        {activeTab === VENDOR_TABS.BOOKINGS && (
          <div className="bookings-tab">
            <h3>Transport Bookings</h3>
            {bookings.length === 0 ? (
              <p className="empty-state">No bookings yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Quantity</th>
                    <th>Pickup</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>{b.farmer_name}</td>
                      <td>{b.crop_name}</td>
                      <td>{b.quantity_quintal} q</td>
                      <td>{b.pickup_address}</td>
                      <td><span className={`status-badge ${b.status}`}>{b.status}</span></td>
                      <td>
                        {b.status === "pending" && (
                          <>
                            <button className="btn-sm btn-success" onClick={() => handleUpdateBooking(b.id, "confirmed")}>Accept</button>
                            <button className="btn-sm btn-danger" onClick={() => handleUpdateBooking(b.id, "cancelled")}>Reject</button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button className="btn-sm btn-primary" onClick={() => handleUpdateBooking(b.id, "in_transit")}>Start</button>
                        )}
                        {b.status === "in_transit" && (
                          <button className="btn-sm btn-success" onClick={() => handleUpdateBooking(b.id, "delivered")}>Delivered</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === VENDOR_TABS.DEMAND && (
          <div className="demand-tab">
            <div className="form-card">
              <h3>Post Crop Demand</h3>
              <form onSubmit={handleAddDemand}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Crop Name *</label>
                    <input type="text" value={demandForm.crop_name} onChange={e => setDemandForm({...demandForm, crop_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Quantity Needed (quintals) *</label>
                    <input type="number" value={demandForm.quantity_needed} onChange={e => setDemandForm({...demandForm, quantity_needed: e.target.value})} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Price (₹/q)</label>
                    <input type="number" value={demandForm.preferred_price} onChange={e => setDemandForm({...demandForm, preferred_price: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Urgency</label>
                    <select value={demandForm.urgency} onChange={e => setDemandForm({...demandForm, urgency: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Valid Until *</label>
                  <input type="date" value={demandForm.valid_until} onChange={e => setDemandForm({...demandForm, valid_until: e.target.value})} required />
                </div>
                <button type="submit" className="btn-primary">Post Demand</button>
              </form>
            </div>

            <div className="list-card">
              <h3>Current Demands</h3>
              {demands.length === 0 ? (
                <p className="empty-state">No demands posted</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Crop</th>
                      <th>Quantity</th>
                      <th>Preferred Price</th>
                      <th>Urgency</th>
                      <th>Valid Until</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demands.map(d => (
                      <tr key={d.id}>
                        <td>{d.crop_name}</td>
                        <td>{d.quantity_needed} q</td>
                        <td>₹{d.preferred_price || "Negotiable"}</td>
                        <td><span className={`urgency-${d.urgency}`}>{d.urgency}</span></td>
                        <td>{new Date(d.valid_until).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === VENDOR_TABS.ANALYTICS && analytics && (
          <div className="analytics-tab">
            <div className="stat-cards">
              <div className="stat-card">
                <h3>{analytics.total_price_offers}</h3>
                <p>Active Price Offers</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.total_transport_units}</h3>
                <p>Transport Units</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.total_storage_facilities}</h3>
                <p>Storage Facilities</p>
              </div>
              <div className="stat-card">
                <h3>{analytics.average_rating?.toFixed(1) || "N/A"}</h3>
                <p>Average Rating</p>
              </div>
            </div>

            <div className="bookings-breakdown">
              <h3>Bookings by Status</h3>
              <div className="status-grid">
                {analytics.bookings_by_status?.map(b => (
                  <div key={b.status} className="status-card">
                    <h4>{b.count}</h4>
                    <p>{b.status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
