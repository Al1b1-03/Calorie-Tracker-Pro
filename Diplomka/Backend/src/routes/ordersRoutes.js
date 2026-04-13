import { Router } from 'express';
import { listOrders, deleteOrder } from '../controllers/ordersController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.use(authenticateToken, requireAdmin);

router.get('/', listOrders);
router.delete('/:id', deleteOrder);

export default router;
