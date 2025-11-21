import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api/places': {
        target: 'http://host.docker.internal:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/places/, '')
      },
      '/api/tiles': {
        target: 'http://host.docker.internal:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tiles/, '')
      }
    }
  }
})
