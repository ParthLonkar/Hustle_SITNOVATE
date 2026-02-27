import pool from "../config/db.js";

// Helper to safely run a query
const safeQuery = async (query, params = []) => {
  try {
    return await pool.query(query, params);
  } catch (e) {
    console.log("Query failed:", e.message);
    return { rows: [] };
  }
};

// ==================== TRADER PROFILE ====================

// Create or update trader profile
export const saveTraderProfile = async (req, res) => {
  try {
    const { company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existing = await pool.query(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      const result = await pool.query(
        `UPDATE trader_profiles SET 
          company_name = $1, business_type = $2, state = $3, district = $4,
          contact_phone = $5, contact_email = $6, license_number = $7,
          preferred_mandis = $8, storage_capacity = $9, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $10 RETURNING *`,
        [company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity, userId]
      );
      return res.json(result.rows[0]);
    } else {
      const result = await pool.query(
        `INSERT INTO trader_profiles (user_id, company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [userId, company_name, business_type, state, district, contact_phone, contact_email, license_number, preferred_mandis, storage_capacity]
      );
      return res.status(201).json(result.rows[0]);
    }
  } catch (err) {
    console.error("Save trader profile error:", err);
    return res.status(500).json({ message: "Failed to save trader profile" });
  }
};

// Get my trader profile
export const getMyTraderProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      "SELECT * FROM trader_profiles WHERE user_id = $1",
      [userId]
    );
    if (result.rows.length === 0) {
      return res.json(null);
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.json(null);
  }
};

// ==================== TRADER DEMANDS ====================

// Post demand requirement
export const createTraderDemand = async (req, res) => {
  try {
    const { crop_id, crop_name, quantity_needed, preferred_mandi, offer_price, delivery_date, urgency, quality_grade, valid_until, notes } = req.body;
    const userId = req.user?.id;

    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(403).json({ message: "Trader profile required. Please create your profile first." });
    }

    const result = await pool.query(
      `INSERT INTO trader_demands (trader_id, crop_id, crop_name, quantity_needed, preferred_mandi, offer_price, delivery_date, urgency, quality_grade, valid_until, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [profileResult.rows[0].id, crop_id, crop_name, quantity_needed, preferred_mandi, offer_price, delivery_date, urgency || 'normal', quality_grade || 'A', valid_until, notes]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create demand error:", err);
    return res.status(500).json({ message: "Failed to create demand" });
  }
};

// Get my demands
export const getMyDemands = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.json([]);
    }

    const result = await pool.query(
      "SELECT * FROM trader_demands WHERE trader_id = $1 ORDER BY created_at DESC",
      [profileResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    console.error("Get demands error:", err);
    return res.json([]);
  }
};

// Get all active demands (for farmers to see)
export const getActiveDemands = async (req, res) => {
  try {
    const { crop_name, state } = req.query;

    let query = `
      SELECT td.*, tp.company_name, tp.state, tp.district, tp.contact_phone
      FROM trader_demands td
      JOIN trader_profiles tp ON td.trader_id = tp.id
      WHERE td.status = 'open' AND (td.valid_until IS NULL OR td.valid_until >= CURRENT_DATE)
    `;
    const params = [];

    if (crop_name) {
      params.push(`%${crop_name.toLowerCase()}%`);
      query += ` AND LOWER(td.crop_name) LIKE $${params.length}`;
    }
    if (state) {
      params.push(state);
      query += ` AND tp.state = $${params.length}`;
    }

    query += " ORDER BY td.urgency DESC, td.created_at DESC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== DYNAMIC PRICE OFFERS ====================

// Create price offer with bonuses
export const createPriceOffer = async (req, res) => {
  try {
    const { crop_id, crop_name, base_price, grade_a_bonus, early_harvest_bonus, bulk_volume_bonus, quality_bonus, region, valid_until } = req.body;
    const userId = req.user?.id;

    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(403).json({ message: "Trader profile required. Please create your profile first." });
    }

    const total_price = Number(base_price) + Number(grade_a_bonus || 0) + Number(early_harvest_bonus || 0) + Number(bulk_volume_bonus || 0) + Number(quality_bonus || 0);

    const result = await pool.query(
      `INSERT INTO trader_price_offers (trader_id, crop_id, crop_name, base_price, grade_a_bonus, early_harvest_bonus, bulk_volume_bonus, quality_bonus, total_price, region, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [profileResult.rows[0].id, crop_id, crop_name, base_price, grade_a_bonus || 0, early_harvest_bonus || 0, bulk_volume_bonus || 0, quality_bonus || 0, total_price, region, valid_until]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create offer error:", err);
    return res.status(500).json({ message: "Failed to create price offer" });
  }
};

// Get my price offers
export const getMyPriceOffers = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.json([]);
    }

    const result = await pool.query(
      "SELECT * FROM trader_price_offers WHERE trader_id = $1 AND is_active = true ORDER BY created_at DESC",
      [profileResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== AGGREGATED FARMER SUPPLY ====================

// Get aggregated supply by region
export const getAggregatedSupply = async (req, res) => {
  try {
    const { region, crop_name } = req.query;

    let query = "SELECT * FROM aggregated_supply WHERE 1=1";
    const params = [];

    if (region) {
      params.push(region);
      query += ` AND region = $${params.length}`;
    }
    if (crop_name) {
      params.push(`%${crop_name.toLowerCase()}%`);
      query += ` AND LOWER(crop_name) LIKE $${params.length}`;
    }

    query += " ORDER BY total_quantity DESC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== PRICE TRENDS ====================

// Get price trends for a crop
export const getPriceTrends = async (req, res) => {
  try {
    const { crop_id, crop_name, mandi_name } = req.query;

    let query = "SELECT * FROM price_trends WHERE 1=1";
    const params = [];

    if (crop_id) {
      params.push(crop_id);
      query += ` AND crop_id = $${params.length}`;
    }
    if (crop_name) {
      params.push(`%${crop_name.toLowerCase()}%`);
      query += ` AND LOWER(crop_name) LIKE $${params.length}`;
    }
    if (mandi_name) {
      params.push(mandi_name);
      query += ` AND mandi_name = $${params.length}`;
    }

    query += " ORDER BY recorded_date DESC LIMIT 30";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// Get price trends summary (latest for all crops)
export const getPriceTrendsSummary = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (crop_id, mandi_name)
        pt.*, c.name as crop_name
      FROM price_trends pt
      JOIN crops c ON pt.crop_id = c.id
      ORDER BY crop_id, mandi_name, recorded_date DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== CROP ARRIVALS ====================

// Get predicted crop arrivals
export const getCropArrivals = async (req, res) => {
  try {
    const { crop_name, mandi_name, state } = req.query;

    let query = "SELECT * FROM crop_arrivals WHERE 1=1";
    const params = [];

    if (crop_name) {
      params.push(`%${crop_name.toLowerCase()}%`);
      query += ` AND LOWER(crop_name) LIKE $${params.length}`;
    }
    if (mandi_name) {
      params.push(mandi_name);
      query += ` AND mandi_name = $${params.length}`;
    }

    query += " ORDER BY arrival_date ASC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== PROCUREMENT PLANNING ====================

// Create procurement plan
export const createProcurementPlan = async (req, res) => {
  try {
    const { crop_id, crop_name, planned_quantity, target_mandi, best_procurement_dates, recommended_storage, estimated_spoilage_risk, notes } = req.body;
    const userId = req.user?.id;

    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(403).json({ message: "Trader profile required. Please create your profile first." });
    }

    const result = await pool.query(
      `INSERT INTO procurement_plans (trader_id, crop_id, crop_name, planned_quantity, target_mandi, best_procurement_dates, recommended_storage, estimated_spoilage_risk, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [profileResult.rows[0].id, crop_id, crop_name, planned_quantity, target_mandi, best_procurement_dates, recommended_storage, estimated_spoilage_risk, notes]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create procurement error:", err);
    return res.status(500).json({ message: "Failed to create procurement plan" });
  }
};

// Get my procurement plans
export const getMyProcurementPlans = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.json([]);
    }

    const result = await pool.query(
      "SELECT * FROM procurement_plans WHERE trader_id = $1 ORDER BY created_at DESC",
      [profileResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== LOGISTICS ====================

// Create logistics plan
export const createLogisticsPlan = async (req, res) => {
  try {
    const { crop_id, crop_name, pickup_location, delivery_location, distance_km, transport_mode, estimated_cost, bulk_pickup_date, bulk_pickup_quantity, route_suggestion } = req.body;
    const userId = req.user?.id;

    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(403).json({ message: "Trader profile required. Please create your profile first." });
    }

    const result = await pool.query(
      `INSERT INTO logistics_plans (trader_id, crop_id, crop_name, pickup_location, delivery_location, distance_km, transport_mode, estimated_cost, bulk_pickup_date, bulk_pickup_quantity, route_suggestion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [profileResult.rows[0].id, crop_id, crop_name, pickup_location, delivery_location, distance_km, transport_mode, estimated_cost, bulk_pickup_date, bulk_pickup_quantity, route_suggestion]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create logistics error:", err);
    return res.status(500).json({ message: "Failed to create logistics plan" });
  }
};

// Get my logistics plans
export const getMyLogisticsPlans = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.json([]);
    }

    const result = await pool.query(
      "SELECT * FROM logistics_plans WHERE trader_id = $1 ORDER BY created_at DESC",
      [profileResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// ==================== ALERTS ====================

// Get my alerts
export const getMyAlerts = async (req, res) => {
  try {
    const userId = req.user?.id;
    const profileResult = await safeQuery(
      "SELECT id FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.json([]);
    }

    const result = await pool.query(
      "SELECT * FROM trader_alerts WHERE trader_id = $1 ORDER BY created_at DESC LIMIT 50",
      [profileResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.json([]);
  }
};

// Mark alert as read
export const markAlertRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "UPDATE trader_alerts SET is_read = true WHERE id = $1 RETURNING *",
      [id]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update alert" });
  }
};

// ==================== ANALYTICS ====================

// Get trader dashboard analytics
export const getTraderDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    let profile = null;
    let traderId = null;
    
    const profileResult = await safeQuery(
      "SELECT id, company_name, business_type, state FROM trader_profiles WHERE user_id = $1",
      [userId]
    );

    if (profileResult.rows.length > 0) {
      profile = profileResult.rows[0];
      traderId = profile.id;
    }

    let stats = { open_demands: 0, active_offers: 0, planned_procurement: 0, unread_alerts: 0 };
    let recentDemands = [];
    let priceTrends = [];

    if (traderId) {
      const demands = await safeQuery("SELECT COUNT(*) as count FROM trader_demands WHERE trader_id = $1 AND status = 'open'", [traderId]);
      stats.open_demands = parseInt(demands.rows[0]?.count || 0);

      const offers = await safeQuery("SELECT COUNT(*) as count FROM trader_price_offers WHERE trader_id = $1 AND is_active = true", [traderId]);
      stats.active_offers = parseInt(offers.rows[0]?.count || 0);

      const procurement = await safeQuery("SELECT COUNT(*) as count FROM procurement_plans WHERE trader_id = $1 AND status = 'planned'", [traderId]);
      stats.planned_procurement = parseInt(procurement.rows[0]?.count || 0);

      const alerts = await safeQuery("SELECT COUNT(*) as count FROM trader_alerts WHERE trader_id = $1 AND is_read = false", [traderId]);
      stats.unread_alerts = parseInt(alerts.rows[0]?.count || 0);

      const recentDemandsResult = await safeQuery("SELECT * FROM trader_demands WHERE trader_id = $1 ORDER BY created_at DESC LIMIT 5", [traderId]);
      recentDemands = recentDemandsResult.rows;
    }

    const priceTrendsResult = await safeQuery(`
      SELECT DISTINCT ON (crop_id, mandi_name)
        pt.*, c.name as crop_name
      FROM price_trends pt
      JOIN crops c ON pt.crop_id = c.id
      ORDER BY crop_id, mandi_name, recorded_date DESC
      LIMIT 10
    `);
    priceTrends = priceTrendsResult.rows;

    return res.json({
      profile,
      stats,
      recentDemands,
      priceTrends
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.json({
      profile: null,
      stats: { open_demands: 0, active_offers: 0, planned_procurement: 0, unread_alerts: 0 },
      recentDemands: [],
      priceTrends: []
    });
  }
};

// ==================== MARKET DATA ====================

// Get mandi prices with trends
export const getMandiPrices = async (req, res) => {
  try {
    const { crop_name, state, days } = req.query;
    const daysNum = parseInt(days) || 30;

    let query = `
      SELECT mp.*, c.name as crop_name
      FROM mandi_prices mp
      JOIN crops c ON mp.crop_id = c.id
      WHERE mp.price_date >= CURRENT_DATE - INTERVAL '${daysNum} days'
    `;
    const params = [];

    if (crop_name) {
      params.push(`%${crop_name.toLowerCase()}%`);
      query += ` AND LOWER(c.name) LIKE $${params.length}`;
    }
    if (state) {
      params.push(state);
      query += ` AND mp.mandi_name LIKE $${params.length}`;
    }

    query += " ORDER BY mp.price_date DESC, mp.price DESC";

    const result = await pool.query(query, params);
    
    const grouped = {};
    result.rows.forEach(row => {
      const key = `${row.crop_name}-${row.mandi_name}`;
      if (!grouped[key]) {
        grouped[key] = {
          crop_name: row.crop_name,
          mandi_name: row.mandi_name,
          prices: [],
          current_price: 0,
          previous_price: 0,
          trend: 'stable'
        };
      }
      grouped[key].prices.push({ date: row.price_date, price: row.price });
      if (grouped[key].prices.length === 1) {
        grouped[key].current_price = row.price;
      } else if (grouped[key].prices.length === 2) {
        grouped[key].previous_price = row.price;
      }
    });

    Object.values(grouped).forEach(g => {
      if (g.current_price > g.previous_price) g.trend = 'up';
      else if (g.current_price < g.previous_price) g.trend = 'down';
    });

    return res.json(Object.values(grouped));
  } catch (err) {
    return res.json([]);
  }
};

// Get spoilage risk by region
export const getSpoilageRiskByRegion = async (req, res) => {
  try {
    const { region } = req.query;
    
    let query = `
      SELECT region, 
             AVG(humidity) as avg_humidity, 
             AVG(rainfall) as avg_rainfall,
             COUNT(*) as forecast_days,
             MAX(CASE WHEN humidity > 80 OR rainfall > 50 THEN 1 ELSE 0 END) as high_risk_days
      FROM weather_data
      WHERE forecast_date >= CURRENT_DATE AND forecast_date <= CURRENT_DATE + INTERVAL '7 days'
    `;
    const params = [];

    if (region) {
      params.push(region);
      query += ` AND region = $${params.length}`;
    }

    query += " GROUP BY region";

    const result = await pool.query(query, params);
    
    const riskData = result.rows.map(r => ({
      region: r.region,
      spoilageRisk: Math.min(1, (Number(r.avg_humidity || 0) / 100) * 0.6 + (Number(r.avg_rainfall || 0) / 100) * 0.4),
      highRiskDays: r.high_risk_days,
      forecastDays: r.forecast_days
    }));

    return res.json(riskData);
  } catch (err) {
    return res.json([]);
  }
};
