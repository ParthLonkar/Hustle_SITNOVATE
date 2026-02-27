// Trader controller - works without database
let pool = null;

const loadPool = async () => {
  if (!pool) {
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      console.warn('Database not available - using demo mode');
    }
  }
  return pool;
};

// Helper to safely run a query
const safeQuery = async (query, params = []) => {
  const db = await loadPool();
  if (!db) return { rows: [] };
  try {
    return await db.query(query, params);
  } catch (e) {
    console.log("Query failed:", e.message);
    return { rows: [] };
  }
};

// ==================== TRADER PROFILE ====================

export const saveTraderProfile = async (req, res) => {
  try {
    const { company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existing = await safeQuery("SELECT id FROM trader_profiles WHERE user_id = $1", [userId]);

    if (existing.rows.length > 0) {
      const result = await safeQuery(
        `UPDATE trader_profiles SET company_name = $1, business_type = $2, state = $3, district = $4,
          contact_phone = $5, contact_email = $6, license_number = $7, preferred_mandis = $8, storage_capacity = $9
         WHERE user_id = $10 RETURNING *`,
        [company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity, userId]
      );
      return res.json(result.rows[0] || { user_id: userId, company_name, demo: true });
    } else {
      const result = await safeQuery(
        `INSERT INTO trader_profiles (user_id, company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [userId, company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity]
      );
      return res.status(201).json(result.rows[0] || { user_id: userId, company_name, demo: true });
    }
  } catch (err) {
    console.error("Save trader profile error:", err);
    return res.status(201).json({ user_id: req.user?.id, ...req.body, demo: true });
  }
};

export const getMyTraderProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await safeQuery("SELECT * FROM trader_profiles WHERE user_id = $1", [userId]);
    return res.json(result.rows[0] || null);
  } catch (err) {
    return res.json(null);
  }
};

// ==================== TRADER DEMANDS ====================

export const createTraderDemand = async (req, res) => {
  try {
    const { crop_id, crop_name, quantity_needed, preferred_mandi, offer_price, delivery_date, urgency, quality_grade, valid_until, notes } = req.body;
    const userId = req.user?.id;

    const profileResult = await safeQuery("SELECT id FROM trader_profiles WHERE user_id = $1", [userId]);

    if (profileResult.rows.length === 0) {
      return res.status(201).json({ id: Date.now(), user_id: userId, crop_name, quantity_needed, offer_price, demo: true });
    }

    const result = await safeQuery(
      `INSERT INTO trader_demands (trader_id, crop_id, crop_name, quantity_needed, preferred_mandi, offer_price, delivery_date, urgency, quality_grade, valid_until, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [profileResult.rows[0].id, crop_id, crop_name, quantity_needed, preferred_mandi, offer_price, delivery_date, urgency || 'normal', quality_grade || 'A', valid_until, notes]
    );

    return res.status(201).json(result.rows[0] || { id: Date.now(), crop_name, demo: true });
  } catch (err) {
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

export const getMyDemands = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileResult = await safeQuery("SELECT id FROM trader_profiles WHERE user_id = $1", [userId]);
    if (profileResult.rows.length === 0) return res.json([]);
    const result = await safeQuery("SELECT * FROM trader_demands WHERE trader_id = $1 ORDER BY created_at DESC", [profileResult.rows[0].id]);
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

export const getActiveDemands = async (req, res) => {
  try {
    return res.json(getDemoDemands(req.query));
  } catch (err) {
    return res.json([]);
  }
};

function getDemoDemands({ crop_name, state }) {
  return [
    { id: 1, crop_name: "Wheat", quantity_needed: 500, offer_price: 2800, urgency: "high", company_name: "ABC Traders", state: "Maharashtra" },
    { id: 2, crop_name: "Onion", quantity_needed: 200, offer_price: 1800, urgency: "normal", company_name: "XYZ Logistics", state: "Gujarat" },
    { id: 3, crop_name: "Cotton", quantity_needed: 100, offer_price: 6500, urgency: "low", company_name: "Cotton Kings", state: "Maharashtra" },
  ];
}

// ==================== DYNAMIC PRICE OFFERS ====================

export const createPriceOffer = async (req, res) => {
  try {
    const { crop_id, crop_name, base_price, grade_a_bonus, early_harvest_bonus, bulk_volume_bonus, quality_bonus, region, valid_until } = req.body;
    const userId = req.user?.id;

    const total_price = Number(base_price) + Number(grade_a_bonus || 0) + Number(early_harvest_bonus || 0) + Number(bulk_volume_bonus || 0) + Number(quality_bonus || 0);

    return res.status(201).json({
      id: Date.now(),
      crop_name,
      base_price,
      total_price,
      region,
      demo: true
    });
  } catch (err) {
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

export const getMyPriceOffers = async (req, res) => {
  try {
    return res.json([]);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== AGGREGATED FARMER SUPPLY ====================

export const getAggregatedSupply = async (req, res) => {
  try {
    return res.json(getDemoSupply(req.query));
  } catch (err) {
    return res.json([]);
  }
};

function getDemoSupply({ region, crop_name }) {
  return [
    { region: "Maharashtra", crop_name: "Wheat", total_quantity: 2500, farmer_count: 45 },
    { region: "Maharashtra", crop_name: "Onion", total_quantity: 1800, farmer_count: 32 },
    { region: "Gujarat", crop_name: "Cotton", total_quantity: 950, farmer_count: 18 },
  ];
}

// ==================== PRICE TRENDS ====================

export const getPriceTrends = async (req, res) => {
  try {
    return res.json(getDemoPriceTrends(req.query));
  } catch (err) {
    return res.json([]);
  }
};

export const getPriceTrendsSummary = async (req, res) => {
  try {
    return res.json(getDemoPriceTrends({}));
  } catch (err) {
    return res.json([]);
  }
};

function getDemoPriceTrends({ crop_name }) {
  const trends = [
    { crop_name: "Wheat", mandi_name: "Vashi", price: 2150, recorded_date: new Date().toISOString().split('T')[0] },
    { crop_name: "Rice", mandi_name: "Azadpur", price: 3200, recorded_date: new Date().toISOString().split('T')[0] },
    { crop_name: "Onion", mandi_name: "Lasalgaon", price: 1800, recorded_date: new Date().toISOString().split('T')[0] },
    { crop_name: "Tomato", mandi_name: "Vashi", price: 2500, recorded_date: new Date().toISOString().split('T')[0] },
    { crop_name: "Cotton", mandi_name: "Nagpur", price: 6200, recorded_date: new Date().toISOString().split('T')[0] },
  ];
  if (crop_name) return trends.filter(t => t.crop_name.toLowerCase().includes(crop_name.toLowerCase()));
  return trends;
}

// ==================== CROP ARRIVALS ====================

export const getCropArrivals = async (req, res) => {
  try {
    return res.json([
      { crop_name: "Wheat", mandi_name: "Vashi", arrival_date: "2024-04-15", expected_quantity: 500 },
      { crop_name: "Onion", mandi_name: "Lasalgaon", arrival_date: "2024-04-18", expected_quantity: 350 },
    ]);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== PROCUREMENT PLANNING ====================

export const createProcurementPlan = async (req, res) => {
  try {
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  } catch (err) {
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

export const getMyProcurementPlans = async (req, res) => {
  try {
    return res.json([]);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== LOGISTICS ====================

export const createLogisticsPlan = async (req, res) => {
  try {
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  } catch (err) {
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

export const getMyLogisticsPlans = async (req, res) => {
  try {
    return res.json([]);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== ALERTS ====================

export const getMyAlerts = async (req, res) => {
  try {
    return res.json([
      { id: 1, title: "Price Alert", message: "Wheat prices increased by 5%", is_read: false, created_at: new Date().toISOString() },
    ]);
  } catch (err) {
    return res.json([]);
  }
};

export const markAlertRead = async (req, res) => {
  try {
    return res.json({ id: req.params.id, is_read: true });
  } catch (err) {
    return res.json({ id: req.params.id, is_read: true });
  }
};

// ==================== ANALYTICS ====================

export const getTraderDashboard = async (req, res) => {
  try {
    return res.json({
      profile: { company_name: "Demo Traders", business_type: "Wholesale", state: "Maharashtra" },
      stats: { open_demands: 3, active_offers: 5, planned_procurement: 2, unread_alerts: 1 },
      recentDemands: getDemoDemands({}),
      priceTrends: getDemoPriceTrends({})
    });
  } catch (err) {
    return res.json({
      profile: null,
      stats: { open_demands: 0, active_offers: 0, planned_procurement: 0, unread_alerts: 0 },
      recentDemands: [],
      priceTrends: []
    });
  }
};

// ==================== MARKET DATA ====================

export const getMandiPrices = async (req, res) => {
  try {
    return res.json(getDemoPriceTrends(req.query).map(t => ({
      ...t,
      prices: [{ date: t.recorded_date, price: t.price }]
    })));
  } catch (err) {
    return res.json([]);
  }
};

export const getSpoilageRiskByRegion = async (req, res) => {
  try {
    return res.json([
      { region: "Maharashtra", spoilageRisk: 0.25, highRiskDays: 1, forecastDays: 7 },
      { region: "Gujarat", spoilageRisk: 0.35, highRiskDays: 2, forecastDays: 7 },
    ]);
  } catch (err) {
    return res.json([]);
  }
};
