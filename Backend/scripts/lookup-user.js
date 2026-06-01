/**
 * ФАЙЛ: lookup-user.js
 * ЧТО ЭТО: CLI-скрипт.
 * ЗА ЧТО ОТВЕЧАЕТ: найти пользователя в БД по email.
 */
import 'dotenv/config';
import pg from 'pg';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/lookup-user.js <email>');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('render.com')
      ? { rejectUnauthorized: false }
      : false,
});

try {
  const result = await pool.query(
    `SELECT id, email, first_name, last_name, role, is_banned, created_at
     FROM users WHERE LOWER(email) = LOWER($1)`,
    [email]
  );
  if (result.rows.length === 0) {
    console.log('NOT_FOUND');
  } else {
    console.log(JSON.stringify(result.rows[0], null, 2));
  }
} finally {
  await pool.end();
}
