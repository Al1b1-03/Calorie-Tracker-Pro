const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function countPhoneDigits(phone) {
  return String(phone || '').replace(/\D/g, '').length;
}

/**
 * @param {object} data — поля формы регистрации
 * @param {(key: string) => string} t — перевод auth.err*
 * @returns {{ ok: boolean, errors: Record<string, string> }}
 */
export function validateRegistration(data, t) {
  const errors = {};
  const firstName = String(data.firstName || '').trim();
  const lastName = String(data.lastName || '').trim();
  const phone = String(data.phone || '').trim();
  const email = String(data.email || '').trim();
  const password = data.password || '';
  const confirmPassword = data.confirmPassword || '';

  if (!firstName) errors.firstName = t('auth.errFirstName');
  if (!lastName) errors.lastName = t('auth.errLastName');
  if (!phone) {
    errors.phone = t('auth.errPhone');
  } else {
    const digits = countPhoneDigits(phone);
    if (digits < 10 || digits > 15) errors.phone = t('auth.errPhoneFormat');
  }
  if (!email) {
    errors.email = t('auth.errEmail');
  } else if (!EMAIL_RE.test(email)) {
    errors.email = t('auth.errEmailFormat');
  }
  if (!password) {
    errors.password = t('auth.errPassword');
  } else if (password.length < 6) {
    errors.password = t('auth.passwordMin');
  }
  if (!confirmPassword) {
    errors.confirmPassword = t('auth.errConfirmPassword');
  } else if (password !== confirmPassword) {
    errors.confirmPassword = t('auth.passwordMismatch');
  }

  return { ok: Object.keys(errors).length === 0, errors };
}
