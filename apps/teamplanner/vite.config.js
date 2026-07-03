import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served under /teamplanner via apps/main's rewrite (multi-zone setup, see
// apps/main/next.config.js). base keeps this app's own asset URLs prefixed
// so they don't collide with apps/main's, same reasoning as apps/admin's basePath.
export default defineConfig({
  base: '/teamplanner/',
  plugins: [react()],
  server: {
    port: 3002,
    strictPort: true,
  },
})
