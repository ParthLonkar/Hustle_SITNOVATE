import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  region: user.region,
});

export const register = async (req, res) => {
  try {
    const { name, email, password, role, region } = req.body;

    if (!name || !email || !password || !role || !region) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, region)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, region`,
      [name, normalizedEmail, passwordHash, role, region]
    );

    const user = insertResult.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    if (err && err.code === '23514') {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    return res.status(500).json({ message: 'Registration failed.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const result = await pool.query(
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
  } catch (err) {
    return res.status(500).json({ message: 'Login failed.' });
  }
};
