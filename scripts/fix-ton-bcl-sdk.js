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
    
    // Всегда обновляем точки входа для надежности
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
        console.log(`✅ Found entry point: ${entry.path} -> ${entry.value}`);
        break;
      }
    }
    
    if (!foundEntry) {
      // Если ничего не найдено, проверяем что есть в пакете
      const files = fs.readdirSync(sdkPath, { withFileTypes: true });
      const dirs = files.filter(f => f.isDirectory()).map(d => d.name);
      const tsFiles = files.filter(f => f.isFile() && f.name.endsWith('.ts')).map(f => f.name);
      const jsFiles = files.filter(f => f.isFile() && f.name.endsWith('.js')).map(f => f.name);
      
      console.log('📁 Package structure:', { dirs, tsFiles, jsFiles });
      
      // Пробуем найти index в src
      if (fs.existsSync(srcPath)) {
        const srcFiles = fs.readdirSync(srcPath);
        if (srcFiles.some(f => f.includes('index'))) {
          foundEntry = './src/index.ts';
          console.log('✅ Using src/index.ts');
        } else if (srcFiles.length > 0) {
          // Если есть другие файлы, создаем index.ts который экспортирует все
          const indexPath = path.join(srcPath, 'index.ts');
          const exports = srcFiles
            .filter(f => f.endsWith('.ts') && !f.endsWith('.d.ts'))
            .map(f => `export * from './${f.replace(/\.ts$/, '')}';`)
            .join('\n');
          fs.writeFileSync(indexPath, exports || 'export {};');
          foundEntry = './src/index.ts';
          console.log('✅ Created src/index.ts wrapper');
        }
      }
      
      // Если все еще не найдено, создаем корневой index.ts
      if (!foundEntry) {
        const indexPath = path.join(sdkPath, 'index.ts');
        // Создаем минимальный index.ts который пытается импортировать из src
        // Используем условный экспорт через реэкспорт
        const wrapperContent = `// Auto-generated wrapper
// Try to export from src/index first
export * from './src/index';
`;
        fs.writeFileSync(indexPath, wrapperContent);
        foundEntry = './index.ts';
        console.log('✅ Created root index.ts wrapper');
      }
    }
    
    // Устанавливаем точки входа
    packageJson.main = foundEntry;
    packageJson.module = foundEntry;
    packageJson.types = foundEntry.replace(/\.js$/, '.d.ts').replace(/\.ts$/, '.d.ts');
    
    // Добавляем/обновляем exports
    packageJson.exports = {
      ".": {
        "import": packageJson.module,
        "require": packageJson.main,
        "types": packageJson.types
      }
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Fixed ton-bcl-sdk package.json with entry:', foundEntry);
  } catch (error) {
    console.warn('⚠️  Could not fix ton-bcl-sdk package.json:', error.message);
    console.error(error);
  }
} else {
  console.warn('⚠️  ton-bcl-sdk package.json not found at:', packageJsonPath);
}
