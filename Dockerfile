# Render: сборка из корня репозитория. CACHE_BUST меняйте при деплое, если слои закешировались.
FROM node:20-bookworm-slim

ARG CACHE_BUST=4
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates libgomp1 \
  && rm -rf /var/lib/apt/lists/*

COPY Backend/package.json Backend/package-lock.json ./
RUN npm ci --omit=dev

COPY Backend/src ./src
COPY Backend/database ./database
COPY Backend/scripts ./scripts

RUN echo "cache_bust=${CACHE_BUST}" > /app/.build-id

RUN mkdir -p /app/uploads/products /app/uploads/scans

ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=512

EXPOSE 3003

CMD ["node", "src/index.js"]
