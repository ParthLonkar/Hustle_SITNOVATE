import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create pool but don't fail if DB unavailable
let pool = null;
let dbAvailable = false;

try {
  pool = new pg.Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'agrichain',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    connectionString: process.env.DATABASE_URL || undefined,
  });
  
  pool.on('error', (err) => {
    console.error('Database error:', err.message);
  });
} catch (e) {
  console.warn('Database pool not created:', e.message);
}

// Simple connection test - non-blocking
export const testConnection = async () => {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    client.release();
    dbAvailable = true;
    console.log('Database connected successfully');
    return true;
  } catch (err) {
    console.warn('Database not available - running in demo mode');
    dbAvailable = false;
    return false;
  }
};

export const isDbAvailable = () => dbAvailable;

// Run test silently
testConnection();

export default pool;
