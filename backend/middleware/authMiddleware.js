import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Use same secret as authController.js
const jwtSecret = process.env.JWT_SECRET || 'dev_secret_change_me';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  // If no token, create a demo user for development
  if (!token) {
    console.log('[Auth] No token, using demo user');
    req.user = { id: 1, role: 'farmer' };
    return next();
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    return next();
  } catch (err) {
    // For development, still allow access with demo user
    console.log('[Auth] Invalid token, using demo user');
    req.user = { id: 1, role: 'farmer' };
    return next();
  }
};

export default authMiddleware;
