import pool from "../config/db.js";

export const listCrops = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM crops ORDER BY name ASC");
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch crops." });
  }
};

export const createCrop = async (req, res) => {
  try {
    const { name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range } = req.body;
    if (!name || !optimal_ph_range || !optimal_n_range || !optimal_p_range || !optimal_k_range) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const result = await pool.query(
      `INSERT INTO crops (name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err && err.code === "23505") {
      return res.status(409).json({ message: "Crop already exists." });
    }
    return res.status(500).json({ message: "Failed to create crop." });
  }
};

export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range } = req.body;

    const result = await pool.query(
      `UPDATE crops
       SET name = COALESCE($1, name),
           optimal_ph_range = COALESCE($2, optimal_ph_range),
           optimal_n_range = COALESCE($3, optimal_n_range),
           optimal_p_range = COALESCE($4, optimal_p_range),
           optimal_k_range = COALESCE($5, optimal_k_range)
       WHERE id = $6
       RETURNING *`,
      [name, optimal_ph_range, optimal_n_range, optimal_p_range, optimal_k_range, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Crop not found." });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ message: "Failed to update crop." });
  }
};

export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM crops WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Crop not found." });
    }
    return res.json({ message: "Crop deleted." });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete crop." });
  }
};
