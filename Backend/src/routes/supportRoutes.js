/**
 * ФАЙЛ: supportRoutes.js
 * ЧТО ЭТО: Поддержка.
 * ЗА ЧТО ОТВЕЧАЕТ: /api/support — обращения user и admin.
 */
import { Router } from 'express';
import {
  createSupportMessage,
  deleteSupportMessage,
  listMySupportMessages,
  listSupportMessages,
  replySupportMessage,
  updateSupportMessageStatus,
} from '../controllers/supportController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.post('/', authenticateToken, createSupportMessage);
router.get('/my', authenticateToken, listMySupportMessages);
router.get('/admin', authenticateToken, requireAdmin, listSupportMessages);
router.patch('/admin/:id/status', authenticateToken, requireAdmin, updateSupportMessageStatus);
router.patch('/admin/:id/reply', authenticateToken, requireAdmin, replySupportMessage);
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteSupportMessage);

export default router;
