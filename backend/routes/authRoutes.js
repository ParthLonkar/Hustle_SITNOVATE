import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateRegister = (req, res, next) => {
  const { name, email, password, role, region } = req.body;

  if (!name || !email || !password || !role || !region) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!isEmail(String(email).trim())) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }
  if (!['farmer', 'admin', 'trader'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role.' });
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  if (!isEmail(String(email).trim())) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  return next();
};

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

export default router;
