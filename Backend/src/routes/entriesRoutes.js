/**
 * ФАЙЛ: entriesRoutes.js
 * ЧТО ЭТО: Маршруты дневника питания.
 * ЗА ЧТО ОТВЕЧАЕТ: /api/entries — записи, статистика, график.
 */
import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createEntry,
  getEntries,
  deleteEntry,
  getStats,
  getChart,
} from '../controllers/entriesController.js';
import { authenticateToken } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

const createEntryValidation = [
  body('productName')
    .trim()
    .notEmpty()
    .withMessage('Название продукта обязательно')
    .isLength({ max: 255 })
    .withMessage('Слишком длинное название'),
  body('calories')
    .optional({ values: 'falsy' })
    .isInt({ min: 0 })
    .withMessage('Некорректное значение калорий'),
  body('protein')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Некорректное значение'),
  body('fat')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Некорректное значение'),
  body('carbs')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Некорректное значение'),
  body('entryDate')
    .notEmpty()
    .withMessage('Дата обязательна')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Некорректная дата (формат: ГГГГ-ММ-ДД)'),
];

router.post(
  '/',
  authenticateToken,
  createEntryValidation,
  handleValidationErrors,
  createEntry
);

router.get('/', authenticateToken, getEntries);

router.delete(
  '/:id',
  authenticateToken,
  [param('id').isInt({ min: 1 }).withMessage('Некорректный ID')],
  handleValidationErrors,
  deleteEntry
);

router.get('/stats', authenticateToken, getStats);

router.get('/chart', authenticateToken, getChart);

export default router;
