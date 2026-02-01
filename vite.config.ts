import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      // Пробуем разные пути для ton-bcl-sdk
      'ton-bcl-sdk': new URL('./node_modules/ton-bcl-sdk/src/index.ts', import.meta.url).pathname
    }
  },
  optimizeDeps: {
    exclude: ['ton-bcl-sdk'] // Исключаем из предварительной оптимизации
  }
})
