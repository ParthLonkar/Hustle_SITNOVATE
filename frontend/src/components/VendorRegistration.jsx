import { useState } from "react";
import { apiPost } from "../services/api";

export default function VendorRegistration({ onSuccess, onSwitch }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    company_name: "",
    company_type: "",
    state: "",
    district: "",
    contact_phone: "",
    supported_crops: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // First register as user with vendor role
      const userData = await apiPost("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: "vendor",
        region: form.state
      });

      // Then create vendor profile
      await apiPost("/api/vendors/profile", {
        company_name: form.company_name,
        company_type: form.company_type,
        state: form.state,
        district: form.district,
        contact_phone: form.contact_phone,
        supported_crops: form.supported_crops.split(",").map(c => c.trim())
      }, userData.token);

      alert("Vendor registration successful! Please login.");
      if (onSwitch) onSwitch();
    } catch (err) {
      setError(err.message || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div className="register-page vendor-register">
      <div className="register-card">
        <h2>Vendor Registration</h2>
        <p className="subtitle">Join as a vendor to trade directly with farmers</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <h3>Account Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input 
                type="password" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Confirm Password *</label>
              <input 
                type="password" 
                value={form.confirmPassword} 
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                required 
              />
            </div>
          </div>

          <h3>Company Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Company Name *</label>
              <input 
                type="text" 
                value={form.company_name} 
                onChange={e => setForm({...form, company_name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>Company Type *</label>
              <select 
                value={form.company_type} 
                onChange={e => setForm({...form, company_type: e.target.value})}
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
                value={form.state} 
                onChange={e => setForm({...form, state: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label>District *</label>
              <input 
                type="text" 
                value={form.district} 
                onChange={e => setForm({...form, district: e.target.value})}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              value={form.contact_phone} 
              onChange={e => setForm({...form, contact_phone: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>Supported Crops (comma separated)</label>
            <input 
              type="text" 
              placeholder="Tomato, Onion, Potato, Wheat..."
              value={form.supported_crops} 
              onChange={e => setForm({...form, supported_crops: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            {loading ? "Registering..." : "Register as Vendor"}
          </button>
        </form>

        <p className="login-link">
          Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); if (onSwitch) onSwitch(); }}>Login here</a>
        </p>
      </div>
    </div>
  );
}
