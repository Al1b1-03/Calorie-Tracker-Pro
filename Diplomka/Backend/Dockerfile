# Backend API (Node, Express, PostgreSQL client)
FROM node:20-alpine

WORKDIR /app

# Зависимости
COPY package.json ./
RUN npm install --omit=dev

# Исходники, миграции и скрипты (сиды)
COPY src ./src
COPY database ./database
COPY scripts ./scripts

# Папка для загрузок (создаётся при старте, volume монтируется в docker-compose)
RUN mkdir -p /app/uploads/products

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "src/index.js"]
