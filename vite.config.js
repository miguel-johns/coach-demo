import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
    watch: {
      // The platform periodically rewrites .env.development.local, and Vite
      // restarts the dev server on every env-file change. Those restarts drop
      // the HMR websocket, which makes the preview show "server connection
      // lost / polling for restart" and appear stuck. Ignore env files in the
      // watcher so the server stays up (env vars are still loaded at startup).
      ignored: ['**/.env', '**/.env.*'],
    },
  },
})
