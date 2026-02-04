import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/8d-platform-mock-ui/', // GitHub Pages 路徑（之後可依實際 repo 名稱調整）
})
