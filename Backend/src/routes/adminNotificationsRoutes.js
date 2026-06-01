/**
 * ФАЙЛ: adminNotificationsRoutes.js
 * ЧТО ЭТО: Счётчики для шапки.
 * ЗА ЧТО ОТВЕЧАЕТ: GET /api/admin/notifications/counts — бейджи.
 */
import { Router } from 'express';
import { getAdminNotificationCounts } from '../controllers/adminNotificationsController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(authenticateToken, requireAdmin);
router.get('/counts', getAdminNotificationCounts);

export default router;
