import { MarketCap } from '../types/creator-score';

export interface ZoraProfileResponse {
  profile: {
    __typename: string;
    id: string;
    handle: string;
    username: string;
    displayName: string;
    publicWallet: {
      walletAddress: string;
    };
    linkedWallets: {
      edges: Array<{
        node: {
          walletType: string;
          walletAddress: string;
        };
      }>;
    };
    creatorCoin: {
      address: string;
      marketCap: string;
      marketCapDelta24h: string;
    };
  };
}

export interface ZoraApiResponse {
  data: ZoraProfileResponse;
}

/**
 * Get the highest Creator Coin Market Cap from multiple wallet addresses
 * @param walletAddresses Array of wallet addresses to check
 * @returns Market cap data with the highest value, or null if none found
 */
export async function getHighestCreatorCoinMarketCap(walletAddresses: string[]): Promise<MarketCap | null> {
  if (!walletAddresses || walletAddresses.length === 0) {
    console.log('❌ No wallet addresses provided to Zora API');
    return null;
  }

  console.log(`🔍 Checking ${walletAddresses.length} wallet addresses with Zora API:`, walletAddresses);

  const apiKey = process.env.ZORA_API_KEY;
  if (!apiKey) {
    console.error('❌ ZORA_API_KEY not found in environment variables');
    return null;
  }

  let highestMarketCap: MarketCap | null = null;
  let highestValue = 0;

  // Try each wallet address
  for (const walletAddress of walletAddresses) {
    try {
      console.log(`🔍 Checking wallet: ${walletAddress}`);
      
      const response = await fetch(`https://api-sdk.zora.engineering/profile?identifier=${walletAddress}`, {
        method: 'GET',
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`⚠️ Zora API error for ${walletAddress}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data: ZoraApiResponse = await response.json();
      console.log(`📡 Zora API response for ${walletAddress}:`, data);

      if (data.data?.profile?.creatorCoin?.marketCap) {
        const marketCapValue = parseFloat(data.data.profile.creatorCoin.marketCap);
        console.log(`💰 Found market cap for ${walletAddress}: ${marketCapValue}`);

        // Update highest if this is higher
        if (marketCapValue > highestValue) {
          highestValue = marketCapValue;
          highestMarketCap = {
            value: marketCapValue,
            currency: 'USDC',
            timestamp: new Date().toISOString(),
            readableValue: formatMarketCapValue(marketCapValue),
            unitOfMeasure: 'USDC',
            source: 'zora-api'
          };
          console.log(`🏆 New highest market cap: ${marketCapValue} (${highestMarketCap.readableValue})`);
        }
      } else {
        console.log(`ℹ️ No creator coin found for wallet: ${walletAddress}`);
      }
    } catch (error) {
      console.error(`❌ Error checking wallet ${walletAddress}:`, error);
      continue;
    }
  }

  if (highestMarketCap) {
    console.log(`🎯 Final result - Highest market cap: ${highestMarketCap.readableValue} ${highestMarketCap.unitOfMeasure}`);
  } else {
    console.log('❌ No market cap found for any wallet address');
  }

  return highestMarketCap;
}

/**
 * Get Creator Coin Market Cap for a single identifier (wallet address or Zora handle)
 * @param identifier Wallet address or Zora handle
 * @returns Market cap data or null if not found
 */
export async function getCreatorCoinMarketCap(identifier: string): Promise<MarketCap | null> {
  console.log(`🔍 Fetching Creator Coin Market Cap for identifier: ${identifier}`);

  const apiKey = process.env.ZORA_API_KEY;
  if (!apiKey) {
    console.error('❌ ZORA_API_KEY not found in environment variables');
    return null;
  }

  try {
    const response = await fetch(`https://api-sdk.zora.engineering/profile?identifier=${identifier}`, {
      method: 'GET',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ Zora API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: ZoraApiResponse = await response.json();
    console.log('📡 Zora API response:', data);

    if (data.data?.profile?.creatorCoin?.marketCap) {
      const marketCapValue = parseFloat(data.data.profile.creatorCoin.marketCap);
      console.log(`💰 Market cap found: ${marketCapValue}`);

      return {
        value: marketCapValue,
        currency: 'USDC',
        timestamp: new Date().toISOString(),
        readableValue: formatMarketCapValue(marketCapValue),
        unitOfMeasure: 'USDC',
        source: 'zora-api'
      };
    } else {
      console.log('ℹ️ No creator coin found in response');
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching from Zora API:', error);
    return null;
  }
}

/**
 * Format market cap value into readable format (e.g., 104K, 2.5M)
 */
function formatMarketCapValue(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  } else {
    return value.toString();
  }
}
