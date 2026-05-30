# Front end — режим разработки (Vite dev server с proxy на backend)
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Порт Vite dev server; proxy на backend задаётся через VITE_PROXY_TARGET в docker-compose
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
