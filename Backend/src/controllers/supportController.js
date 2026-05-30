import { query } from '../config/database.js';

export const createSupportMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subject = String(req.body?.subject || '').trim();
    const message = String(req.body?.message || '').trim();

    if (!subject || !message) {
      return res.status(400).json({ error: 'Тема и сообщение обязательны' });
    }

    const result = await query(
      `INSERT INTO support_messages (user_id, subject, message)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, subject, message, status, created_at, updated_at`,
      [userId, subject, message]
    );

    const row = result.rows[0];
    return res.status(201).json({
      message: {
        id: row.id,
        userId: row.user_id,
        subject: row.subject,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      },
    });
  } catch (err) {
    console.error('Create support message error:', err);
    return res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
};

export const listMySupportMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await query(
      `SELECT id, user_id, subject, message, status, admin_reply, replied_at, created_at, updated_at
       FROM support_messages
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      subject: row.subject,
      message: row.message,
      status: row.status,
      adminReply: row.admin_reply,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ messages });
  } catch (err) {
    console.error('List my support messages error:', err);
    return res.status(500).json({ error: 'Ошибка загрузки ваших обращений' });
  }
};

export const listSupportMessages = async (_req, res) => {
  try {
    const result = await query(
      `SELECT sm.id, sm.user_id, sm.subject, sm.message, sm.status, sm.admin_reply, sm.replied_at,
              sm.created_at, sm.updated_at, u.first_name, u.last_name, u.email
       FROM support_messages sm
       JOIN users u ON u.id = sm.user_id
       ORDER BY sm.created_at DESC`
    );

    const messages = result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Пользователь',
      userEmail: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status,
      adminReply: row.admin_reply,
      repliedAt: row.replied_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return res.json({ messages });
  } catch (err) {
    console.error('List support messages error:', err);
    return res.status(500).json({ error: 'Ошибка загрузки обращений' });
  }
};

export const updateSupportMessageStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || '').trim().toLowerCase();
    const allowed = new Set(['new', 'in_progress', 'done']);

    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    if (!allowed.has(status)) return res.status(400).json({ error: 'Некорректный статус' });

    const result = await query(
      `UPDATE support_messages
       SET status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, status, updated_at`,
      [id, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Обращение не найдено' });
    }

    return res.json({
      message: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (err) {
    console.error('Update support status error:', err);
    return res.status(500).json({ error: 'Ошибка обновления статуса' });
  }
};

export const deleteSupportMessage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Некорректный id' });

    const result = await query('DELETE FROM support_messages WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Обращение не найдено' });
    }

    return res.json({ message: 'Обращение удалено', id: result.rows[0].id });
  } catch (err) {
    console.error('Delete support message error:', err);
    return res.status(500).json({ error: 'Ошибка удаления обращения' });
  }
};

export const replySupportMessage = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const adminId = req.user.userId;
    const adminReply = String(req.body?.reply || '').trim();
    if (!id) return res.status(400).json({ error: 'Некорректный id' });
    if (!adminReply) return res.status(400).json({ error: 'Текст ответа обязателен' });

    const result = await query(
      `UPDATE support_messages
       SET admin_reply = $2,
           replied_by = $3,
           replied_at = CURRENT_TIMESTAMP,
           status = CASE WHEN status = 'done' THEN status ELSE 'in_progress' END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING id, admin_reply, replied_at, status`,
      [id, adminReply, adminId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Обращение не найдено' });
    }

    const row = result.rows[0];
    return res.json({
      message: {
        id: row.id,
        adminReply: row.admin_reply,
        repliedAt: row.replied_at,
        status: row.status,
      },
    });
  } catch (err) {
    console.error('Reply support message error:', err);
    return res.status(500).json({ error: 'Ошибка отправки ответа' });
  }
};
