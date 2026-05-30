import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { scansUploadsDir } from '../config/uploadsPath.js';

if (!fs.existsSync(scansUploadsDir)) {
  fs.mkdirSync(scansUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, scansUploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif'].includes(
      ext.toLowerCase()
    )
      ? ext.toLowerCase()
      : '.jpg';
    cb(null, `scan-${Date.now()}-${Math.random().toString(36).slice(2)}${safeExt}`);
  },
});

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif',
  'image/heic-sequence',
  'application/octet-stream',
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']);

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mimeOk = ALLOWED_MIME.has(file.mimetype);
  const extOk = ALLOWED_EXT.has(ext);

  if (mimeOk || extOk) {
    cb(null, true);
  } else {
    cb(new Error('Разрешены изображения: JPG, PNG, WebP, HEIC'));
  }
};

export const uploadScanImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});
