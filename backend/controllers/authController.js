import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  region: user.region,
});

// Demo users for testing without database
const DEMO_USERS = [
  { id: 1, name: 'Demo Farmer', email: 'demo@agrichain.com', password: 'demo123', role: 'farmer', region: 'Maharashtra' },
  { id: 2, name: 'Demo Admin', email: 'admin@agrichain.com', password: 'admin123', role: 'admin', region: 'Delhi' },
  { id: 3, name: 'Demo Trader', email: 'trader@agrichain.com', password: 'trader123', role: 'trader', region: 'Maharashtra' },
];

let pool = null;

// Try to load database pool
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

export const register = async (req, res) => {
  try {
    const dbPool = await loadPool();
    
    if (dbPool) {
      const { name, email, password, role, region } = req.body;

      if (!name || !email || !password || !role || !region) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      const normalizedEmail = String(email).trim().toLowerCase();

      const existing = await dbPool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: 'Email already registered.' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const insertResult = await dbPool.query(
        `INSERT INTO users (name, email, password_hash, role, region)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, role, region`,
        [name, normalizedEmail, passwordHash, role, region]
      );

      const user = insertResult.rows[0];
      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

      return res.status(201).json({ token, user: sanitizeUser(user) });
    } else {
      // Demo mode - create demo user
      const { name, email, password, role, region } = req.body;
      const normalizedEmail = String(email).trim().toLowerCase();
      
      const demoUser = { 
        id: Date.now(), 
        name: name || 'New User', 
        email: normalizedEmail, 
        role: role || 'farmer', 
        region: region || 'Maharashtra' 
      };
      const token = jwt.sign({ id: demoUser.id, role: demoUser.role }, jwtSecret, { expiresIn: jwtExpiresIn });
      
      return res.status(201).json({ token, user: demoUser, demo: true });
    }
  } catch (err) {
    console.error("Register error:", err.message);
    // Fallback to demo user on error
    const { name, email, role, region } = req.body;
    const demoUser = { 
      id: Date.now(), 
      name: name || 'New User', 
      email: email || 'user@demo.com', 
      role: role || 'farmer', 
      region: region || 'Maharashtra' 
    };
    const token = jwt.sign({ id: demoUser.id, role: demoUser.role }, jwtSecret, { expiresIn: jwtExpiresIn });
    
    return res.status(201).json({ token, user: demoUser, demo: true });
  }
};

export const login = async (req, res) => {
  try {
    const dbPool = await loadPool();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (dbPool) {
      const result = await dbPool.query(
        'SELECT id, name, email, password_hash, role, region FROM users WHERE email = $1',
        [normalizedEmail]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

      return res.status(200).json({ token, user: sanitizeUser(user) });
    } else {
      // Demo mode - check demo users
      const demoUser = DEMO_USERS.find(u => u.email === normalizedEmail && u.password === password);
      
      if (demoUser) {
        const { password: _, ...userWithoutPassword } = demoUser;
        const token = jwt.sign({ id: demoUser.id, role: demoUser.role }, jwtSecret, { expiresIn: jwtExpiresIn });
        return res.status(200).json({ token, user: sanitizeUser(userWithoutPassword), demo: true });
      }
      
      return res.status(401).json({ message: 'Invalid credentials. Try demo@agrichain.com / demo123' });
    }
  } catch (err) {
    console.error("Login error:", err.message);
    
    // Fallback to demo login on error
    const { email, password } = req.body;
    const normalizedEmail = String(email).trim().toLowerCase();
    const demoUser = DEMO_USERS.find(u => u.email === normalizedEmail && u.password === password);
    
    if (demoUser) {
      const { password: _, ...userWithoutPassword } = demoUser;
      const token = jwt.sign({ id: demoUser.id, role: demoUser.role }, jwtSecret, { expiresIn: jwtExpiresIn });
      return res.status(200).json({ token, user: sanitizeUser(userWithoutPassword), demo: true });
    }
    
    return res.status(200).json({ message: 'Login service unavailable. Try demo@agrichain.com / demo123' });
  }
};
