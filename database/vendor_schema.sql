-- Vendor Module Schema for Agrichain

-- Add vendor role to users (run this if users table already exists)
-- ALTER TABLE users DROP CONSTRAINT users_role_check;
-- ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('farmer','admin','trader','vendor'));

-- Vendor profiles table
CREATE TABLE IF NOT EXISTS vendors (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name      TEXT NOT NULL,
  company_type      TEXT NOT NULL, -- 'trader', 'processor', 'retailer', 'exporter', 'cold_storage'
  state             TEXT NOT NULL,
  district          TEXT NOT NULL,
  contact_phone     TEXT,
  contact_email     TEXT,
  supported_crops   TEXT[], -- Array of crop names
  storage_capacity  NUMERIC(12,2), -- in quintals
  has_refrigerated  BOOLEAN DEFAULT FALSE,
  latitude          NUMERIC(10,8),
  longitude         NUMERIC(11,8),
  description       TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor price offers (real-time bidding)
CREATE TABLE IF NOT EXISTS vendor_prices (
  id                BIGSERIAL PRIMARY KEY,
  vendor_id         BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  crop_id           BIGINT REFERENCES crops(id) ON DELETE SET NULL,
  crop_name         TEXT NOT NULL,
  price_per_quintal NUMERIC(12,2) NOT NULL,
  quantity_quintal NUMERIC(12,2) NOT NULL,
  pickup_location   TEXT NOT NULL,
  validity_date     DATE NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, crop_name, validity_date)
);

-- Vendor transport availability
CREATE TABLE IF NOT EXISTS vendor_transport (
  id                BIGSERIAL PRIMARY KEY,
  vendor_id         BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  vehicle_type      TEXT NOT NULL, -- 'truck', 'tempo', 'lorry', 'refrigerated_truck'
  vehicle_number    TEXT NOT NULL,
  capacity_quintal  NUMERIC(12,2) NOT NULL,
  cost_per_km       NUMERIC(10,2) NOT NULL,
  is_refrigerated   BOOLEAN DEFAULT FALSE,
  available_from   DATE,
  available_to     DATE,
  is_available      BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor storage facilities (cold storage, warehouses)
CREATE TABLE IF NOT EXISTS vendor_storage (
  id                BIGSERIAL PRIMARY KEY,
  vendor_id         BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  facility_name     TEXT NOT NULL,
  facility_type     TEXT NOT NULL, -- 'cold_storage', 'warehouse', 'godown'
  temperature_min   NUMERIC(5,2), -- in Celsius
  temperature_max   NUMERIC(5,2),
  humidity_min      NUMERIC(5,2), -- percentage
  humidity_max      NUMERIC(5,2),
  capacity_quintal  NUMERIC(12,2) NOT NULL,
  cost_per_day      NUMERIC(10,2) NOT NULL,
  address           TEXT NOT NULL,
  district          TEXT NOT NULL,
  state             TEXT NOT NULL,
  is_available      BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor reliability ratings
CREATE TABLE IF NOT EXISTS vendor_ratings (
  id                BIGSERIAL PRIMARY KEY,
  vendor_id         BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  farmer_id         BIGINT NOT NULL REFERENCES users(id),
  transaction_id    BIGINT,
  price_consistency NUMERIC(3,2), -- 1-5 rating
  delivery_success  NUMERIC(3,2), -- 1-5 rating
  quality_rating    NUMERIC(3,2), -- 1-5 rating
  overall_rating    NUMERIC(3,2) GENERATED ALWAYS AS ((price_consistency + delivery_success + quality_rating) / 3) STORED,
  review_text       TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(farmer_id, vendor_id, transaction_id)
);

-- Transport bookings (farmers booking vendor transport)
CREATE TABLE IF NOT EXISTS transport_bookings (
  id                BIGSERIAL PRIMARY KEY,
  farmer_id         BIGINT NOT NULL REFERENCES users(id),
  vendor_id         BIGINT NOT NULL REFERENCES vendors(id),
  transport_id      BIGINT NOT NULL REFERENCES vendor_transport(id),
  crop_id           BIGINT REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  quantity_quintal NUMERIC(12,2) NOT NULL,
  pickup_address   TEXT NOT NULL,
  delivery_address  TEXT NOT NULL,
  distance_km       NUMERIC(10,2) NOT NULL,
  estimated_cost    NUMERIC(12,2) NOT NULL,
  pickup_date       DATE NOT NULL,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','in_transit','delivered','cancelled')),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor demand dashboard (what crops are in high demand)
CREATE TABLE IF NOT EXISTS vendor_demand (
  id                BIGSERIAL PRIMARY KEY,
  vendor_id         BIGINT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  crop_name         TEXT NOT NULL,
  quantity_needed   NUMERIC(12,2) NOT NULL,
  preferred_price   NUMERIC(12,2),
  urgency           TEXT DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','critical')),
  valid_until       DATE NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(state, district);
CREATE INDEX IF NOT EXISTS idx_vendor_prices_active ON vendor_prices(vendor_id, is_active, validity_date);
CREATE INDEX IF NOT EXISTS idx_vendor_transport_available ON vendor_transport(vendor_id, is_available);
CREATE INDEX IF NOT EXISTS idx_vendor_storage_available ON vendor_storage(facility_type, is_available);
CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transport_bookings_status ON transport_bookings(status, farmer_id);
CREATE INDEX IF NOT EXISTS idx_vendor_demand_active ON vendor_demand(vendor_id, is_active);

-- View for vendor analytics
CREATE OR REPLACE VIEW vendor_analytics AS
SELECT 
  v.id as vendor_id,
  v.company_name,
  v.company_type,
  COUNT(DISTINCT vp.id) as total_price_offers,
  COUNT(DISTINCT vt.id) as total_transport_units,
  COUNT(DISTINCT vs.id) as total_storage_facilities,
  COUNT(DISTINCT tr.id) as total_bookings,
  COALESCE(AVG(vr.overall_rating), 0) as avg_rating,
  COUNT(DISTINCT vr.id) as total_ratings
FROM vendors v
LEFT JOIN vendor_prices vp ON v.id = vp.vendor_id AND vp.is_active = true
LEFT JOIN vendor_transport vt ON v.id = vt.vendor_id AND vt.is_available = true
LEFT JOIN vendor_storage vs ON v.id = vs.vendor_id AND vs.is_available = true
LEFT JOIN transport_bookings tr ON v.id = tr.vendor_id
LEFT JOIN vendor_ratings vr ON v.id = vr.vendor_id
GROUP BY v.id, v.company_name, v.company_type;
