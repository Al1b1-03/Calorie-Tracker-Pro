import { query } from '../config/database.js';

const todayDate = () => new Date().toISOString().split('T')[0];

export const getWaterToday = async (req, res) => {
  try {
    const userId = req.user.userId;
    const date = req.query.date || todayDate();

    const [logsResult, profileResult] = await Promise.all([
      query(
        `SELECT COALESCE(SUM(amount_ml), 0) AS total_ml
         FROM water_logs WHERE user_id = $1 AND log_date = $2`,
        [userId, date]
      ),
      query('SELECT water_goal_ml FROM users WHERE id = $1', [userId]),
    ]);

    const totalMl = parseInt(logsResult.rows[0]?.total_ml, 10) || 0;
    const goalMl = profileResult.rows[0]?.water_goal_ml || 2000;

    res.json({
      date,
      totalMl,
      goalMl,
      remainingMl: Math.max(0, goalMl - totalMl),
      percent: goalMl > 0 ? Math.min(100, Math.round((totalMl / goalMl) * 100)) : 0,
    });
  } catch (err) {
    console.error('Get water error:', err);
    res.status(500).json({ error: 'Ошибка загрузки данных о воде' });
  }
};

export const addWater = async (req, res) => {
  try {
    const userId = req.user.userId;
    const amountMl = parseInt(req.body.amountMl, 10);
    const date = req.body.date || todayDate();

    if (!amountMl || amountMl < 1 || amountMl > 2000) {
      return res.status(400).json({ error: 'Укажите количество от 1 до 2000 мл' });
    }

    await query(
      `INSERT INTO water_logs (user_id, amount_ml, log_date) VALUES ($1, $2, $3)`,
      [userId, amountMl, date]
    );

    const logsResult = await query(
      `SELECT COALESCE(SUM(amount_ml), 0) AS total_ml
       FROM water_logs WHERE user_id = $1 AND log_date = $2`,
      [userId, date]
    );
    const profileResult = await query(
      'SELECT water_goal_ml FROM users WHERE id = $1',
      [userId]
    );

    const totalMl = parseInt(logsResult.rows[0]?.total_ml, 10) || 0;
    const goalMl = profileResult.rows[0]?.water_goal_ml || 2000;

    res.status(201).json({
      date,
      totalMl,
      goalMl,
      remainingMl: Math.max(0, goalMl - totalMl),
      percent: goalMl > 0 ? Math.min(100, Math.round((totalMl / goalMl) * 100)) : 0,
    });
  } catch (err) {
    console.error('Add water error:', err);
    res.status(500).json({ error: 'Ошибка при добавлении воды' });
  }
};
