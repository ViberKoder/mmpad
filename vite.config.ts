import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

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
      include: [/ton-bcl-sdk/, /node_modules/],
      transformMixedEsModules: true
    }
  },
  resolve: {
    alias: {
      'ton-bcl-sdk': resolve(__dirname, 'node_modules/ton-bcl-sdk/src/index.ts')
    }
  },
  optimizeDeps: {
    include: ['ton-bcl-sdk'],
    exclude: []
  }
})
