# Calorie Tracker Pro — Документация проекта

## 1) Что это за сайт

**Calorie Tracker Pro** — веб-приложение для:
- учета питания и калорий;
- просмотра и покупки товаров (витамины, блюда, рационы);
- работы с тренировками;
- управления системой через админ-панель.

Проект разделен на:
- `Front end` — SPA на React;
- `Backend` — REST API на Node.js/Express;
- `PostgreSQL` — основная база данных.

---

## 2) Технологии

### Frontend
- React 19
- React Router
- Vite
- CSS modules-style files (`*.css`) на уровне компонентов/страниц

### Backend
- Node.js (ESM)
- Express
- PostgreSQL (`pg`)
- JWT (`jsonwebtoken`) для авторизации
- `bcryptjs` для хеширования паролей
- `express-validator` для валидации
- `multer` для загрузки изображений

### Инфраструктура
- Docker / Docker Compose (опционально)

---

## 3) Архитектура и как это работает

Базовый поток:

1. Пользователь открывает SPA (`Front end`).
2. Клиент отправляет запросы в API (`Backend`).
3. API читает/записывает данные в PostgreSQL.
4. Для защищенных маршрутов используется JWT-токен (`Authorization: Bearer ...`).

Роли:
- `user` — обычный пользователь;
- `admin` — доступ к административным разделам.

---

## 4) Основной функционал

### Пользователь
- регистрация / вход;
- главная страница с записями питания и статистикой;
- профиль и персональные параметры;
- магазин, корзина и оформление заказа;
- раздел тренировок;
- отправка обращения оператору (админу).

### Администратор
- управление товарами;
- просмотр заказов;
- управление пользователями;
- управление тренировками;
- просмотр обращений пользователей (`/support`) и работа со статусами;
- удаление обращений.

---

## 5) Мультиязычность

Поддерживаются 3 языка:
- `RU`
- `KZ`
- `EN`

Реализация:
- `Front end/src/i18n/LanguageContext.jsx`
- `Front end/src/i18n/translations.js`
- `Front end/src/i18n/dynamicContent.js` (перевод динамичных названий/описаний)

Выбор языка хранится в `localStorage` (`ctp_lang`) и применяется глобально.

---

## 6) Важные страницы и маршруты (Frontend)

### Общие
- `/` — главная страница пользователя
- `/profile` — профиль
- `/shop` — магазин
- `/cart` — корзина
- `/workouts` — тренировки
- `/about` — о проекте
- `/login` — вход
- `/registration` — регистрация

### Админ
- `/products` — товары
- `/orders` — заказы
- `/users` — пользователи
- `/workouts` — тренировки (через роутер для admin/user)
- `/support` — обращения пользователей

---

## 7) API (основные эндпоинты)

Базовый URL (локально):
- `http://localhost:3003/api`

Проверка состояния:
- `GET /api/health`

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PATCH /api/auth/profile`

### Записи питания
- `GET /api/entries`
- `POST /api/entries`
- `DELETE /api/entries/:id`
- `GET /api/entries/stats`

### Магазин / корзина / заказы
- `GET /api/products` (через shop API)
- `GET /api/cart`
- `POST /api/cart`
- `PATCH /api/cart/:id`
- `DELETE /api/cart/:id`
- `POST /api/cart/checkout`

### Тренировки
- `GET /api/workouts` (публичный список + защищенный роут под токеном)
- admin CRUD через `/api/admin/workouts/*`

### Обращения в поддержку (новое)
- `POST /api/support` — пользователь отправляет сообщение оператору
- `GET /api/support/admin` — админ получает список обращений
- `PATCH /api/support/admin/:id/status` — админ меняет статус
- `DELETE /api/support/admin/:id` — админ удаляет обращение

---

## 8) База данных и миграции

Ключевые таблицы:
- `users`
- `food_entries`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `workouts`
- `support_messages` (обращения пользователей)

Новая миграция для поддержки:
- `Backend/database/migrations/021_create_support_messages.sql`

Миграции запускаются автоматически при старте backend через `runMigrations()`.

---

## 9) Как запустить проект локально

### Вариант 1: локально (без Docker)

1. Запустить PostgreSQL и создать БД (или использовать настройки по умолчанию проекта).
2. Backend:
   ```bash
   cd Backend
   npm install
   npm run dev
   ```
3. Frontend:
   ```bash
   cd "Front end"
   npm install
   npm run dev
   ```
4. Открыть `http://localhost:5173`.

### Вариант 2: через Docker

Из корня проекта (где `docker-compose.yml`):
```bash
docker compose up -d --build
```

---

## 10) Переменные окружения (Backend)

Основные:
- `PORT` (по умолчанию `3003`)
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL` (через запятую, для CORS)

---

## 11) Структура проекта (кратко)

```text
Diplomka/
├─ Backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ routes/
│  │  ├─ middleware/
│  │  ├─ config/
│  │  └─ index.js
│  └─ database/
│     └─ migrations/
└─ Front end/
   └─ src/
      ├─ api/
      ├─ components/
      ├─ pages/
      └─ i18n/
```

---

## 12) Последние важные изменения

- Добавлена полноценная мультиязычность (`RU/KZ/EN`) для UI.
- Добавлен раздел обращений к оператору:
  - форма у пользователя в профиле;
  - раздел обращений у админа;
  - статусы + удаление обращений.
- Улучшен язык-переключатель в шапке (кастомный dropdown).

---

## 13) Рекомендации по развитию

- Добавить ответы админа пользователю (диалог/чат).
- Добавить уведомления о новых обращениях для админа.
- Вынести оставшиеся жестко заданные строки в централизованный i18n-слой.
- Добавить автотесты для критичных API-эндпоинтов (`auth`, `checkout`, `support`).
