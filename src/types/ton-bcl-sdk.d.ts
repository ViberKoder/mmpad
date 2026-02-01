declare module 'ton-bcl-sdk' {
  import { Address, Sender } from '@ton/core';
  import { Api } from 'tonapi-sdk-js';

  export interface BclSDKConfig {
    apiProvider: any;
    clientOptions: {
      endpoint: string;
    };
    masterAddress: Address;
  }

  export interface Coin {
    sendBuy(sender: Sender, tons: bigint): Promise<void>;
  }

  export interface UserCoinWallet {
    sendSell(coins: bigint): Promise<void>;
  }

  export class BclSDK {
    static create(config: BclSDKConfig): BclSDK;
    api: any;
    openCoin(address: Address): Coin;
    openUserCoinWallet(coinAddress: Address, userAddress: Address): Promise<UserCoinWallet>;
    deployCoin(sender: Sender, params: any, options?: any): Promise<void>;
    getUserCoinBalance(coinAddress: Address, userAddress: Address): Promise<bigint>;
    getCoinsForTons(coinAddress: Address, tons: bigint): Promise<bigint>;
    getTonsForCoins(coinAddress: Address, coins: bigint): Promise<bigint>;
  }

  export function simpleTonapiProvider(api: Api): any;
}
