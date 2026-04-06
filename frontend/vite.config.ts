import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const ngrokHost = env.VITE_NGROK_URL || 'shadowed-adelyn-goosenecked.ngrok-free.dev';

  return {
    plugins: [react()],
    envDir: '../',
    server: {
      host: true,
      port: 5173,
      allowedHosts: [ngrokHost, 'localhost'],
      proxy: {
        '/api/static': {
          target: 'http://localhost:8000',
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      }
    }
  }
})
