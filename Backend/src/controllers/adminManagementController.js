/**
 * ФАЙЛ: adminManagementController.js
 * ЧТО ЭТО: Контроллер: управление админами.
 * ЗА ЧТО ОТВЕЧАЕТ: create/list/delete admin (SUPER_ADMIN).
 */
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { ROLES, isAdminRole, normalizeRole } from '../constants/roles.js';

const SALT_ROUNDS = 10;

const mapAdminRow = (row) => ({
  id: row.id,
  firstName: row.first_name,
  lastName: row.last_name,
  fullName: `${row.first_name} ${row.last_name}`.trim(),
  email: row.email,
  phone: row.phone,
  role: normalizeRole(row.role),
  createdAt: row.created_at,
});

export const createAdmin = async (req, res) => {
  try {
    const { firstName, lastName, phone, email, password } = req.body;

    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await query(
      `INSERT INTO users (first_name, last_name, phone, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, first_name, last_name, phone, email, role, created_at`,
      [firstName, lastName, phone || null, email, passwordHash, ROLES.ADMIN]
    );

    res.status(201).json({
      message: 'Администратор создан',
      admin: mapAdminRow(result.rows[0]),
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ error: 'Ошибка при создании администратора' });
  }
};

export const listAdmins = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, first_name, last_name, email, phone, role, created_at
       FROM users
       WHERE role IN ($1, $2)
       ORDER BY created_at DESC`,
      [ROLES.ADMIN, ROLES.SUPER_ADMIN]
    );

    res.json({ admins: result.rows.map(mapAdminRow) });
  } catch (err) {
    console.error('List admins error:', err);
    res.status(500).json({ error: 'Ошибка загрузки администраторов' });
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const superAdminId = req.user.userId;
    const targetId = parseInt(req.params.id, 10);

    if (targetId === superAdminId) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }

    const targetResult = await query(
      'SELECT id, role FROM users WHERE id = $1',
      [targetId]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Администратор не найден' });
    }

    const targetRole = normalizeRole(targetResult.rows[0].role);

    if (targetRole === ROLES.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Нельзя удалить супер-администратора' });
    }

    if (targetRole !== ROLES.ADMIN) {
      return res.status(400).json({ error: 'Пользователь не является администратором' });
    }

    await query('DELETE FROM users WHERE id = $1', [targetId]);

    res.json({ message: 'Администратор удалён' });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ error: 'Ошибка при удалении администратора' });
  }
};

export const promoteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const targetResult = await query(
      'SELECT id, role, first_name, last_name, email FROM users WHERE id = $1',
      [userId]
    );

    if (targetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const targetRole = normalizeRole(targetResult.rows[0].role);

    if (isAdminRole(targetRole)) {
      return res.status(400).json({ error: 'Пользователь уже является администратором' });
    }

    const result = await query(
      `UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, first_name, last_name, email, phone, role, created_at`,
      [ROLES.ADMIN, userId]
    );

    res.json({
      message: 'Пользователь назначен администратором',
      admin: mapAdminRow(result.rows[0]),
    });
  } catch (err) {
    console.error('Promote user error:', err);
    res.status(500).json({ error: 'Ошибка при назначении администратора' });
  }
};
