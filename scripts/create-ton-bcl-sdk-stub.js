import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sdkPath = path.join(__dirname, '../node_modules/ton-bcl-sdk');
const indexPath = path.join(sdkPath, 'index.ts');

// Создаем stub файл с базовыми экспортами
const stubContent = `// Auto-generated stub for ton-bcl-sdk
// This is a temporary stub until the package is properly set up

export class BclSDK {
  static create(config: any): BclSDK {
    throw new Error('ton-bcl-sdk is not properly installed. Please check the package installation.');
  }
  
  api: any;
  openCoin(address: any): any {
    throw new Error('ton-bcl-sdk is not properly installed.');
  }
  
  openUserCoinWallet(coinAddress: any, userAddress: any): Promise<any> {
    throw new Error('ton-bcl-sdk is not properly installed.');
  }
  
  deployCoin(sender: any, params: any, options?: any): Promise<void> {
    throw new Error('ton-bcl-sdk is not properly installed.');
  }
  
  getUserCoinBalance(coinAddress: any, userAddress: any): Promise<bigint> {
    throw new Error('ton-bcl-sdk is not properly installed.');
  }
  
  getCoinsForTons(coinAddress: any, tons: bigint): Promise<bigint> {
    throw new Error('ton-bcl-sdk is not properly installed.');
  }
  
  getTonsForCoins(coinAddress: any, coins: bigint): Promise<bigint> {
    throw new Error('ton-bcl-sdk is not properly installed.');
  }
}

export function simpleTonapiProvider(api: any): any {
  throw new Error('ton-bcl-sdk is not properly installed.');
}

export default BclSDK;
`;

// Создаем директорию если её нет
if (!fs.existsSync(sdkPath)) {
  fs.mkdirSync(sdkPath, { recursive: true });
}

fs.writeFileSync(indexPath, stubContent);
console.log('✅ Created ton-bcl-sdk stub file');
