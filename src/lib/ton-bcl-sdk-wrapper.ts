// Wrapper для ton-bcl-sdk, чтобы обойти проблемы с разрешением модуля
// Импортируем напрямую из исходников пакета

// @ts-ignore - игнорируем ошибки типов для динамического импорта
export async function loadBclSDK() {
  try {
    // Пробуем импортировать из установленного пакета
    const sdkModule = await import('ton-bcl-sdk');
    return sdkModule;
  } catch (error) {
    console.warn('Failed to import ton-bcl-sdk, trying alternative path:', error);
    // Если не получилось, пробуем альтернативные пути
    try {
      const sdkModule = await import('../../node_modules/ton-bcl-sdk/src/index.ts');
      return sdkModule;
    } catch (error2) {
      console.error('Failed to import ton-bcl-sdk from alternative path:', error2);
      throw new Error('Could not load ton-bcl-sdk');
    }
  }
}

// Экспортируем типы и функции, которые мы используем
export type { BclSDK } from '../types/ton-bcl-sdk';
export { BclSDK } from '../types/ton-bcl-sdk';
