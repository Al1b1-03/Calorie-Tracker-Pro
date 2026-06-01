/**
 * ФАЙЛ: adminNotificationsController.js
 * ЧТО ЭТО: Контроллер: бейджи админа.
 * ЗА ЧТО ОТВЕЧАЕТ: число новых заказов и обращений.
 */
import { query } from '../config/database.js';

/**
 * Счётчики для бейджей в шапке админки.
 * orders — заказы с id больше ordersAfterId (просмотренные админом).
 * support — обращения со статусом new или in_progress.
 */
export const getAdminNotificationCounts = async (req, res) => {
  try {
    const ordersAfterId = Math.max(0, parseInt(req.query.ordersAfterId, 10) || 0);
    const supportAfterId = Math.max(0, parseInt(req.query.supportAfterId, 10) || 0);

    const [ordersResult, supportResult] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM orders WHERE id > $1', [ordersAfterId]),
      query(
        `SELECT COUNT(*)::int AS count FROM support_messages
         WHERE id > $1 AND LOWER(status) IN ('new', 'in_progress')`,
        [supportAfterId]
      ),
    ]);

    res.json({
      orders: ordersResult.rows[0]?.count ?? 0,
      support: supportResult.rows[0]?.count ?? 0,
    });
  } catch (err) {
    console.error('Admin notification counts error:', err);
    res.status(500).json({ error: 'Ошибка загрузки уведомлений' });
  }
};
