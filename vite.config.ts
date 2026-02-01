import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import fs from 'fs'

// Плагин для обработки ton-bcl-sdk
function tonBclSdkPlugin(): Plugin {
  return {
    name: 'ton-bcl-sdk-resolver',
    resolveId(id) {
      if (id === 'ton-bcl-sdk') {
        // Пробуем разные пути, начиная с корневого index.ts
        const possiblePaths = [
          resolve(__dirname, 'node_modules/ton-bcl-sdk/index.ts'),
          resolve(__dirname, 'node_modules/ton-bcl-sdk/index.js'),
          resolve(__dirname, 'node_modules/ton-bcl-sdk/src/index.ts'),
          resolve(__dirname, 'node_modules/ton-bcl-sdk/src/index.js'),
          resolve(__dirname, 'node_modules/ton-bcl-sdk/src/BclSDK.ts'),
          resolve(__dirname, 'node_modules/ton-bcl-sdk/dist/index.js'),
        ];
        
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            console.log(`[ton-bcl-sdk-resolver] Found: ${p}`);
            return p;
          }
        }
        
        // Если ничего не найдено, возвращаем корневой index.ts (он должен быть создан postinstall)
        const indexPath = resolve(__dirname, 'node_modules/ton-bcl-sdk/index.ts');
        console.log(`[ton-bcl-sdk-resolver] Using: ${indexPath}`);
        return indexPath;
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [react(), tonBclSdkPlugin()],
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
      'ton-bcl-sdk': resolve(__dirname, 'node_modules/ton-bcl-sdk/index.ts')
    }
  },
  optimizeDeps: {
    exclude: ['ton-bcl-sdk']
  }
})
