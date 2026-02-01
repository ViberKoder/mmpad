import { Api, HttpClient } from "tonapi-sdk-js";
import { Address } from "@ton/core";
import type { BclSDK as BclSDKType } from "ton-bcl-sdk";

const TONAPI_TOKEN = import.meta.env.VITE_TONAPI_TOKEN || '';
const TONFUN_API_ENDPOINT = import.meta.env.VITE_TONFUN_API_ENDPOINT || 'https://test-indexer-3a4wy.ondigitalocean.app/api/v1';
const MASTER_ADDRESS = import.meta.env.VITE_MASTER_ADDRESS || 'EQBSMwczMFUb789uqNvebKBvemkRaAQJdzTFq6565Ef9rW2k';

export async function initSDK(): Promise<BclSDKType> {
  try {
    // Динамический импорт ton-bcl-sdk
    const tonBclSdk = await import("ton-bcl-sdk");
    const BclSDK = tonBclSdk.BclSDK || tonBclSdk.default;
    const simpleTonapiProvider = tonBclSdk.simpleTonapiProvider;
    
    if (!BclSDK || !simpleTonapiProvider) {
      throw new Error('ton-bcl-sdk exports not found');
    }

    const api = new Api(
      new HttpClient({
        baseUrl: 'https://tonapi.io',
        baseApiParams: {
          headers: {
            "Content-type": "application/json",
            ...(TONAPI_TOKEN ? { Authorization: `Bearer ${TONAPI_TOKEN}` } : {})
          },
        },
      })
    );

    const sdk = BclSDK.create({
      apiProvider: simpleTonapiProvider(api),
      clientOptions: {
        endpoint: TONFUN_API_ENDPOINT,
      },
      masterAddress: Address.parse(MASTER_ADDRESS),
    });

    return sdk;
  } catch (error) {
    console.error('Error initializing SDK:', error);
    throw error;
  }
}
