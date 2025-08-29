import { CreatorScore, MarketCap } from '../types/creator-score';
import { fetchCreatorScoreViaApi } from './talent-api';
import { getHighestCreatorCoinMarketCap } from './zora-api';
import { NeynarApiService } from './neynar-api';

// Mock data for development/testing
const MOCK_CREATOR_SCORES: Record<number, CreatorScore> = {
  6730: {
    score: 155,
    slug: 'creator_score',
    lastCalculatedAt: '2025-08-26T16:37:34Z',
    source: 'talent-api'
  }
};

const MOCK_MARKET_CAPS: Record<number, MarketCap> = {
  6730: {
    value: 104000,
    currency: 'USDC',
    timestamp: '2025-08-26T16:37:33Z',
    source: 'zora-api',
    readableValue: '104K',
    unitOfMeasure: 'USDC'
  }
};

// Mock function for creator score (fallback)
export async function fetchCreatorScoreFromMock(fid: number): Promise<CreatorScore | null> {
  console.log(`🎭 Using mock creator score for FID: ${fid}`);
  return MOCK_CREATOR_SCORES[fid] || null;
}

// Mock function for market cap (fallback)
export async function fetchMarketCapFromMock(fid: number): Promise<MarketCap | null> {
  console.log(`🎭 Using mock market cap for FID: ${fid}`);
  return MOCK_MARKET_CAPS[fid] || null;
}

/**
 * Fetch user data using the new Neynar + Zora approach
 */
export async function fetchUserData(fid: number): Promise<{ creatorScore: CreatorScore | null; marketCap: MarketCap | null }> {
  console.log(`🚀 Fetching user data for FID: ${fid}`);
  
  try {
    // 1. Get Creator Score from Talent Protocol
    console.log('📊 Fetching creator score from Talent Protocol...');
    const creatorScore = await fetchCreatorScoreViaApi(fid);
    console.log('✅ Creator score result:', creatorScore);

    // 2. Get wallet addresses from Neynar API
    console.log('🔍 Fetching wallet addresses from Neynar API...');
    const walletAddresses = await NeynarApiService.getUserByFid(fid);
    console.log('✅ Wallet addresses found:', walletAddresses);

    // 3. Get market cap from Zora API using wallet addresses
    let marketCap: MarketCap | null = null;
    if (walletAddresses && walletAddresses.length > 0) {
      console.log('💰 Fetching market cap from Zora API...');
      marketCap = await getHighestCreatorCoinMarketCap(walletAddresses);
      console.log('✅ Market cap result:', marketCap);
    } else {
      console.log('⚠️ No wallet addresses found, skipping Zora API call');
    }

    // 4. Fallback to mock data if APIs fail
    if (!creatorScore) {
      console.log('🔄 Falling back to mock creator score');
      const mockCreatorScore = await fetchCreatorScoreFromMock(fid);
      if (mockCreatorScore) {
        console.log('✅ Mock creator score loaded');
      }
    }

    if (!marketCap) {
      console.log('🔄 Falling back to mock market cap');
      const mockMarketCap = await fetchMarketCapFromMock(fid);
      if (mockMarketCap) {
        console.log('✅ Mock market cap loaded');
      }
    }

    return {
      creatorScore: creatorScore || await fetchCreatorScoreFromMock(fid),
      marketCap: marketCap || await fetchMarketCapFromMock(fid)
    };
  } catch (error) {
    console.error('❌ Error in fetchUserData:', error);
    
    // Fallback to mock data on error
    console.log('🔄 Falling back to mock data due to error');
    return {
      creatorScore: await fetchCreatorScoreFromMock(fid),
      marketCap: await fetchMarketCapFromMock(fid)
    };
  }
}
