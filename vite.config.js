import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Ép đóng gói toàn bộ code vào 1 file duy nhất
        manualChunks: () => 'app'
      }
    }
  }
})
