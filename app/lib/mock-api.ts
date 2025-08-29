import { CreatorScore, MarketCap } from '../types/creator-score';
import { fetchCreatorScore } from './talent-api';
import { getCreatorCoinMarketCap } from './zora-api';

// Mock data for fallback
const MOCK_CREATOR_SCORES: Record<number, number> = {
  1: 850,
  2: 1200,
  3: 650,
  6730: 155, // Your actual score
};

const MOCK_MARKET_CAPS: Record<number, number> = {
  1: 2500000,
  2: 1800000,
  3: 3200000,
  6730: 500000, // Mock market cap for testing
};

export async function fetchCreatorScoreFromMock(fid: number): Promise<{ success: boolean; data?: { creatorScore: number }; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const score = MOCK_CREATOR_SCORES[fid];
  
  if (score !== undefined) {
    return {
      success: true,
      data: { creatorScore: score },
    };
  }
  
  return {
    success: false,
    error: 'Creator score not found',
  };
}

export async function fetchMarketCapFromMock(fid: number): Promise<{ success: boolean; data?: { marketCap: number; readableValue: string; unitOfMeasure: string }; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const marketCap = MOCK_MARKET_CAPS[fid];
  
  if (marketCap !== undefined) {
    return {
      success: true,
      data: { 
        marketCap,
        readableValue: marketCap >= 1000000 ? `${(marketCap / 1000000).toFixed(1)}M` : `${(marketCap / 1000).toFixed(1)}K`,
        unitOfMeasure: 'USD'
      },
    };
  }
  
  return {
    success: false,
    error: 'Market cap not found',
  };
}

// Main function that tries real APIs first, falls back to mock
export async function fetchUserData(identifier: number | string): Promise<{
  creatorScore?: CreatorScore;
  marketCap?: MarketCap;
}> {
  try {
    console.log('Fetching user data for identifier:', identifier);
    
    // Try to get creator score from Talent API first
    const scoreResponse = await fetchCreatorScore(identifier);
    
    // Try to get market cap from Zora API
    let marketCapData = null;
    if (typeof identifier === 'string' && identifier.startsWith('0x')) {
      // If identifier is a wallet address, try Zora API
      marketCapData = await getCreatorCoinMarketCap(identifier);
    }
    
    // If no wallet address or Zora API failed, try to get wallet from Farcaster context
    if (!marketCapData && typeof identifier === 'number') {
      console.log('Identifier is FID, trying to get wallet address from context...');
      // For now, we'll use mock data if we can't get wallet address
      // In the future, we could implement wallet address lookup from FID
    }

    const result: {
      creatorScore?: CreatorScore;
      marketCap?: MarketCap;
    } = {};

    if (scoreResponse.success && scoreResponse.data?.creatorScore) {
      result.creatorScore = {
        score: scoreResponse.data.creatorScore,
        slug: 'creator_score',
        lastCalculatedAt: new Date().toISOString(),
        source: 'talent-api',
      };
    }

    if (marketCapData) {
      result.marketCap = {
        value: marketCapData.marketCap,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'zora-api',
        readableValue: marketCapData.readableValue,
        unitOfMeasure: marketCapData.unitOfMeasure,
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Fallback to mock data if everything fails
    const mockScoreResponse = await fetchCreatorScoreFromMock(1);
    const mockMarketCapResponse = await fetchMarketCapFromMock(1);

    const result: {
      creatorScore?: CreatorScore;
      marketCap?: MarketCap;
    } = {};

    if (mockScoreResponse.success && mockScoreResponse.data?.creatorScore) {
      result.creatorScore = {
        score: mockScoreResponse.data.creatorScore,
        slug: 'creator_score',
        lastCalculatedAt: new Date().toISOString(),
        source: 'talent-api',
      };
    }

    if (mockMarketCapResponse.success && mockMarketCapResponse.data?.marketCap) {
      result.marketCap = {
        value: mockMarketCapResponse.data.marketCap,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'talent-api',
        readableValue: mockMarketCapResponse.data.readableValue,
        unitOfMeasure: mockMarketCapResponse.data.unitOfMeasure,
      };
    }

    return result;
  }
}
