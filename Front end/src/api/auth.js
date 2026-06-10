/**
 * ФАЙЛ: auth.js
 * ЧТО ЭТО: API: авторизация.
 * ЗА ЧТО ОТВЕЧАЕТ: login, register, profile.
 */
import { request } from './client.js';

function numOrUndef(value) {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export const authApi = {
  register: (data) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || undefined,
        email: data.email,
        password: data.password,
      }),
    }),

  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password,
      }),
    }),

  getProfile: () => request('/auth/profile'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({
        gender: data.gender || undefined,
        age: data.age || undefined,
        weight: data.weight || undefined,
        height: data.height || undefined,
        activityLevel: data.activityLevel || undefined,
        calorieNorm: numOrUndef(data.calorieNorm),
        protein: numOrUndef(data.protein),
        fat: numOrUndef(data.fat),
        carbs: numOrUndef(data.carbs),
        oldPassword: data.oldPassword || undefined,
        newPassword: data.newPassword || undefined,
      }),
    }),
};
