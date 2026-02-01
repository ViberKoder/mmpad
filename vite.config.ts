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
    rollupOptions: {
      external: (id) => {
        // Не исключаем ton-bcl-sdk, но настраиваем его обработку
        return false
      }
    },
    commonjsOptions: {
      include: [/ton-bcl-sdk/, /node_modules/],
      transformMixedEsModules: true,
      defaultIsModuleExports: true
    }
  },
  resolve: {
    dedupe: ['ton-bcl-sdk']
  },
  optimizeDeps: {
    include: ['ton-bcl-sdk'],
    esbuildOptions: {
      resolveExtensions: ['.ts', '.tsx', '.js', '.jsx']
    }
  }
})
