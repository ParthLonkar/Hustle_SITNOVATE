import pool from "../config/db.js";

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await pool.query(
      "SELECT id, name, email, role, region FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load user" });
  }
};
