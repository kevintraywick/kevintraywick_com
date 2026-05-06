import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Serve static sub-apps from public/ without being caught by the SPA fallback
const staticSubApps = ['basher', 'fast-french', 'justedit', 'houdini', 'cc', 'k', 'blackmoor', 'ff', 'windy', 'cs1', 'cs2']

function staticSubAppMiddleware() {
  return {
    name: 'static-sub-app-middleware',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        const url = req.url?.split('?')[0] ?? ''
        const matched = staticSubApps.find(app => url === `/${app}` || url.startsWith(`/${app}/`))
        if (!matched) return next()

        // Normalize: /basher → /basher/index.html, /basher/foo.html → /basher/foo.html
        let filePath = url === `/${matched}` || url === `/${matched}/`
          ? `/${matched}/index.html`
          : url

        const absPath = path.join(__dirname, 'public', filePath)
        if (fs.existsSync(absPath) && fs.statSync(absPath).isFile()) {
          const ext = path.extname(absPath)
          const mimeTypes: Record<string, string> = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.svg': 'image/svg+xml',
          }
          res.setHeader('Content-Type', mimeTypes[ext] ?? 'application/octet-stream')
          fs.createReadStream(absPath).pipe(res)
        } else {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [staticSubAppMiddleware(), react(), tailwindcss()],
  base: '/',
})
