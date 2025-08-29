export interface ZoraProfileResponse {
  profile?: {
    id?: string;
    handle?: string;
    displayName?: string;
    bio?: string;
    username?: string;
    website?: string;
    avatar?: {
      small?: string;
      medium?: string;
      blurhash?: string;
    };
    publicWallet?: {
      walletAddress?: string;
    };
    socialAccounts?: {
      instagram?: {
        username?: string;
        displayName?: string;
      };
      tiktok?: {
        username?: string;
        displayName?: string;
      };
      twitter?: {
        username?: string;
        displayName?: string;
      };
      farcaster?: {
        username?: string;
        displayName?: string;
      };
    };
    linkedWallets?: {
      edges?: Array<{
        node?: {
          walletType?: "PRIVY" | "EXTERNAL" | "SMART_WALLET";
          walletAddress?: string;
        };
      }>;
    };
    creatorCoin?: {
      address?: string;
      marketCap?: string;
      marketCapDelta24h?: string;
    };
  };
}

export interface ZoraApiResponse {
  data?: ZoraProfileResponse;
}

// Function to get creator coin market cap from Zora API using direct HTTP calls
export async function getCreatorCoinMarketCap(identifier: string): Promise<{ 
  marketCap: number; 
  readableValue: string; 
  unitOfMeasure: string;
  coinAddress?: string;
} | null> {
  try {
    console.log('Fetching creator coin market cap from Zora API for:', identifier);
    
    // Get API key from environment
    const apiKey = process.env.ZORA_API_KEY;
    if (!apiKey) {
      console.warn('Zora API key not configured, using mock data');
      return null;
    }
    
    // Make direct HTTP call to Zora API
    const response = await fetch(`https://api-sdk.zora.engineering/profile?identifier=${identifier}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': apiKey,
      },
    });
    
    if (!response.ok) {
      console.error('Zora API error:', response.status, response.statusText);
      return null;
    }
    
    const data: ZoraApiResponse = await response.json();
    console.log('Zora API response:', data);
    
    const profile = data?.data?.profile;
    
    if (profile?.creatorCoin?.marketCap) {
      const marketCapValue = parseFloat(profile.creatorCoin.marketCap);
      
      if (!isNaN(marketCapValue)) {
        // Format the readable value
        let readableValue: string;
        if (marketCapValue >= 1000000) {
          readableValue = `${(marketCapValue / 1000000).toFixed(1)}M`;
        } else if (marketCapValue >= 1000) {
          readableValue = `${(marketCapValue / 1000).toFixed(1)}K`;
        } else {
          readableValue = marketCapValue.toFixed(2);
        }
        
        return {
          marketCap: marketCapValue,
          readableValue: readableValue,
          unitOfMeasure: 'USD',
          coinAddress: profile.creatorCoin.address,
        };
      }
    }
    
    console.log('No creator coin market cap found in Zora profile');
    return null;
    
  } catch (error) {
    console.error('Error fetching creator coin market cap from Zora:', error);
    return null;
  }
}
