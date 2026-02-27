// Preservation controller - works without database
const DEMO_ACTIONS = [
  { id: 1, action_name: "Temperature Control", description: "Maintain storage temperature between 4-10°C to slow bacterial growth", cost_score: 3, effectiveness_score: 5 },
  { id: 2, action_name: "Humidity Management", description: "Keep humidity at 40-60% to prevent mold and fungal growth", cost_score: 2, effectiveness_score: 4 },
  { id: 3, action_name: "Ventilation", description: "Ensure proper air circulation to reduce moisture buildup", cost_score: 2, effectiveness_score: 4 },
  { id: 4, action_name: "Modified Atmosphere Packaging", description: "Use sealed bags with controlled O2/CO2 levels", cost_score: 4, effectiveness_score: 5 },
  { id: 5, action_name: "Pre-cooling", description: "Rapidly cool produce after harvest to remove field heat", cost_score: 4, effectiveness_score: 5 },
  { id: 6, action_name: "Ethylene Absorbers", description: "Use potassium permanganate sachets to absorb ethylene gas", cost_score: 3, effectiveness_score: 4 },
  { id: 7, action_name: "UV Treatment", description: "Brief UV exposure to kill surface pathogens", cost_score: 3, effectiveness_score: 3 },
  { id: 8, action_name: "Organic Coatings", description: "Apply edible wax coatings to reduce water loss", cost_score: 2, effectiveness_score: 3 },
];

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

export const listActions = async (req, res) => {
  try {
    const dbPool = await loadPool();
    
    if (dbPool) {
      try {
        const result = await dbPool.query("SELECT * FROM preservation_actions ORDER BY effectiveness_score DESC, cost_score ASC");
        if (result.rows.length > 0) {
          return res.json(result.rows);
        }
      } catch (e) {}
    }
    
    return res.json(DEMO_ACTIONS);
  } catch (err) {
    console.error("Preservation list error:", err.message);
    return res.json(DEMO_ACTIONS);
  }
};

export const createAction = async (req, res) => {
  try {
    const dbPool = await loadPool();
    const { action_name, description, cost_score, effectiveness_score } = req.body;
    
    if (!action_name || !description || cost_score === undefined || effectiveness_score === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (dbPool) {
      try {
        const result = await dbPool.query(
          `INSERT INTO preservation_actions (action_name, description, cost_score, effectiveness_score)
           VALUES ($1, $2, $3, $4)
           RETURNING *`,
          [action_name, description, Number(cost_score), Number(effectiveness_score)]
        );
        return res.status(201).json(result.rows[0]);
      } catch (e) {}
    }

    // Return demo action
    return res.status(201).json({
      id: Date.now(),
      action_name,
      description,
      cost_score: Number(cost_score),
      effectiveness_score: Number(effectiveness_score),
      demo: true
    });
  } catch (err) {
    console.error("Create preservation action error:", err.message);
    return res.status(500).json({ message: "Failed to create preservation action." });
  }
};
