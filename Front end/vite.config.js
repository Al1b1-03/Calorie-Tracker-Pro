/**
 * ФАЙЛ: vite.config.js
 * ЧТО ЭТО: Конфигурация Vite.
 * ЗА ЧТО ОТВЕЧАЕТ: dev-сервер :5173, proxy /api на backend :3003.
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
})
