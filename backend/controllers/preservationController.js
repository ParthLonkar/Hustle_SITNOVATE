import pool from "../config/db.js";

export const listActions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM preservation_actions ORDER BY effectiveness_score DESC, cost_score ASC");
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load preservation actions." });
  }
};

export const createAction = async (req, res) => {
  try {
    const { action_name, description, cost_score, effectiveness_score } = req.body;
    if (!action_name || !description || cost_score === undefined || effectiveness_score === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `INSERT INTO preservation_actions (action_name, description, cost_score, effectiveness_score)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [action_name, description, Number(cost_score), Number(effectiveness_score)]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create preservation action." });
  }
};
