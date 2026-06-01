/**
 * ФАЙЛ: errorHandler.js
 * ЧТО ЭТО: Обработка ошибок API.
 * ЗА ЧТО ОТВЕЧАЕТ: 404 notFound и общий errorHandler.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Маршрут не найден',
    code: 'NOT_FOUND',
    path: req.originalUrl,
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;
  const isServerError = status >= 500;

  if (isServerError) {
    console.error(`[${req.method}] ${req.originalUrl}`, err.stack || err.message);
  }

  const payload = {
    error: err.message || 'Внутренняя ошибка сервера',
    code: err.code || (isServerError ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
}
