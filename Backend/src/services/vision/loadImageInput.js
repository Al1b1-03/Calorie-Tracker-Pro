/**
 * ФАЙЛ: loadImageInput.js
 * ЧТО ЭТО: Подготовка изображения.
 * ЗА ЧТО ОТВЕЧАЕТ: буфер/путь для моделей.
 */
import fs from 'fs';
import path from 'path';
import { scansUploadsDir } from '../../config/uploadsPath.js';

const EXT_MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

/**
 * @param {{ buffer?: Buffer, filename?: string, mimeType?: string, filePath?: string }} input
 */
export async function loadImageInput(input = {}) {
  let buffer = input.buffer;
  let mimeType = input.mimeType || 'image/jpeg';

  if ((!buffer || !buffer.length) && input.filePath && fs.existsSync(input.filePath)) {
    buffer = fs.readFileSync(input.filePath);
  }

  if ((!buffer || !buffer.length) && input.filename) {
    const filePath = path.join(scansUploadsDir, input.filename);
    if (fs.existsSync(filePath)) {
      buffer = fs.readFileSync(filePath);
      const ext = path.extname(input.filename).toLowerCase();
      mimeType = EXT_MIME[ext] || mimeType;
    }
  }

  if (!buffer || !buffer.length) {
    throw new Error('Image buffer is empty — cannot analyze photo');
  }

  return { buffer, mimeType };
}
