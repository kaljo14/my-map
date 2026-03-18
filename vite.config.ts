import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '')

  return {
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
          target: env.PLACES_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/tiles': {
          target: env.TILES_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tiles/, ''),
        },
        '/api/metro': {
          target: env.PLACES_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/heatmap': {
          target: env.PLACES_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/martin': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/martin/, ''),
        }
      }
    }
  }
})
