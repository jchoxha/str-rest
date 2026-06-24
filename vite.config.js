import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Absolute base (the repo subpath on GitHub Pages). Required so client-side
  // routes with deep links resolve assets correctly. Paired with the SPA
  // fallback in public/404.html + index.html.
  base: '/str-rest/',
})
