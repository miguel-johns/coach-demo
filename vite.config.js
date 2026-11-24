import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { Readable } from 'node:stream'

/*
 * Serves api/*.js in development the same way Vercel does in production:
 * each file exports POST(request) and returns a web Response.
 */
function devApi() {
  return {
    name: 'milton-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = req.url?.split('?')[0]
        if (route !== '/api/chat' || req.method !== 'POST') return next()
        try {
          // Re-read env each request: the workspace refreshes the gateway token in this file.
          Object.assign(process.env, loadEnv('development', process.cwd(), ''))
          const mod = await server.ssrLoadModule('/api/chat.js')
          const chunks = []
          for await (const c of req) chunks.push(c)
          const request = new Request(`http://localhost${req.url}`, {
            method: 'POST',
            headers: req.headers,
            body: Buffer.concat(chunks),
          })
          const response = await mod.POST(request)
          res.statusCode = response.status
          response.headers.forEach((v, k) => res.setHeader(k, v))
          if (response.body) Readable.fromWeb(response.body).pipe(res)
          else res.end()
        } catch (e) {
          server.config.logger.error(`[api/chat] ${e.stack || e.message}`)
          res.statusCode = 500
          res.end('Milton could not answer.')
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), devApi()],
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
