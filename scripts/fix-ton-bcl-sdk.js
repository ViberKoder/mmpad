import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sdkPath = path.join(__dirname, '../node_modules/ton-bcl-sdk');
const packageJsonPath = path.join(sdkPath, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Устанавливаем правильные точки входа
    if (!packageJson.main && !packageJson.module && !packageJson.exports) {
      // Проверяем, какие файлы есть в пакете
      const srcPath = path.join(sdkPath, 'src');
      const distPath = path.join(sdkPath, 'dist');
      
      // Проверяем структуру пакета
      const possibleEntries = [
        { path: path.join(srcPath, 'index.ts'), value: './src/index.ts' },
        { path: path.join(srcPath, 'index.js'), value: './src/index.js' },
        { path: path.join(distPath, 'index.js'), value: './dist/index.js' },
        { path: path.join(sdkPath, 'index.ts'), value: './index.ts' },
        { path: path.join(sdkPath, 'index.js'), value: './index.js' },
        { path: path.join(sdkPath, 'lib', 'index.js'), value: './lib/index.js' },
        { path: path.join(sdkPath, 'build', 'index.js'), value: './build/index.js' }
      ];
      
      let foundEntry = null;
      for (const entry of possibleEntries) {
        if (fs.existsSync(entry.path)) {
          foundEntry = entry.value;
          break;
        }
      }
      
      if (foundEntry) {
        packageJson.main = foundEntry;
        packageJson.module = foundEntry;
        packageJson.types = foundEntry.replace(/\.js$/, '.d.ts').replace(/\.ts$/, '.d.ts');
      } else {
        // Если ничего не найдено, используем src/index.ts по умолчанию
        packageJson.main = './src/index.ts';
        packageJson.module = './src/index.ts';
        packageJson.types = './src/index.ts';
      }
      
      // Добавляем exports если его нет
      if (!packageJson.exports) {
        packageJson.exports = {
          ".": {
            "import": packageJson.module || packageJson.main,
            "require": packageJson.main,
            "types": packageJson.types
          }
        };
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('✅ Fixed ton-bcl-sdk package.json');
    }
  } catch (error) {
    console.warn('⚠️  Could not fix ton-bcl-sdk package.json:', error.message);
  }
} else {
  console.warn('⚠️  ton-bcl-sdk package.json not found');
}
