import { query } from '../config/database.js';
import { isAdminRole, isSuperAdminRole, normalizeRole } from '../constants/roles.js';
export { requireAuth } from './auth.js';

export const loadUserRole = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Пользователь не найден' });
    }

    req.userRole = normalizeRole(result.rows[0].role);
    next();
  } catch (err) {
    console.error('loadUserRole error:', err);
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Пользователь не найден' });
    }

    const role = normalizeRole(result.rows[0].role);
    req.userRole = role;

    if (!isAdminRole(role)) {
      return res.status(403).json({
        error: 'Доступ запрещён. Требуются права администратора.',
      });
    }

    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};

export const requireSuperAdmin = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Пользователь не найден' });
    }

    const role = normalizeRole(result.rows[0].role);
    req.userRole = role;

    if (!isSuperAdminRole(role)) {
      return res.status(403).json({
        error: 'Доступ запрещён. Требуются права супер-администратора.',
      });
    }

    next();
  } catch (err) {
    console.error('requireSuperAdmin error:', err);
    res.status(500).json({ error: 'Ошибка проверки прав' });
  }
};
