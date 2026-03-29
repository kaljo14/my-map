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
      include: ['maplibre-gl', '@deck.gl/core', '@deck.gl/layers', '@deck.gl/mapbox', 'supercluster'],
    },
    server: {
      port: 8888,
      proxy: {
        '/api/places': {
          target: process.env.PLACES_API_URL || env.PLACES_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/tiles': {
          target: process.env.TILES_API_URL || env.TILES_API_URL || 'http://localhost:4000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/tiles/, ''),
        },
        '/api/metro': {
          target: process.env.PLACES_API_URL || env.PLACES_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/heatmap': {
          target: process.env.PLACES_API_URL || env.PLACES_API_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
        '/api/martin': {
          target: process.env.MARTIN_API_URL || env.MARTIN_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/martin/, ''),
        }
      }
    }
  }
})
