# Calorie Tracker Pro — Backend

Express.js + PostgreSQL API.

## Запуск через Docker (рекомендуется)

Нужны: [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows).

```powershell
cd "C:\Users\dcchh\OneDrive\Desktop\Diplomka\Diplomka\Diplomka\Backend"
docker compose up -d --build
```

Или через npm:

```powershell
npm run docker:up
```

- **API:** http://localhost:3003/api/health  
- **Postgres с хоста:** `localhost:5433` — `postgres` / `postgres`, БД `calorie_tracker`  
- Миграции выполняются автоматически при старте бэкенда.

### Полезные команды

| Команда | Описание |
|---------|----------|
| `npm run docker:up` | Собрать и запустить в фоне |
| `npm run docker:dev` | Dev-режим с автоперезагрузкой (`node --watch`) |
| `npm run docker:logs` | Логи бэкенда |
| `npm run docker:down` | Остановить контейнеры |
| `npm run docker:reset` | Остановить и удалить volumes (БД и uploads) |

### Переменные окружения

Скопируйте `.env.example` → `.env` — Docker подхватит ключи (`JWT_SECRET`, `OPENAI_API_KEY` и т.д.).

`DATABASE_URL` в `.env` для Docker **не обязателен**: в контейнере используется внутренний адрес `db:5432`.

### Админ после первого запуска

```powershell
docker compose exec backend node scripts/add-admin.js
```

---

## Локальный запуск без Docker

```powershell
npm install
copy .env.example .env
npm run dev
```

Если Postgres уже поднят через Docker (`docker compose up -d db`), в `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/calorie_tracker
PORT=3003
```

---

## API

### Регистрация
`POST /api/auth/register`

```json
{
  "firstName": "Иван",
  "lastName": "Иванов",
  "phone": "+79001234567",
  "email": "user@example.com",
  "password": "password123"
}
```

### Вход
`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Профиль (требуется токен)
`GET /api/auth/profile` — Header: `Authorization: Bearer <token>`
