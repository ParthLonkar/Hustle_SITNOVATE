import pool from "../config/db.js";

// ==================== VENDOR PROFILE ====================

// Create vendor profile
export const createVendorProfile = async (req, res) => {
  try {
    const { 
      company_name, company_type, state, district, contact_phone, contact_email,
      supported_crops, storage_capacity, has_refrigerated, latitude, longitude, description
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!company_name || !company_type || !state || !district) {
      return res.status(400).json({ message: "Company name, type, state, and district are required" });
    }

    // Check if vendor profile already exists
    const existing = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "Vendor profile already exists" });
    }

    const result = await pool.query(
      `INSERT INTO vendors (user_id, company_name, company_type, state, district, contact_phone, contact_email,
        supported_crops, storage_capacity, has_refrigerated, latitude, longitude, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [userId, company_name, company_type, state, district, contact_phone, contact_email,
       supported_crops, storage_capacity, has_refrigerated, latitude, longitude, description]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create vendor profile error:", err);
    return res.status(500).json({ message: "Failed to create vendor profile" });
  }
};

// Get vendor profile by user ID
export const getVendorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const result = await pool.query(
      "SELECT * FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get vendor profile" });
  }
};

// Get vendor by ID (public)
export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      "SELECT * FROM vendors WHERE id = $1 AND is_active = true",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get vendor" });
  }
};

// List vendors with filters
export const listVendors = async (req, res) => {
  try {
    const { state, district, company_type, crop } = req.query;
    
    let query = "SELECT * FROM vendors WHERE is_active = true";
    const values = [];
    const params = [];

    if (state) {
      params.push(state);
      query += ` AND state = $${params.length}`;
    }
    if (district) {
      params.push(district);
      query += ` AND district = $${params.length}`;
    }
    if (company_type) {
      params.push(company_type);
      query += ` AND company_type = $${params.length}`;
    }
    if (crop) {
      params.push(`%${crop}%`);
      query += ` AND supported_crops::text ILIKE $${params.length}`;
    }

    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, values.length ? values : params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to list vendors" });
  }
};

// Update vendor profile
export const updateVendorProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      'company_name', 'company_type', 'state', 'district', 'contact_phone', 'contact_email',
      'supported_crops', 'storage_capacity', 'has_refrigerated', 'latitude', 'longitude', 'description', 'is_active'
    ];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    paramCount++;
    values.push(userId);

    const result = await pool.query(
      `UPDATE vendors SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $${paramCount} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Vendor profile not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update vendor profile" });
  }
};

// ==================== VENDOR PRICES (BIDDING) ====================

// Add price offer
export const addVendorPrice = async (req, res) => {
  try {
    const { crop_id, crop_name, price_per_quintal, quantity_quintal, pickup_location, validity_date } = req.body;
    const userId = req.user?.id;

    // Get vendor ID from user
    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `INSERT INTO vendor_prices (vendor_id, crop_id, crop_name, price_per_quintal, quantity_quintal, pickup_location, validity_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [vendorResult.rows[0].id, crop_id, crop_name, price_per_quintal, quantity_quintal, pickup_location, validity_date]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: "Price offer already exists for this crop and date" });
    }
    return res.status(500).json({ message: "Failed to add price offer" });
  }
};

// Get vendor's price offers
export const getMyVendorPrices = async (req, res) => {
  try {
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      "SELECT * FROM vendor_prices WHERE vendor_id = $1 AND is_active = true AND validity_date >= CURRENT_DATE ORDER BY created_at DESC",
      [vendorResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get price offers" });
  }
};

// Get active price offers (for farmers)
export const getActiveVendorPrices = async (req, res) => {
  try {
    const { crop_name, state, district } = req.query;

    let query = `
      SELECT vp.*, v.company_name, v.state, v.district, v.contact_phone
      FROM vendor_prices vp
      JOIN vendors v ON vp.vendor_id = v.id
      WHERE vp.is_active = true AND vp.validity_date >= CURRENT_DATE
    `;
    const params = [];

    if (crop_name) {
      params.push(crop_name.toLowerCase());
      query += ` AND LOWER(vp.crop_name) LIKE $${params.length}`;
    }
    if (state) {
      params.push(state);
      query += ` AND v.state = $${params.length}`;
    }
    if (district) {
      params.push(district);
      query += ` AND v.district = $${params.length}`;
    }

    query += " ORDER BY vp.price_per_quintal DESC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get price offers" });
  }
};

// ==================== VENDOR TRANSPORT ====================

// Add transport availability
export const addVendorTransport = async (req, res) => {
  try {
    const { vehicle_type, vehicle_number, capacity_quintal, cost_per_km, is_refrigerated, available_from, available_to } = req.body;
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `INSERT INTO vendor_transport (vendor_id, vehicle_type, vehicle_number, capacity_quintal, cost_per_km, is_refrigerated, available_from, available_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [vendorResult.rows[0].id, vehicle_type, vehicle_number, capacity_quintal, cost_per_km, is_refrigerated, available_from, available_to]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add transport" });
  }
};

// Get vendor's transport
export const getMyVendorTransport = async (req, res) => {
  try {
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      "SELECT * FROM vendor_transport WHERE vendor_id = $1 ORDER BY created_at DESC",
      [vendorResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get transport" });
  }
};

// Get available transport (for farmers)
export const getAvailableTransport = async (req, res) => {
  try {
    const { state, district, is_refrigerated } = req.query;

    let query = `
      SELECT vt.*, v.company_name, v.state, v.district, v.contact_phone
      FROM vendor_transport vt
      JOIN vendors v ON vt.vendor_id = v.id
      WHERE vt.is_available = true AND (vt.available_to IS NULL OR vt.available_to >= CURRENT_DATE)
    `;
    const params = [];

    if (state) {
      params.push(state);
      query += ` AND v.state = $${params.length}`;
    }
    if (is_refrigerated === 'true') {
      query += " AND vt.is_refrigerated = true";
    }

    query += " ORDER BY vt.cost_per_km ASC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get transport" });
  }
};

// ==================== VENDOR STORAGE ====================

// Add storage facility
export const addVendorStorage = async (req, res) => {
  try {
    const { 
      facility_name, facility_type, temperature_min, temperature_max, 
      humidity_min, humidity_max, capacity_quintal, cost_per_day, 
      address, district, state 
    } = req.body;
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `INSERT INTO vendor_storage (vendor_id, facility_name, facility_type, temperature_min, temperature_max,
        humidity_min, humidity_max, capacity_quintal, cost_per_day, address, district, state)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [vendorResult.rows[0].id, facility_name, facility_type, temperature_min, temperature_max,
       humidity_min, humidity_max, capacity_quintal, cost_per_day, address, district, state]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add storage facility" });
  }
};

// Get available storage
export const getAvailableStorage = async (req, res) => {
  try {
    const { facility_type, state, district, temperature_needed } = req.query;

    let query = `
      SELECT vs.*, v.company_name, v.state, v.district, v.contact_phone
      FROM vendor_storage vs
      JOIN vendors v ON vs.vendor_id = v.id
      WHERE vs.is_available = true
    `;
    const params = [];

    if (facility_type) {
      params.push(facility_type);
      query += ` AND vs.facility_type = $${params.length}`;
    }
    if (state) {
      params.push(state);
      query += ` AND vs.state = $${params.length}`;
    }
    if (district) {
      params.push(district);
      query += ` AND vs.district = $${params.length}`;
    }
    if (temperature_needed) {
      params.push(Number(temperature_needed));
      query += ` AND vs.temperature_min <= $${params.length} AND vs.temperature_max >= $${params.length}`;
    }

    query += " ORDER BY vs.cost_per_day ASC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get storage facilities" });
  }
};

// ==================== TRANSPORT BOOKINGS ====================

// Create transport booking
export const createTransportBooking = async (req, res) => {
  try {
    const { 
      vendor_id, transport_id, crop_id, crop_name, quantity_quintal,
      pickup_address, delivery_address, distance_km, estimated_cost, pickup_date 
    } = req.body;
    const farmerId = req.user?.id;

    if (!farmerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await pool.query(
      `INSERT INTO transport_bookings (farmer_id, vendor_id, transport_id, crop_id, crop_name, quantity_quintal,
        pickup_address, delivery_address, distance_km, estimated_cost, pickup_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending')
       RETURNING *`,
      [farmerId, vendor_id, transport_id, crop_id, crop_name, quantity_quintal,
       pickup_address, delivery_address, distance_km, estimated_cost, pickup_date]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Booking error:", err);
    return res.status(500).json({ message: "Failed to create booking" });
  }
};

// Get farmer's bookings
export const getMyBookings = async (req, res) => {
  try {
    const farmerId = req.user?.id;

    const result = await pool.query(
      `SELECT tb.*, v.company_name, vt.vehicle_type, vt.vehicle_number
       FROM transport_bookings tb
       JOIN vendors v ON tb.vendor_id = v.id
       JOIN vendor_transport vt ON tb.transport_id = vt.id
       WHERE tb.farmer_id = $1
       ORDER BY tb.created_at DESC`,
      [farmerId]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get bookings" });
  }
};

// Get vendor's bookings
export const getVendorBookings = async (req, res) => {
  try {
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `SELECT tb.*, u.name as farmer_name, u.phone as farmer_phone
       FROM transport_bookings tb
       JOIN users u ON tb.farmer_id = u.id
       WHERE tb.vendor_id = $1
       ORDER BY tb.created_at DESC`,
      [vendorResult.rows[0].id]
    );

    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get bookings" });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    const validStatuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Get vendor ID
    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `UPDATE transport_bookings 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND vendor_id = $3
       RETURNING *`,
      [status, id, vendorResult.rows[0].id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update booking" });
  }
};

// ==================== VENDOR RATINGS ====================

// Rate a vendor
export const rateVendor = async (req, res) => {
  try {
    const { vendor_id, transaction_id, price_consistency, delivery_success, quality_rating, review_text } = req.body;
    const farmerId = req.user?.id;

    if (!vendor_id || !price_consistency || !delivery_success || !quality_rating) {
      return res.status(400).json({ message: "Vendor ID and ratings are required" });
    }

    const result = await pool.query(
      `INSERT INTO vendor_ratings (vendor_id, farmer_id, transaction_id, price_consistency, delivery_success, quality_rating, review_text)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (farmer_id, vendor_id, COALESCE(transaction_id, 0))
       DO UPDATE SET price_consistency = $4, delivery_success = $5, quality_rating = $6, review_text = $7
       RETURNING *`,
      [vendor_id, farmerId, transaction_id, price_consistency, delivery_success, quality_rating, review_text]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to rate vendor" });
  }
};

// Get vendor ratings
export const getVendorRatings = async (req, res) => {
  try {
    const { vendor_id } = req.params;

    const result = await pool.query(
      `SELECT vr.*, u.name as farmer_name
       FROM vendor_ratings vr
       JOIN users u ON vr.farmer_id = u.id
       WHERE vr.vendor_id = $1
       ORDER BY vr.created_at DESC`,
      [vendor_id]
    );

    // Calculate average
    const avgResult = await pool.query(
      "SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total_ratings FROM vendor_ratings WHERE vendor_id = $1",
      [vendor_id]
    );

    return res.json({
      ratings: result.rows,
      average_rating: avgResult.rows[0]?.avg_rating || 0,
      total_ratings: avgResult.rows[0]?.total_ratings || 0
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get ratings" });
  }
};

// ==================== VENDOR DEMAND ====================

// Add demand (what crops vendor needs)
export const addVendorDemand = async (req, res) => {
  try {
    const { crop_name, quantity_needed, preferred_price, urgency, valid_until } = req.body;
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const result = await pool.query(
      `INSERT INTO vendor_demand (vendor_id, crop_name, quantity_needed, preferred_price, urgency, valid_until)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [vendorResult.rows[0].id, crop_name, quantity_needed, preferred_price, urgency || 'normal', valid_until]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to add demand" });
  }
};

// Get active demands
export const getActiveDemands = async (req, res) => {
  try {
    const { crop_name, state } = req.query;

    let query = `
      SELECT vd.*, v.company_name, v.state, v.district
      FROM vendor_demand vd
      JOIN vendors v ON vd.vendor_id = v.id
      WHERE vd.is_active = true AND vd.valid_until >= CURRENT_DATE
    `;
    const params = [];

    if (crop_name) {
      params.push(crop_name.toLowerCase());
      query += ` AND LOWER(vd.crop_name) LIKE $${params.length}`;
    }
    if (state) {
      params.push(state);
      query += ` AND v.state = $${params.length}`;
    }

    query += " ORDER BY vd.urgency DESC, vd.quantity_needed DESC";

    const result = await pool.query(query, params);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to get demands" });
  }
};

// ==================== ANALYTICS ====================

// Get vendor analytics
export const getVendorAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;

    const vendorResult = await pool.query(
      "SELECT id FROM vendors WHERE user_id = $1",
      [userId]
    );

    if (vendorResult.rows.length === 0) {
      return res.status(403).json({ message: "Vendor profile not found" });
    }

    const vendorId = vendorResult.rows[0].id;

    // Get various analytics
    const [priceOffers, transportUnits, storageFacilities, bookings, ratings] = await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM vendor_prices WHERE vendor_id = $1 AND is_active = true", [vendorId]),
      pool.query("SELECT COUNT(*) as count FROM vendor_transport WHERE vendor_id = $1 AND is_available = true", [vendorId]),
      pool.query("SELECT COUNT(*) as count FROM vendor_storage WHERE vendor_id = $1 AND is_available = true", [vendorId]),
      pool.query("SELECT COUNT(*) as count, status FROM transport_bookings WHERE vendor_id = $1 GROUP BY status", [vendorId]),
      pool.query("SELECT AVG(overall_rating) as avg_rating, COUNT(*) as total FROM vendor_ratings WHERE vendor_id = $1", [vendorId])
    ]);

    return res.json({
      total_price_offers: priceOffers.rows[0]?.count || 0,
      total_transport_units: transportUnits.rows[0]?.count || 0,
      total_storage_facilities: storageFacilities.rows[0]?.count || 0,
      bookings_by_status: bookings.rows,
      average_rating: ratings.rows[0]?.avg_rating || 0,
      total_ratings: ratings.rows[0]?.total || 0
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get analytics" });
  }
};
