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
  optimizeDeps: {
    include: [
      'leaflet',
      'leaflet.markercluster',
      'leaflet.vectorgrid',
      '@vue-leaflet/vue-leaflet',
    ]
  },
  server: {
    port: 8888,
    proxy: {
      '/api/places': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/tiles': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tiles/, ''),
      }
    }
  }
})
