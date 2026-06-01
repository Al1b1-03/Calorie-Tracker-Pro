/**
 * ФАЙЛ: validation.js
 * ЧТО ЭТО: Валидация запросов.
 * ЗА ЧТО ОТВЕЧАЕТ: ответ 400 при ошибках express-validator.
 */
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({ error: messages.join('. ') });
  }

  next();
};
