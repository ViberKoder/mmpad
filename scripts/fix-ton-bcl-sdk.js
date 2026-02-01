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
        // Определяем, откуда импортировать - проверяем все возможные места
        let importPath = null;
        const possibleSources = [
          { path: path.join(sdkPath, 'src', 'index.ts'), import: './src/index' },
          { path: path.join(sdkPath, 'src', 'index.js'), import: './src/index' },
          { path: path.join(sdkPath, 'src', 'BclSDK.ts'), import: './src/BclSDK' },
          { path: path.join(sdkPath, 'src', 'BclSDK.js'), import: './src/BclSDK' },
          { path: path.join(sdkPath, 'lib', 'index.js'), import: './lib/index' },
          { path: path.join(sdkPath, 'dist', 'index.js'), import: './dist/index' },
        ];
        
        for (const source of possibleSources) {
          if (fs.existsSync(source.path)) {
            importPath = source.import;
            console.log(`📦 Found source file: ${source.path}`);
            break;
          }
        }
        
        // Если нашли файл, создаем wrapper с реэкспортом
        // Если нет, создаем базовый экспорт с типами
        const wrapperContent = importPath 
          ? `// Auto-generated wrapper
export * from '${importPath}';
export { default } from '${importPath}';
`
          : `// Auto-generated wrapper
// Re-export common exports that might exist
export * from './src';
`;
        fs.writeFileSync(indexPath, wrapperContent);
        foundEntry = './index.ts';
        console.log(`✅ Created root index.ts wrapper${importPath ? ` importing from ${importPath}` : ' (fallback)'}`);
      }
    }
    
    // Устанавливаем точки входа
    packageJson.main = foundEntry;
    packageJson.module = foundEntry;
    const typesPath = foundEntry.replace(/\.js$/, '.d.ts').replace(/\.ts$/, '.d.ts');
    packageJson.types = typesPath;
    
    // Добавляем/обновляем exports
    packageJson.exports = {
      ".": {
        "import": packageJson.module,
        "require": packageJson.main,
        "types": packageJson.types
      },
      "./*": "./*"
    };
    
    // Если entry point - это корневой index.ts, который мы создали, убедимся что он существует
    if (foundEntry === './index.ts') {
      const indexPath = path.join(sdkPath, 'index.ts');
      if (!fs.existsSync(indexPath)) {
        // Создаем wrapper если его еще нет
        const srcIndexPath = path.join(sdkPath, 'src', 'index.ts');
        const srcIndexJsPath = path.join(sdkPath, 'src', 'index.js');
        const importPath = fs.existsSync(srcIndexPath) ? './src/index' 
          : fs.existsSync(srcIndexJsPath) ? './src/index'
          : './src';
        
        const wrapperContent = `// Auto-generated wrapper
export * from '${importPath}';
`;
        fs.writeFileSync(indexPath, wrapperContent);
        console.log(`✅ Created/updated index.ts wrapper importing from ${importPath}`);
      }
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Fixed ton-bcl-sdk package.json with entry:', foundEntry);
  } catch (error) {
    console.warn('⚠️  Could not fix ton-bcl-sdk package.json:', error.message);
    console.error(error);
  }
} else {
  console.warn('⚠️  ton-bcl-sdk package.json not found at:', packageJsonPath);
}
