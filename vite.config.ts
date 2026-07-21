import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  envPrefix: ['VITE_', 'TURNSTILE_SITE_KEY', 'CONTACT_API_URL'],
})
