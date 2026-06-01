/**
 * ФАЙЛ: ordersRoutes.js
 * ЧТО ЭТО: Админ: заказы.
 * ЗА ЧТО ОТВЕЧАЕТ: /api/admin/orders — список и удаление.
 */
import { Router } from 'express';
import { listOrders, deleteOrder } from '../controllers/ordersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/', listOrders);
router.delete('/:id', deleteOrder);

export default router;
