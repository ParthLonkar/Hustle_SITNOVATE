// Farmer controller - works without database
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

const DEMO_USERS = [
  { id: 1, name: 'Demo Farmer', email: 'demo@agrichain.com', role: 'farmer', region: 'Maharashtra' },
  { id: 2, name: 'Demo Admin', email: 'admin@agrichain.com', role: 'admin', region: 'Delhi' },
  { id: 3, name: 'Demo Trader', email: 'trader@agrichain.com', role: 'trader', region: 'Maharashtra' },
];

export const getMe = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const dbPool = await loadPool();
    
    if (dbPool) {
      try {
        const result = await dbPool.query(
          "SELECT id, name, email, role, region FROM users WHERE id = $1",
          [userId]
        );
        if (result.rows.length > 0) {
          return res.json({ user: result.rows[0] });
        }
      } catch (e) {}
    }

    // Return demo user
    const demoUser = DEMO_USERS.find(u => u.id === userId) || DEMO_USERS[0];
    return res.json({ user: demoUser });
  } catch (err) {
    console.error("Get me error:", err.message);
    return res.json({ user: DEMO_USERS[0] });
  }
};
