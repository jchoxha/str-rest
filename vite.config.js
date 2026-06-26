import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Served at the apex (custom domain str.rest), so base is root. Paired with
  // the SPA fallback in public/404.html + index.html.
  base: '/',
})
