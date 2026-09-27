import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/formsubmit': {
        target: 'https://formsubmit.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/formsubmit/, ''),
        headers: {
          Referer: 'https://formsubmit.co/'
        }
      }
    }
  }
})
