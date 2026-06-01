/**
 * ФАЙЛ: adminManagementRoutes.js
 * ЧТО ЭТО: Супер-админ.
 * ЗА ЧТО ОТВЕЧАЕТ: /api/admin — создание и удаление админов.
 */
import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createAdmin,
  listAdmins,
  deleteAdmin,
  promoteUser,
} from '../controllers/adminManagementController.js';
import { requireAuth, requireSuperAdmin } from '../middleware/rbac.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

router.use(requireAuth, requireSuperAdmin);

const createAdminValidation = [
  body('firstName').trim().notEmpty().withMessage('Имя обязательно'),
  body('lastName').trim().notEmpty().withMessage('Фамилия обязательна'),
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  body('phone').optional({ nullable: true }).trim(),
];

router.post('/create-admin', createAdminValidation, handleValidationErrors, createAdmin);
router.get('/list-admins', listAdmins);
router.delete('/:id', param('id').isInt({ min: 1 }), handleValidationErrors, deleteAdmin);
router.patch(
  '/promote/:userId',
  param('userId').isInt({ min: 1 }),
  handleValidationErrors,
  promoteUser
);

export default router;
