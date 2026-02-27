-- Trader Module Schema for Agrichain
-- Features: Crop arrivals, price trends, demand posting, supply aggregation, procurement planning, dynamic offers, logistics, analytics

-- Trader profiles (extending users with trader role)
CREATE TABLE IF NOT EXISTS trader_profiles (
  id                BIGSERIAL PRIMARY KEY,
  user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name      TEXT,
  business_type     TEXT NOT NULL, -- 'mandi_buyer', 'wholesaler', 'aggregator', 'exporter', 'fpo_buyer'
  state             TEXT NOT NULL,
  district          TEXT,
  contact_phone     TEXT,
  contact_email     TEXT,
  license_number    TEXT, -- APMC license or other
  preferred_mandis  TEXT[],
  storage_capacity  NUMERIC(12,2), -- in quintals
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Trader demand requirements (what crops they need to buy)
CREATE TABLE IF NOT EXISTS trader_demands (
  id                BIGSERIAL PRIMARY KEY,
  trader_id         BIGINT NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
  crop_id           BIGINT REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  quantity_needed   NUMERIC(12,2) NOT NULL, -- in quintals
  unit              TEXT DEFAULT 'quintal',
  preferred_mandi   TEXT,
  offer_price       NUMERIC(12,2), -- ₹ per quintal
  delivery_date     DATE,
  urgency           TEXT DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','critical')),
  quality_grade     TEXT DEFAULT 'A', -- 'A', 'B', 'C'
  status            TEXT DEFAULT 'open' CHECK (status IN ('open','matched','fulfilled','cancelled')),
  valid_until       DATE,
  notes             TEXT,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dynamic price offers (bonus for quality, early harvest, etc.)
CREATE TABLE IF NOT EXISTS trader_price_offers (
  id                BIGSERIAL PRIMARY KEY,
  trader_id         BIGINT NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
  crop_id           BIGINT REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  base_price        NUMERIC(12,2) NOT NULL,
  grade_a_bonus     NUMERIC(12,2) DEFAULT 0, -- Extra for Grade A
  early_harvest_bonus NUMERIC(12,2) DEFAULT 0, -- Extra for early harvest
  bulk_volume_bonus NUMERIC(12,2) DEFAULT 0, -- Extra for large quantity
  quality_bonus     NUMERIC(12,2) DEFAULT 0,
  total_price       NUMERIC(12,2), -- Calculated
  region            TEXT,
  valid_from        DATE DEFAULT CURRENT_DATE,
  valid_until       DATE,
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aggregated farmer supply (regional view - no individual farmer data)
CREATE TABLE IF NOT EXISTS aggregated_supply (
  id                BIGSERIAL PRIMARY KEY,
  crop_id           BIGINT NOT NULL REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  region            TEXT NOT NULL, -- state or district level
  total_quantity   NUMERIC(12,2) NOT NULL, -- total available in quintals
  estimated_arrival_date DATE,
  average_quality_index NUMERIC(3,2), -- 1-5 scale
  harvest_window_start DATE,
  harvest_window_end   DATE,
  farmer_count     INTEGER DEFAULT 0, -- Count of farmers, not individual data
  last_updated     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(crop_name, region, harvest_window_start)
);

-- Procurement planning (best days to buy, storage needs)
CREATE TABLE IF NOT EXISTS procurement_plans (
  id                BIGSERIAL PRIMARY KEY,
  trader_id         BIGINT NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
  crop_id           BIGINT REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  planned_quantity NUMERIC(12,2) NOT NULL,
  target_mandi      TEXT,
  best_procurement_dates DATE[],
  recommended_storage NUMERIC(12,2), -- storage capacity needed
  estimated_spoilage_risk NUMERIC(5,2),
  notes             TEXT,
  status            TEXT DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','cancelled')),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logistics coordination
CREATE TABLE IF NOT EXISTS logistics_plans (
  id                BIGSERIAL PRIMARY KEY,
  trader_id         BIGINT NOT NULL REFERENCES trader_profiles(id) ON DELETE CASCADE,
  crop_id           BIGINT REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  pickup_location   TEXT NOT NULL,
  delivery_location TEXT NOT NULL,
  distance_km       NUMERIC(10,2),
  transport_mode    TEXT, -- 'road', 'rail', 'air'
  estimated_cost    NUMERIC(12,2),
  bulk_pickup_date  DATE,
  bulk_pickup_quantity NUMERIC(12,2),
  route_suggestion  TEXT,
  status            TEXT DEFAULT 'planned',
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price trend analysis (for traders)
CREATE TABLE IF NOT EXISTS price_trends (
  id                BIGSERIAL PRIMARY KEY,
  crop_id           BIGINT NOT NULL REFERENCES crops(id),
  mandi_name        TEXT NOT NULL,
  current_price     NUMERIC(12,2) NOT NULL,
  previous_price    NUMERIC(12,2),
  price_change_pct  NUMERIC(6,2),
  trend_direction   TEXT, -- 'up', 'down', 'stable'
  volatility_index  NUMERIC(5,2), -- 0-100
  forecast_day_7   NUMERIC(12,2),
  forecast_day_14  NUMERIC(12,2),
  buy_signal        TEXT, -- 'buy', 'wait', 'hold'
  recorded_date     DATE DEFAULT CURRENT_DATE,
  UNIQUE(crop_id, mandi_name, recorded_date)
);

-- Crop arrival predictions
CREATE TABLE IF NOT EXISTS crop_arrivals (
  id                BIGSERIAL PRIMARY KEY,
  crop_id           BIGINT NOT NULL REFERENCES crops(id),
  crop_name         TEXT NOT NULL,
  mandi_name        TEXT NOT NULL,
  predicted_arrival_volume NUMERIC(12,2), -- quintals
  harvest_window    TEXT,
  arrival_date      DATE,
  previous_week_volume NUMERIC(12,2),
  percent_change    NUMERIC(6,2),
  quality_index     NUMERIC(3,2),
  recorded_date     DATE DEFAULT CURRENT_DATE,
  UNIQUE(crop_name, mandi_name, arrival_date)
);

-- Supply-demand alerts
CREATE TABLE IF NOT EXISTS trader_alerts (
  id                BIGSERIAL PRIMARY KEY,
  trader_id         BIGINT REFERENCES trader_profiles(id),
  alert_type        TEXT NOT NULL, -- 'supply_demand_imbalance', 'spoilage_risk', 'price_volatility', 'high_demand'
  severity          TEXT CHECK (severity IN ('info','warning','critical')),
  title             TEXT NOT NULL,
  message           TEXT NOT NULL,
  region            TEXT,
  crop_name         TEXT,
  is_read           BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trader_profiles_location ON trader_profiles(state, district);
CREATE INDEX IF NOT EXISTS idx_trader_demands_status ON trader_demands(status, urgency);
CREATE INDEX IF NOT EXISTS idx_trader_price_offers_active ON trader_price_offers(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_aggregated_supply_region ON aggregated_supply(region, crop_name);
CREATE INDEX IF NOT EXISTS idx_price_trends_crop ON price_trends(crop_id, recorded_date);
CREATE INDEX IF NOT EXISTS idx_crop_arrivals_mandi ON crop_arrivals(mandi_name, arrival_date);
CREATE INDEX IF NOT EXISTS idx_trader_alerts_read ON trader_alerts(trader_id, is_read);

-- View for trader dashboard analytics
CREATE OR REPLACE VIEW trader_dashboard AS
SELECT 
  tp.id as trader_id,
  tp.user_id,
  tp.company_name,
  tp.business_type,
  tp.state,
  COUNT(DISTINCT td.id) as total_demands,
  COUNT(DISTINCT tpo.id) as active_offers,
  COUNT(DISTINCT pp.id) as procurement_plans,
  COUNT(DISTINCT ta.id) as unread_alerts
FROM trader_profiles tp
LEFT JOIN trader_demands td ON tp.id = td.trader_id AND td.status = 'open'
LEFT JOIN trader_price_offers tpo ON tp.id = tpo.trader_id AND tpo.is_active = true
LEFT JOIN procurement_plans pp ON tp.id = pp.trader_id AND pp.status = 'planned'
LEFT JOIN trader_alerts ta ON tp.id = ta.trader_id AND ta.is_read = false
GROUP BY tp.id, tp.user_id, tp.company_name, tp.business_type, tp.state;
