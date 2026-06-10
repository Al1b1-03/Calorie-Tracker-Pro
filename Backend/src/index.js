/**
 * ФАЙЛ: index.js
 * ЧТО ЭТО: Точка входа сервера Express.
 * ЗА ЧТО ОТВЕЧАЕТ: запуск API на :3003, CORS, статика uploads, подключение всех маршрутов, миграции БД.
 */
import 'dotenv/config';

const BOOT_VERSION = '2026-06-01-docker-db-fix';
console.info(`[boot] Calorie Tracker API ${BOOT_VERSION}`);
import path from 'path';
import express from 'express';
import cors from 'cors';
import { corsOptions } from './config/cors.js';
import pool, { usingExplicitDatabaseUrl } from './config/database.js';
import {
  getDatabaseHostLabel,
  validateDatabaseUrl,
  resolveDatabaseUrlFromEnv,
  describeDatabaseUrlFormat,
} from './config/databaseUrl.js';
import { runMigrations } from './database/migrate.js';
import authRoutes from './routes/authRoutes.js';
import entriesRoutes from './routes/entriesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import adminWorkoutsRoutes from './routes/adminWorkoutsRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import { listWorkouts } from './controllers/workoutsController.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import adminManagementRoutes from './routes/adminManagementRoutes.js';
import adminNotificationsRoutes from './routes/adminNotificationsRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import { requireAdmin } from './middleware/requireAdmin.js';
import fs from 'fs';
import { uploadsRoot, productsUploadsDir, scansUploadsDir } from './config/uploadsPath.js';
import scansRoutes from './routes/scansRoutes.js';
import waterRoutes from './routes/waterRoutes.js';

const app = express();
const PORT = process.env.PORT || 3003;
let databaseReady = false;

app.use(cors(corsOptions));
app.use(express.json());

if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir, { recursive: true });
}
if (!fs.existsSync(scansUploadsDir)) {
  fs.mkdirSync(scansUploadsDir, { recursive: true });
}

app.use('/uploads', express.static(uploadsRoot));
app.use('/uploads/products', express.static(productsUploadsDir));
app.use('/uploads/scans', express.static(scansUploadsDir));

app.get('/api/uploads/products/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename || filename.includes('..')) {
    return res.status(400).json({ error: 'Некорректное имя файла' });
  }
  const filePath = path.join(productsUploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Файл не найден');
  }
  const ext = path.extname(filename).toLowerCase();
  const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
  res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
  try {
    const data = fs.readFileSync(filePath);
    res.send(data);
  } catch (err) {
    console.error('Ошибка чтения файла:', err.message);
    if (!res.headersSent) res.status(500).send('Ошибка отправки файла');
  }
});

app.get('/api/health', (_, res) => {
  res.json({
    status: databaseReady ? 'ok' : 'degraded',
    message: 'Calorie Tracker API',
    env: process.env.NODE_ENV || 'development',
    database: databaseReady,
    databaseHost: getDatabaseHostLabel(process.env.DATABASE_URL),
  });
});

app.get(['/api/workouts', '/api/workouts/'], listWorkouts);
app.options('/api/admin/workouts', (_, res) => res.sendStatus(204));
app.options('/api/admin/workouts/:id', (_, res) => res.sendStatus(204));
app.options('/api/admin/workouts/:id/image', (_, res) => res.sendStatus(204));
app.options('/api/admin/orders', (_, res) => res.sendStatus(204));
app.options('/api/admin/orders/:id', (_, res) => res.sendStatus(204));
app.options('/api/admin/notifications/counts', (_, res) => res.sendStatus(204));
app.options('/api/admin/products/:id/image', (_, res) => res.sendStatus(204));

app.use(
  '/api/admin/workouts',
  authenticateToken,
  requireAdmin,
  adminWorkoutsRoutes
);

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/scans', scansRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/admin/notifications', adminNotificationsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/support', supportRoutes);
app.use('/api', shopRoutes);
app.use('/api/admin', adminManagementRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const waitForDb = async (maxAttempts = 30) => {
  const host = getDatabaseHostLabel(process.env.DATABASE_URL);
  console.log(`[db] connecting to ${host} (up to ${maxAttempts} attempts)...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (err) {
      console.warn(`[db] attempt ${i + 1}/${maxAttempts}: ${err.message}`);
      if (i === maxAttempts - 1) {
        throw new Error(`Database connection failed (${host}): ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

const setupDatabase = async () => {
  const resolvedUrl = resolveDatabaseUrlFromEnv();
  const validation = validateDatabaseUrl(resolvedUrl);

  if (!usingExplicitDatabaseUrl) {
    const raw = process.env.DATABASE_URL;
    if (raw) {
      console.error(
        '[db] DATABASE_URL present but invalid:',
        validation.message,
        `| format: ${describeDatabaseUrlFormat(raw)}`
      );
    } else {
      console.warn(
        '[db] No valid DATABASE_URL. Render: PostgreSQL → Connect → calorie-tracker-pro, or paste Internal Database URL.'
      );
    }
    return;
  }

  if (!validation.ok) {
    console.error('[db] invalid database config:', validation.message);
    return;
  }

  console.info(`[db] target host: ${validation.host}`);

  await waitForDb();
  console.log('[db] connected');
  await runMigrations();
  databaseReady = true;
  console.log('[db] migrations complete');
};

const startServer = () => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });

  setupDatabase().catch((err) => {
    console.error('[db] setup failed:', err.message);
  });
};

process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaughtException:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('[fatal] unhandledRejection:', err);
});

startServer();
