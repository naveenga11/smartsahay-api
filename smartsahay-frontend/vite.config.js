import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // The backend base URL — default to localhost if the env var is not set
  const backendUrl = env.VITE_API_URL || 'http://localhost:8080'

  return {
    plugins: [react()],

    server: {
      port: 5173,
      proxy: {
        // Every request from the browser to /api/* is forwarded to the backend.
        // This completely sidesteps CORS — the browser only ever talks to localhost:5173.
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          // rewrite: keep /api in the path — backend expects /smartsahay/api/*
          // but since VITE_API_URL includes /smartsahay we must NOT double-add it.
          // The proxy target is the ROOT of the backend server (e.g. http://192.168.1.10:8080)
          // and we rewrite /api → /smartsahay/api
          rewrite: (path) => path.replace(/^\/api/, '/smartsahay/api'),
        },
      },
    },
  }
})
