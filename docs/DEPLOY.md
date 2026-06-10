# Единая схема: Docker + Render + Vercel

Один проект, три среды, **один API и одна БД** (при настройке cloud).

```
┌─────────────────────────────────────────────────────────────┐
│  Локально (Docker)                                          │
│  diplomka-db (postgres:16) ← diplomka-backend :3003         │
│         ↑                          ↑                        │
│         └──────── diplomka-frontend :5174                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Продакшен                                                  │
│  Vercel (React) ──► calorie-tracker-pro-1.onrender.com/api  │
│                           │                                 │
│                           ▼                                 │
│                    PostgreSQL (Render)                      │
└─────────────────────────────────────────────────────────────┘
```

## Быстрый старт — Docker (всё вместе)

```powershell
cd "C:\Users\dcchh\OneDrive\Desktop\Diplomka"
copy .env.example .env
npm run docker:up
npm run docker:add-admin
```

| Сервис | Контейнер | URL |
|--------|-----------|-----|
| БД | `diplomka-db` | `localhost:5433` |
| API | `diplomka-backend` | http://localhost:3003/api |
| Сайт | `diplomka-frontend` | http://localhost:5174 |

Админ: `alibi.maksat@narxoz.kz` / `123456`

```powershell
npm run docker:down      # остановить
npm run docker:reset     # остановить + удалить БД
npm run docker:logs      # логи
```

## Одна БД: Docker + Render + Vercel

1. Render: PostgreSQL **Connect** → Web Service `calorie-tracker-pro-1`.
2. В корневой `.env`:

```env
JWT_SECRET=<тот же, что на Render>
RENDER_DATABASE_URL=<Internal Database URL из Render>
```

3. Запуск:

```powershell
npm run docker:cloud
npm run docker:add-admin
```

Локальный Docker использует **облачную** PostgreSQL — те же пользователи, что на Vercel.

## Render (бэкенд)

URL: https://calorie-tracker-pro-1.onrender.com

| Переменная | Значение |
|------------|----------|
| `DATABASE_URL` | из PostgreSQL (Connect) |
| `DATABASE_SSL` | `true` |
| `JWT_SECRET` | как в `.env` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Vercel URLs + `http://localhost:5174` |

Shell: `node scripts/add-admin.js`

## Vercel (фронт)

**Root Directory:** `Front end`

| Переменная | Value |
|------------|--------|
| `VITE_API_URL` | `https://calorie-tracker-pro-1.onrender.com/api` |

Redeploy после изменений.

## Проверка

```powershell
npm run health
Invoke-RestMethod https://calorie-tracker-pro-1.onrender.com/api/health
```

`database: true` — БД подключена.
