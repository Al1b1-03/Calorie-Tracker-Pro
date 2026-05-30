FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY database ./database
COPY scripts ./scripts

RUN mkdir -p /app/uploads/products /app/uploads/scans

ENV NODE_ENV=production
EXPOSE 3003

CMD ["node", "src/index.js"]
