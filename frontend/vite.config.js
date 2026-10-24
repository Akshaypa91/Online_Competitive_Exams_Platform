import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Keep API requests same-origin in development so browser CORS and stale
// localhost API URLs cannot send requests to the macOS AirTunes service.
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3002,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
