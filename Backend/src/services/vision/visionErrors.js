/**
 * Map low-level vision/ML errors to user-facing messages.
 */
export function mapVisionError(err) {
  const msg = String(err?.message || err?.cause?.message || '');
  const code = err?.code || err?.cause?.code || '';

  if (
    msg.includes('terminated') ||
    msg.includes('other side closed') ||
    code === 'UND_ERR_SOCKET' ||
    msg.includes('ECONNRESET')
  ) {
    return 'Модель распознавания ещё загружается. Подождите 1–2 минуты после запуска сервера и попробуйте снова.';
  }

  if (msg.includes('Image buffer is empty')) {
    return 'Не удалось прочитать фото. Попробуйте другое изображение.';
  }

  if (msg.includes('ENOMEM') || msg.includes('out of memory')) {
    return 'Недостаточно памяти для распознавания. Увеличьте лимит памяти Docker (Settings → Resources).';
  }

  return msg || 'Ошибка анализа изображения';
}
