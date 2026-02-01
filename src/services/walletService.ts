import { TonConnect } from "@tonconnect/sdk";
import { Sender, SenderArguments, Address } from "@ton/core";

export class WalletService {
  private tonConnect: TonConnect;

  constructor() {
    this.tonConnect = new TonConnect({
      manifestUrl: `${window.location.origin}/tonconnect-manifest.json`
    });
  }

  async connectWallet() {
    try {
      const wallets = await this.tonConnect.getWallets();
      if (wallets.length === 0) {
        throw new Error('Кошельки не найдены');
      }
      
      // Используем первый доступный кошелек
      const wallet = wallets[0];
      
      // Для встроенных кошельков (Telegram)
      if (wallet.embedded) {
        await this.tonConnect.connect({ jsBridgeKey: wallet.jsBridgeKey });
      } else {
        // Для внешних кошельков используем универсальную ссылку
        const universalLink = this.tonConnect.connect(wallet);
        if (universalLink) {
          window.open(universalLink, '_blank');
        } else {
          throw new Error('Не удалось создать ссылку для подключения');
        }
      }
      return true;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async disconnectWallet() {
    await this.tonConnect.disconnect();
  }

  isConnected(): boolean {
    return this.tonConnect.wallet !== null;
  }

  getAddress(): Address | null {
    if (!this.tonConnect.wallet?.account?.address) {
      return null;
    }
    return Address.parse(this.tonConnect.wallet.account.address);
  }

  getSender(): Sender {
    const address = this.getAddress();
    
    return {
      address: address || undefined,
      send: async (args: SenderArguments) => {
        if (!this.tonConnect.wallet) {
          throw new Error('Wallet not connected');
        }

        const messages = [{
          address: args.to.toString(),
          amount: args.value.toString(),
          payload: args.body ? args.body.toBoc().toString('base64') : undefined
        }];

        await this.tonConnect.sendTransaction({
          messages,
          validUntil: Math.floor(Date.now() / 1000) + 300
        });
      }
    };
  }

  subscribe(callback: () => void) {
    this.tonConnect.onStatusChange(callback);
    return () => {
      // Unsubscribe if needed
    };
  }
}
