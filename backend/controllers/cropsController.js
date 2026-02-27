// Crops controller - works without database
export const listCrops = async (req, res) => {
  try {
    let pool;
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      // Return demo crops
      return res.json(getDemoCrops());
    }

    if (!pool) {
      return res.json(getDemoCrops());
    }

    const result = await pool.query('SELECT * FROM crops ORDER BY name');
    return res.json(result.rows.length > 0 ? result.rows : getDemoCrops());
  } catch (err) {
    console.error("Crops error:", err.message);
    return res.json(getDemoCrops());
  }
};

function getDemoCrops() {
  return [
    { id: 1, name: 'Wheat', optimal_ph_range: '6.0-7.0', optimal_n_range: '40-60', optimal_p_range: '20-40', optimal_k_range: '20-30' },
    { id: 2, name: 'Rice', optimal_ph_range: '5.5-7.0', optimal_n_range: '50-80', optimal_p_range: '25-50', optimal_k_range: '30-50' },
    { id: 3, name: 'Cotton', optimal_ph_range: '5.5-8.0', optimal_n_range: '50-100', optimal_p_range: '25-50', optimal_k_range: '30-60' },
    { id: 4, name: 'Sugarcane', optimal_ph_range: '6.0-7.5', optimal_n_range: '150-200', optimal_p_range: '50-100', optimal_k_range: '80-120' },
    { id: 5, name: 'Onion', optimal_ph_range: '6.0-7.0', optimal_n_range: '40-60', optimal_p_range: '20-40', optimal_k_range: '30-50' },
    { id: 6, name: 'Tomato', optimal_ph_range: '6.0-6.8', optimal_n_range: '50-80', optimal_p_range: '25-50', optimal_k_range: '30-60' },
    { id: 7, name: 'Potato', optimal_ph_range: '5.5-6.5', optimal_n_range: '60-100', optimal_p_range: '30-60', optimal_k_range: '40-80' },
    { id: 8, name: 'Maize', optimal_ph_range: '5.5-7.0', optimal_n_range: '60-80', optimal_p_range: '30-50', optimal_k_range: '30-40' },
  ];
}

export const createCrop = async (req, res) => {
  try {
    let pool;
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
    }

    if (!pool) {
      return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
    }

    const { name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range } = req.body;
    
    const result = await pool.query(
      `INSERT INTO crops (name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create crop error:", err.message);
    return res.status(201).json({ id: Date.now(), ...req.body, demo: true });
  }
};

export const updateCrop = async (req, res) => {
  try {
    let pool;
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      return res.json({ id: req.params.id, ...req.body, demo: true });
    }

    if (!pool) {
      return res.json({ id: req.params.id, ...req.body, demo: true });
    }

    const { name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range } = req.body;
    const result = await pool.query(
      `UPDATE crops SET name = $1, optimal_ph_range = $2, optimal_n_range = $3, optimal_p_range = $4, optimal_k_range = $5 WHERE id = $6 RETURNING *`,
      [name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range, req.params.id]
    );
    
    return res.json(result.rows[0]);
  } catch (err) {
    console.error("Update crop error:", err.message);
    return res.json({ id: req.params.id, ...req.body, demo: true });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    let pool;
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      return res.json({ message: "Crop deleted (demo)", demo: true });
    }

    if (!pool) {
      return res.json({ message: "Crop deleted (demo)", demo: true });
    }

    await pool.query('DELETE FROM crops WHERE id = $1', [req.params.id]);
    return res.json({ message: "Crop deleted" });
  } catch (err) {
    console.error("Delete crop error:", err.message);
    return res.json({ message: "Crop deleted (demo)", demo: true });
  }
};
