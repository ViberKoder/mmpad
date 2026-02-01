const fs = require('fs');
const path = require('path');

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
      
      if (fs.existsSync(path.join(srcPath, 'index.ts')) || fs.existsSync(path.join(srcPath, 'index.js'))) {
        packageJson.main = './src/index.ts';
        packageJson.module = './src/index.ts';
        packageJson.types = './src/index.ts';
      } else if (fs.existsSync(path.join(distPath, 'index.js'))) {
        packageJson.main = './dist/index.js';
        packageJson.module = './dist/index.js';
        packageJson.types = './dist/index.d.ts';
      } else if (fs.existsSync(path.join(sdkPath, 'index.ts')) || fs.existsSync(path.join(sdkPath, 'index.js'))) {
        packageJson.main = './index.ts';
        packageJson.module = './index.ts';
        packageJson.types = './index.ts';
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
