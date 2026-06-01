# Единый деплой: Vercel + Render + localhost

Один **бэкенд** и одна **база PostgreSQL** на Render.  
Фронтенд на **Vercel** и локально только обращается к этому API.

| Среда | Что запускается | API |
|--------|------------------|-----|
| **Прод (Vercel)** | Статика React | `https://calorie-tracker-pro.onrender.com/api` |
| **Прод (Render)** | Node + PostgreSQL | тот же сервис |
| **Локально** | `npm run dev` во Front end | Render API или proxy на localhost |

---

## 1. Render (бэкенд + БД)

Сервис: https://calorie-tracker-pro.onrender.com  
PostgreSQL: привязать к Web Service (Internal/External `DATABASE_URL`).

### Сборка Docker (важно)

Репозиторий — **монорепо**: `Dockerfile` лежит в **корне** (`/Dockerfile`), не в `Backend/`.

В Render Dashboard → Web Service → **Settings**:

| Поле | Значение |
|------|----------|
| **Root Directory** | *(пусто — корень репо)* |
| **Dockerfile Path** | `Dockerfile` |
| **Docker Context** | `.` |

Альтернатива: Root Directory = `Backend`, Dockerfile = `Dockerfile` (тогда используется `Backend/Dockerfile`).

Ошибка `open Dockerfile: no such file or directory` — Root Directory пустой, а Dockerfile только в `Backend/`. Запушьте корневой `Dockerfile` или укажите Root Directory = `Backend`.

### Переменные окружения (Render → Environment)

| Переменная | Значение |
|------------|----------|
| `NODE_ENV` | `production` |
| `PORT` | `3003` |
| `DATABASE_URL` | из вкладки PostgreSQL → **External Database URL** |
| `DATABASE_SSL` | `true` |
| `JWT_SECRET` | одна длинная случайная строка (сохраните!) |
| `FRONTEND_URL` | см. ниже |

**FRONTEND_URL** (через запятую, без пробелов вокруг URL):

```
https://calorie-tracker-pro-smg1.vercel.app,https://calorie-tracker-pro-smg1-git-main-al1b1-03s-projects.vercel.app,https://calorie-tracker-pro-smg1-qfa2i606k-al1b1-03s-projects.vercel.app,http://localhost:5173
```

После деплоя в **Shell** Render:

```bash
node scripts/add-admin.js
```

Админ: `alibi.maksat@narxoz.kz` / `123456`

Проверка: https://calorie-tracker-pro.onrender.com/api/health

---

## 2. Vercel (фронтенд)

**Root Directory:** `Front end`

### Переменные (Vercel → Settings → Environment Variables)

| Имя | Value | Environments |
|-----|--------|----------------|
| `VITE_API_URL` | `https://calorie-tracker-pro.onrender.com/api` | Production, Preview, Development |

Пересоберите проект после изменения env (**Deployments → Redeploy**).

---

## 3. Локальная разработка (та же БД, что на Render)

### Вариант A — только фронт (проще)

`Front end/.env.development`:

```env
VITE_API_URL=https://calorie-tracker-pro.onrender.com/api
```

```powershell
cd "Front end"
npm install
npm run dev
```

Откройте http://localhost:5173 — данные с облачной БД.

### Вариант B — локальный бэкенд + облачная БД

`Backend/.env` (скопируйте с Render):

```env
PORT=3003
NODE_ENV=development
DATABASE_URL=<External Database URL из Render>
DATABASE_SSL=true
JWT_SECRET=<тот же, что на Render>
FRONTEND_URL=http://localhost:5173
```

`Front end/.env.development`:

```env
VITE_API_URL=http://localhost:3003/api
```

```powershell
cd Backend
npm install
npm run dev

cd "Front end"
npm run dev
```

**Важно:** `JWT_SECRET` и `DATABASE_URL` должны совпадать с Render, иначе вход и данные «разъедутся».

### Вариант C — полностью локально (Docker)

Только для офлайн; **не** общая с продом БД:

```powershell
cd Backend
npm run docker:local
npm run docker:add-admin
```

---

## 4. Частые ошибки

| Симптом | Причина | Решение |
|---------|---------|---------|
| CORS в браузере | Старый бэкенд / нет FRONTEND_URL | Обновить Render, любой `*.vercel.app` уже разрешён в коде |
| «Неверный пароль» на проде, локально ок | Разные БД | В `.env` указать Render `DATABASE_URL` или фронт на Render API |
| 401 после входа | Разный `JWT_SECRET` | Один секрет на Render и в локальном Backend |
| Старый API `food-backend-...` | Устаревший `VITE_API_URL` | Заменить на `calorie-tracker-pro.onrender.com` |
| Пустые картинки на Render | Диск эфемерный | Загрузки пропадают после рестарта — для диплома нормально |

---

## 5. Проверка «всё одно целое»

```powershell
Invoke-RestMethod https://calorie-tracker-pro.onrender.com/api/health
```

В браузере на Vercel: F12 → Network → запросы идут на `calorie-tracker-pro.onrender.com`, не на `localhost`.
