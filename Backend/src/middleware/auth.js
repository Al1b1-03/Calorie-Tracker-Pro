/**
 * ФАЙЛ: auth.js
 * ЧТО ЭТО: Middleware JWT.
 * ЗА ЧТО ОТВЕЧАЕТ: чтение Bearer-токена, req.user.userId.
 */
import jwt from 'jsonwebtoken';

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch {
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

export const authenticateToken = requireAuth;
