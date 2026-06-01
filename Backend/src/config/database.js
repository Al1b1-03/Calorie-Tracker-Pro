/**
 * ФАЙЛ: database.js
 * ЧТО ЭТО: Подключение к PostgreSQL.
 * ЗА ЧТО ОТВЕЧАЕТ: пул соединений по DATABASE_URL, SSL для облака (Render).
 */
import pg from 'pg';

const { Pool } = pg;

const DEFAULT_URL = 'postgresql://postgres:postgres@localhost:5433/calorie_tracker';
const url = process.env.DATABASE_URL;

const connectionString =
  url && !url.includes('user:password')
    ? url
    : DEFAULT_URL;

function needsSsl(connStr) {
  const flag = process.env.DATABASE_SSL;
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  if (process.env.NODE_ENV === 'production') return true;
  return /render\.com|neon\.tech|supabase\.co|amazonaws\.com/i.test(connStr || '');
}

const pool = new Pool({
  connectionString,
  ssl: needsSsl(connectionString)
    ? {
        rejectUnauthorized: false,
      }
    : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const query = (text, params) => pool.query(text, params);

export default pool;
