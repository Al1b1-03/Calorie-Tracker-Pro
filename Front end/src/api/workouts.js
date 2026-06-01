/**
 * ФАЙЛ: workouts.js
 * ЧТО ЭТО: API: тренировки.
 * ЗА ЧТО ОТВЕЧАЕТ: каталог и админ CRUD.
 */
import { request, getApiUrl } from './client.js';

export const workoutsApi = {
  list: () => request('/workouts'),

  admin: {
    list: () => request('/admin/workouts'),
    create: (data) =>
      request('/admin/workouts', {
        method: 'POST',
        body: JSON.stringify({
          title: data.title,
          shortDesc: data.shortDesc,
          fullDescription: data.fullDescription,
          benefits: data.benefits,
          howTo: data.howTo,
          regime: data.regime,
          important: data.important,
          targetMuscles: data.targetMuscles,
          duration: data.duration,
          calories: data.calories,
          difficulty: data.difficulty,
          category: data.category,
          imageUrl: data.imageUrl,
          exercises: data.exercises ?? [],
        }),
      }),
    update: (id, data) =>
      request(`/admin/workouts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: data.title,
          shortDesc: data.shortDesc,
          fullDescription: data.fullDescription,
          benefits: data.benefits,
          howTo: data.howTo,
          regime: data.regime,
          important: data.important,
          targetMuscles: data.targetMuscles,
          duration: data.duration,
          calories: data.calories,
          difficulty: data.difficulty,
          category: data.category,
          imageUrl: data.imageUrl,
          exercises: data.exercises,
        }),
      }),
    uploadImage: async (id, file) => {
      const formData = new FormData();
      formData.append('image', file);
      const url = getApiUrl(`/admin/workouts/${id}/image`);
      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || 'Ошибка загрузки изображения');
      return data;
    },
    delete: (id) =>
      request(`/admin/workouts/${id}`, {
        method: 'DELETE',
      }),
  },
};

