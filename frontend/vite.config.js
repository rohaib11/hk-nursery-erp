import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    // Allow the ngrok host
    allowedHosts: [
      'feed-symphony-unsettled.ngrok-free.dev',
      // If the ngrok URL changes, you can also allow all ngrok-free.dev subdomains:
      '.ngrok-free.dev'   // <-- allows any *.ngrok-free.dev host
    ]
  }
})