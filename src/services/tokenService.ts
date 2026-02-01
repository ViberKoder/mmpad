import { BclSDK } from "ton-bcl-sdk";
import { Address, Sender } from "@ton/core";

export interface TokenInfo {
  address: Address;
  name: string;
  symbol: string;
  description?: string;
  imageUrl?: string;
  totalSupply?: bigint;
  price?: number;
}

export interface CreateTokenParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl: string;
  initialBuyAmount?: bigint;
}

export class TokenService {
  constructor(private sdk: BclSDK) {}

  async createToken(sender: Sender, params: CreateTokenParams): Promise<Address> {
    try {
      if (!sender.address) {
        throw new Error('Sender address is required');
      }

      await this.sdk.deployCoin(sender, {
        name: params.name,
        symbol: params.symbol,
        description: params.description,
        imageUrl: params.imageUrl,
      }, {
        firstBuy: params.initialBuyAmount ? {
          buyerAddress: sender.address,
          tons: params.initialBuyAmount
        } : undefined
      });

      // После деплоя адрес токена будет доступен через события
      // Пока возвращаем успешное сообщение
      // В реальной реализации нужно дождаться подтверждения транзакции
      throw new Error('Токен создан! Транзакция отправлена. Адрес будет доступен после подтверждения.');
    } catch (error) {
      console.error("Error creating token:", error);
      throw error;
    }
  }

  async getTokenInfo(coinAddress: Address): Promise<TokenInfo | null> {
    try {
      // Получение информации о токене через API
      // Проверяем наличие метода getCoinInfo
      let info: any = {};
      if (this.sdk.api && typeof (this.sdk.api as any).getCoinInfo === 'function') {
        info = await (this.sdk.api as any).getCoinInfo(coinAddress);
      }
      
      return {
        address: coinAddress,
        name: info.name || 'Unknown',
        symbol: info.symbol || 'UNK',
        description: info.description,
        imageUrl: info.imageUrl,
        totalSupply: info.totalSupply ? BigInt(info.totalSupply) : undefined,
        price: info.price
      };
    } catch (error) {
      console.error("Error getting token info:", error);
      return null;
    }
  }

  async getTokenList(): Promise<TokenInfo[]> {
    try {
      // Проверяем наличие метода getCoins в API
      let coins: any[] = [];
      if (this.sdk.api && typeof (this.sdk.api as any).getCoins === 'function') {
        coins = await (this.sdk.api as any).getCoins();
      }
      
      return coins.map(coin => ({
        address: Address.parse(coin.address),
        name: coin.name || 'Unknown',
        symbol: coin.symbol || 'UNK',
        description: coin.description,
        imageUrl: coin.imageUrl,
        totalSupply: coin.totalSupply ? BigInt(coin.totalSupply) : undefined,
        price: coin.price
      }));
    } catch (error) {
      console.error("Error getting token list:", error);
      return [];
    }
  }

  async buyTokens(coinAddress: Address, sender: Sender, tonsToSpend: bigint): Promise<void> {
    try {
      const coin = this.sdk.openCoin(coinAddress);
      await coin.sendBuy(sender, tonsToSpend);
    } catch (error) {
      console.error("Error buying tokens:", error);
      throw error;
    }
  }

  async sellTokens(coinAddress: Address, userAddress: Address, coinsToSell: bigint): Promise<void> {
    try {
      const userWallet = await this.sdk.openUserCoinWallet(coinAddress, userAddress);
      await userWallet.sendSell(coinsToSell);
    } catch (error) {
      console.error("Error selling tokens:", error);
      throw error;
    }
  }

  async getUserBalance(coinAddress: Address, userAddress: Address): Promise<bigint> {
    try {
      return await this.sdk.getUserCoinBalance(coinAddress, userAddress);
    } catch (error) {
      console.error("Error getting user balance:", error);
      return 0n;
    }
  }

  async getCoinsForTons(coinAddress: Address, tons: bigint): Promise<bigint> {
    try {
      return await this.sdk.getCoinsForTons(coinAddress, tons);
    } catch (error) {
      console.error("Error calculating coins for tons:", error);
      return 0n;
    }
  }

  async getTonsForCoins(coinAddress: Address, coins: bigint): Promise<bigint> {
    try {
      return await this.sdk.getTonsForCoins(coinAddress, coins);
    } catch (error) {
      console.error("Error calculating tons for coins:", error);
      return 0n;
    }
  }
}
