# Запуск проекта через Docker

Запуск всего стека (PostgreSQL, Backend, Frontend) одной командой.

## Требования

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (или Docker Engine + Docker Compose)
- Запуск из папки, где находятся папки `Backend` и `Front end` (например `Diplomka\Diplomka`)

## Команды

```bash
# Сборка и запуск (первый раз или после изменений)
docker compose up --build

# Запуск в фоне
docker compose up --build -d

# Остановка
docker compose down

# Остановка и удаление данных БД
docker compose down -v
```

## Порты

| Сервис    | Порт  | URL                    |
|-----------|-------|------------------------|
| Frontend  | 5173  | http://localhost:5173  |
| Backend   | 3003  | http://localhost:3003/api |
| PostgreSQL| 5433 (на хосте) | localhost:5433         |

## Переменные окружения

В `docker-compose.yml` заданы значения по умолчанию. При необходимости создайте файл `.env` **в той же папке, где лежит docker-compose.yml**:

```env
# Секрет для JWT (обязательно смените в production)
JWT_SECRET=your-super-secret-key
```

## Данные

- **БД:** данные PostgreSQL хранятся в Docker-томе `pgdata`. После `docker compose down -v` том удаляется.
- **Загрузки (фото товаров):** том `backend_uploads`. Чтобы сохранить их между пересозданиями контейнеров, том не удаляется при `down`.

## Загрузка тестовых продуктов

После первого запуска БД пустая. Чтобы загрузить тестовый каталог продуктов:

**Вариант 1 — через Docker:**
```bash
docker compose exec backend npm run seed
```

**Вариант 2 — локально** (если БД доступна на `localhost:5433`, например из Docker):
```bash
cd Backend
set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/calorie_tracker
npm run seed
```

Данные берутся из `Backend/database/seed-products.json`. Свои продукты можно подставить в этот JSON и снова запустить `npm run seed` (дубликаты по названию не добавляются).

---

## Устранение проблем

- **«Не удалось подключиться к серверу»** — подождите 10–20 секунд после `up`: сначала поднимается БД, затем backend выполняет миграции.
- **Порт занят** — если 5173, 3003 или 5433 уже используются, измените маппинг в `docker-compose.yml` (например `"5174:5173"`). PostgreSQL в контейнере проброшен на хост как **5433**, чтобы не конфликтовать с локальной установкой PostgreSQL (порт 5432).
- **Пересборка после изменений кода:** `docker compose up --build`.
