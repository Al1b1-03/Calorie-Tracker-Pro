/**
 * ФАЙЛ: waterRoutes.js
 * ЧТО ЭТО: Маршруты учёта воды.
 * ЗА ЧТО ОТВЕЧАЕТ: /api/water — вода за сегодня.
 */
import { Router } from 'express';
import { body } from 'express-validator';
import { getWaterToday, addWater } from '../controllers/waterController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.get('/today', authenticateToken, getWaterToday);

router.post(
  '/',
  authenticateToken,
  [
    body('amountMl').isInt({ min: 1, max: 2000 }).withMessage('От 1 до 2000 мл'),
    body('date').optional().matches(/^\d{4}-\d{2}-\d{2}$/),
  ],
  handleValidationErrors,
  addWater
);

export default router;
