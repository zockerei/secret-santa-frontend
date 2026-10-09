import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
