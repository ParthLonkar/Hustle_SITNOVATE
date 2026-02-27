// Stats controller - works without database
export const summaryStats = async (req, res) => {
  try {
    // Try to import pool dynamically
    let pool;
    try {
      const db = await import('../config/db.js');
      pool = db.default;
    } catch (e) {
      // Return demo data if db not available
      return res.json({ 
        users: 12, 
        crops: 8, 
        recommendations: 45, 
        mandi_prices: 156, 
        weather_records: 28,
        demo: true
      });
    }

    if (!pool) {
      return res.json({ 
        users: 12, 
        crops: 8, 
        recommendations: 45, 
        mandi_prices: 156, 
        weather_records: 28,
        demo: true
      });
    }

    const result = await pool.query("SELECT COUNT(*)::int AS count FROM users");
    const cropsResult = await pool.query("SELECT COUNT(*)::int AS count FROM crops");
    const recsResult = await pool.query("SELECT COUNT(*)::int AS count FROM recommendations");
    const mandisResult = await pool.query("SELECT COUNT(*)::int AS count FROM mandi_prices");
    const weatherResult = await pool.query("SELECT COUNT(*)::int AS count FROM weather_data");

    return res.json({
      users: result.rows[0]?.count || 0,
      crops: cropsResult.rows[0]?.count || 0,
      recommendations: recsResult.rows[0]?.count || 0,
      mandi_prices: mandisResult.rows[0]?.count || 0,
      weather_records: weatherResult.rows[0]?.count || 0,
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    // Return demo data on any error
    return res.json({ 
      users: 12, 
      crops: 8, 
      recommendations: 45, 
      mandi_prices: 156, 
      weather_records: 28,
      demo: true
    });
  }
};
