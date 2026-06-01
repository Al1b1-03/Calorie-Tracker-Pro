/**
 * ФАЙЛ: scansRoutes.js
 * ЧТО ЭТО: Маршруты AI-камеры.
 * ЗА ЧТО ОТВЕЧАЕТ: /api/scans — распознать фото, история.
 */
import { Router } from 'express';
import { param } from 'express-validator';
import {
  analyzeScan,
  getScans,
  getScanById,
  confirmScan,
} from '../controllers/scansController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { uploadScanImage } from '../middleware/uploadScan.js';

const router = Router();

router.post(
  '/analyze',
  authenticateToken,
  (req, res, next) => {
    uploadScanImage.single('image')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ error: err.message || 'Ошибка загрузки файла' });
      }
      next();
    });
  },
  analyzeScan
);

router.get('/', authenticateToken, getScans);

router.get(
  '/:id',
  authenticateToken,
  [param('id').isInt({ min: 1 })],
  handleValidationErrors,
  getScanById
);

router.post(
  '/:id/confirm',
  authenticateToken,
  [param('id').isInt({ min: 1 })],
  handleValidationErrors,
  confirmScan
);

export default router;
