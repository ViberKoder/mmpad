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
          // Читаем файл чтобы проверить экспорты
          try {
            const content = fs.readFileSync(entry.path, 'utf8');
            const hasBclSDK = content.includes('BclSDK') || content.includes('export.*BclSDK');
            const hasSimpleTonapi = content.includes('simpleTonapiProvider') || content.includes('export.*simpleTonapiProvider');
            console.log(`   Exports check: BclSDK=${hasBclSDK}, simpleTonapiProvider=${hasSimpleTonapi}`);
          } catch (e) {
            console.log(`   Could not read file: ${e.message}`);
          }
          break;
        }
      }
      
      // Если не нашли entry point, проверяем что есть в src
      if (!foundEntry && fs.existsSync(srcPath)) {
        const srcFiles = fs.readdirSync(srcPath);
        console.log(`📁 Files in src/: ${srcFiles.join(', ')}`);
        
        // Ищем файлы с BclSDK
        const bclSdkFiles = srcFiles.filter(f => f.toLowerCase().includes('bcl') || f.toLowerCase().includes('sdk'));
        if (bclSdkFiles.length > 0) {
          console.log(`📦 Found SDK files: ${bclSdkFiles.join(', ')}`);
        }
      }
    
    if (!foundEntry) {
      // Если ничего не найдено, проверяем что есть в пакете
      let files = [];
      let dirs = [];
      let tsFiles = [];
      let jsFiles = [];
      
      try {
        files = fs.readdirSync(sdkPath, { withFileTypes: true });
        dirs = files.filter(f => f.isDirectory()).map(d => d.name);
        tsFiles = files.filter(f => f.isFile() && f.name.endsWith('.ts')).map(f => f.name);
        jsFiles = files.filter(f => f.isFile() && f.name.endsWith('.js')).map(f => f.name);
      } catch (e) {
        console.warn('⚠️  Could not read package directory:', e.message);
      }
      
      console.log('📁 Package structure:', { dirs, tsFiles, jsFiles });
      
      // Проверяем все подпапки на наличие файлов
      for (const dir of dirs) {
        const dirPath = path.join(sdkPath, dir);
        try {
          const dirFiles = fs.readdirSync(dirPath);
          console.log(`📂 Files in ${dir}/: ${dirFiles.slice(0, 10).join(', ')}${dirFiles.length > 10 ? '...' : ''}`);
          
          // Ищем index файлы в подпапках
          if (dirFiles.some(f => f.includes('index'))) {
            const indexFile = dirFiles.find(f => f.includes('index'));
            const ext = indexFile.endsWith('.ts') ? '.ts' : '.js';
            const entryPath = path.join(dirPath, `index${ext}`);
            if (fs.existsSync(entryPath)) {
              foundEntry = `./${dir}/index${ext}`;
              console.log(`✅ Found entry in ${dir}/: ${foundEntry}`);
              break;
            }
          }
        } catch (e) {
          // Игнорируем ошибки чтения подпапок
        }
      }
      
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
        // Если нашли файл, читаем его чтобы понять структуру экспортов
        let wrapperContent = '';
        if (importPath) {
          // Просто реэкспортируем все из найденного пути
          wrapperContent = `// Auto-generated wrapper
export * from '${importPath}';
`;
        } else {
          // Пробуем найти файлы в разных местах
          const possibleDirs = ['src', 'lib', 'dist', 'build'];
          let foundDir = null;
          
          for (const dir of possibleDirs) {
            const dirPath = path.join(sdkPath, dir);
            if (fs.existsSync(dirPath)) {
              try {
                const dirFiles = fs.readdirSync(dirPath).filter(f => (f.endsWith('.ts') || f.endsWith('.js')) && !f.endsWith('.d.ts'));
                if (dirFiles.length > 0) {
                  foundDir = dir;
                  console.log(`📦 Found files in ${dir}/: ${dirFiles.slice(0, 5).join(', ')}${dirFiles.length > 5 ? '...' : ''}`);
                  
                  // Если есть index файл, используем его
                  const indexFile = dirFiles.find(f => f.includes('index'));
                  if (indexFile) {
                    const name = indexFile.replace(/\.(ts|js)$/, '');
                    wrapperContent = `// Auto-generated wrapper
export * from './${dir}/${name}';
`;
                    break;
                  } else {
                    // Экспортируем из всех файлов
                    const exports = dirFiles.map(f => {
                      const name = f.replace(/\.(ts|js)$/, '');
                      return `export * from './${dir}/${name}';`;
                    }).join('\n');
                    wrapperContent = `// Auto-generated wrapper
${exports}
`;
                    break;
                  }
                }
              } catch (e) {
                // Игнорируем ошибки
              }
            }
          }
          
          if (!wrapperContent) {
            // Если ничего не найдено, создаем пустой экспорт
            wrapperContent = `// Auto-generated wrapper - no source files found
// This package may need to be built first
export {};
`;
            console.warn('⚠️  No source files found, created empty export');
          }
        }
        
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
    
    // Если entry point - это корневой index.ts, который мы создали, убедимся что он существует и правильный
    if (foundEntry === './index.ts') {
      const indexPath = path.join(sdkPath, 'index.ts');
      let needsUpdate = true;
      
      if (fs.existsSync(indexPath)) {
        // Проверяем содержимое существующего файла
        try {
          const existingContent = fs.readFileSync(indexPath, 'utf8');
          if (existingContent.includes('export') && existingContent.includes('BclSDK')) {
            needsUpdate = false;
            console.log('✅ Existing index.ts looks good');
          }
        } catch (e) {
          // Игнорируем ошибки чтения
        }
      }
      
      if (needsUpdate) {
        // Определяем лучший путь для импорта, проверяя все возможные места
        let importPath = null;
        const possibleDirs = ['src', 'lib', 'dist', 'build'];
        
        for (const dir of possibleDirs) {
          const dirPath = path.join(sdkPath, dir);
          if (fs.existsSync(dirPath)) {
            try {
              const dirFiles = fs.readdirSync(dirPath).filter(f => (f.endsWith('.ts') || f.endsWith('.js')) && !f.endsWith('.d.ts'));
              if (dirFiles.length > 0) {
                // Если есть index файл, используем его
                const indexFile = dirFiles.find(f => f.includes('index'));
                if (indexFile) {
                  const name = indexFile.replace(/\.(ts|js)$/, '');
                  importPath = `./${dir}/${name}`;
                  console.log(`📦 Found index in ${dir}/: ${importPath}`);
                  break;
                } else {
                  // Используем первый файл
                  const firstFile = dirFiles[0];
                  const name = firstFile.replace(/\.(ts|js)$/, '');
                  importPath = `./${dir}/${name}`;
                  console.log(`📦 Using first file from ${dir}/: ${importPath}`);
                  break;
                }
              }
            } catch (e) {
              // Игнорируем ошибки
            }
          }
        }
        
        let wrapperContent = '';
        if (importPath) {
          wrapperContent = `// Auto-generated wrapper
export * from '${importPath}';
`;
        } else {
          // Если ничего не найдено, создаем пустой экспорт
          wrapperContent = `// Auto-generated wrapper - no source files found
// This package may need to be built first
export {};
`;
          console.warn('⚠️  No source files found for wrapper, created empty export');
        }
        
        fs.writeFileSync(indexPath, wrapperContent);
        console.log(`✅ Created/updated index.ts wrapper${importPath ? ` importing from ${importPath}` : ' (empty)'}`);
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
