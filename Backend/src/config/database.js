import pg from 'pg';

const { Pool } = pg;

const DEFAULT_URL = 'postgresql://postgres:postgres@localhost:5433/calorie_tracker';
const url = process.env.DATABASE_URL;

const connectionString =
  url && !url.includes('user:password')
    ? url
    : DEFAULT_URL;

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const query = (text, params) => pool.query(text, params);

export default pool;