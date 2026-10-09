import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: 3000,
    host: true,
    // Like nginx in production: /api goes to the backend, without the /api prefix
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    // three.js makes the music page big, but it is only loaded when that page is opened
    chunkSizeWarningLimit: 600
  }
})
