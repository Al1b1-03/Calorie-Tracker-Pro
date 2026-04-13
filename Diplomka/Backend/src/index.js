import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';
import pool from './config/database.js';
import { runMigrations, ensureWorkoutsTable } from './database/migrate.js';
import authRoutes from './routes/authRoutes.js';
import entriesRoutes from './routes/entriesRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import productsRoutes from './routes/productsRoutes.js';
import ordersRoutes from './routes/ordersRoutes.js';
import { deleteOrder } from './controllers/ordersController.js';
import shopRoutes from './routes/shopRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import workoutsRoutes from './routes/workoutsRoutes.js';
import adminWorkoutsRoutes from './routes/adminWorkoutsRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import { listWorkouts } from './controllers/workoutsController.js';
import { body } from 'express-validator';
import { handleValidationErrors } from './middleware/validation.js';
import { authenticateToken } from './middleware/auth.js';
import { requireAdmin } from './middleware/requireAdmin.js';
import fs from 'fs';
import { uploadsRoot, productsUploadsDir } from './config/uploadsPath.js';

const app = express();
const PORT = process.env.PORT || 3003;

const defaultDevOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];
const allowedOrigins = new Set(defaultDevOrigins);
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(',').forEach((s) => allowedOrigins.add(s.trim()));
}
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
// Папка для фото товаров: создаём при старте, раздаём только через /api/uploads/products/:filename
if (!fs.existsSync(productsUploadsDir)) {
  fs.mkdirSync(productsUploadsDir, { recursive: true });
}
if (process.env.NODE_ENV !== 'production') {
  console.log('Фото товаров сохраняются в:', productsUploadsDir);
}

app.use('/uploads', express.static(uploadsRoot));
app.use('/uploads/products', express.static(productsUploadsDir));

// Единый маршрут для картинок товаров (и админ, и магазин запрашивают сюда)
app.get('/api/uploads/products/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename || filename.includes('..')) {
    return res.status(400).json({ error: 'Некорректное имя файла' });
  }
  const filePath = path.join(productsUploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Фото не найдено:', filePath);
    }
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

if (process.env.NODE_ENV !== 'production') {
  console.log('Uploads (фото) папка:', productsUploadsDir);
  console.log('Существует:', fs.existsSync(productsUploadsDir));
  app.get('/api/debug/uploads', (_, res) => {
    try {
      const files = fs.existsSync(productsUploadsDir)
        ? fs.readdirSync(productsUploadsDir)
        : [];
      res.json({
        productsUploadsDir,
        exists: fs.existsSync(productsUploadsDir),
        files,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}

app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'Calorie Tracker API' });
});

// Тренировки — регистрируем первыми, чтобы ничего не перехватывало
// Публичный список (без авторизации)
app.get(['/api/workouts', '/api/workouts/'], listWorkouts);
// Preflight (OPTIONS) для админских маршрутов
app.options('/api/admin/workouts', (_, res) => res.sendStatus(204));
app.options('/api/admin/workouts/:id', (_, res) => res.sendStatus(204));
app.options('/api/admin/workouts/:id/image', (_, res) => res.sendStatus(204));
app.options('/api/admin/orders', (_, res) => res.sendStatus(204));
app.options('/api/admin/orders/:id', (_, res) => res.sendStatus(204));
app.options('/api/admin/products/:id/image', (_, res) => res.sendStatus(204));

// Админ-маршруты регистрируем ДО общего /api, чтобы их не перехватывал shopRoutes
app.delete('/api/admin/orders/:id', authenticateToken, requireAdmin, deleteOrder);
app.use(
  '/api/admin/workouts',
  authenticateToken,
  requireAdmin,
  adminWorkoutsRoutes
);

app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/products', productsRoutes);
app.use('/api/admin/orders', ordersRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/workouts', authenticateToken, workoutsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api', shopRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const waitForDb = async (maxAttempts = 10) => {
  let lastError;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pool.query('SELECT 1');
      return true;
    } catch (err) {
      lastError = err;
      if (i === maxAttempts - 1) {
        throw new Error(`Database connection failed: ${err.message}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
};

const startServer = async () => {
  try {
    if (process.env.DATABASE_URL) {
      await waitForDb();
      console.log('Database connected');
      await runMigrations();
      await ensureWorkoutsTable();
    } else {
      console.warn('DATABASE_URL not set. Create .env from .env.example');
    }
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
