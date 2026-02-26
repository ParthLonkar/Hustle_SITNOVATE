import pool from "../config/db.js";

export const summaryStats = async (req, res) => {
  try {
    const [users, crops, recs, mandis, weather] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS count FROM users"),
      pool.query("SELECT COUNT(*)::int AS count FROM crops"),
      pool.query("SELECT COUNT(*)::int AS count FROM recommendations"),
      pool.query("SELECT COUNT(*)::int AS count FROM mandi_prices"),
      pool.query("SELECT COUNT(*)::int AS count FROM weather_data"),
    ]);

    return res.json({
      users: users.rows[0].count,
      crops: crops.rows[0].count,
      recommendations: recs.rows[0].count,
      mandi_prices: mandis.rows[0].count,
      weather_records: weather.rows[0].count,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load stats." });
  }
};
