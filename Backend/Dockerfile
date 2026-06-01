FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates libgomp1 \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY database ./database
COPY scripts ./scripts

RUN mkdir -p /app/uploads/products /app/uploads/scans

ENV NODE_ENV=production
ENV HF_HOME=/app/.cache/huggingface
ENV TRANSFORMERS_CACHE=/app/.cache/huggingface
ENV NODE_OPTIONS=--max-old-space-size=2048

# Pre-download CLIP model into the image (avoids broken runtime downloads)
RUN node --input-type=module -e "\
import { pipeline, env } from '@xenova/transformers'; \
env.cacheDir = '/app/.cache/huggingface'; \
const model = process.env.VISION_LOCAL_MODEL || 'Xenova/clip-vit-base-patch16'; \
console.log('[vision] Caching model:', model); \
await pipeline('zero-shot-image-classification', model); \
console.log('[vision] Model cached');"

EXPOSE 3003

CMD ["node", "src/index.js"]
