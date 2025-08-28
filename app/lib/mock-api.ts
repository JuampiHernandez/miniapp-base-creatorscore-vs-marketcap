import { TalentApiResponse, CreatorScore, MarketCap } from '../types/creator-score';
import { fetchCreatorScore, fetchMarketCap } from './talent-api';

// Mock data for development (fallback when Talent API is not available)
const MOCK_CREATOR_SCORES: Record<number, number> = {
  20390: 850, // Example FID with creator score
  12345: 1200,
  67890: 650,
};

const MOCK_MARKET_CAPS: Record<number, number> = {
  20390: 2500000, // $2.5M market cap
  12345: 8000000, // $8M market cap
  67890: 1500000, // $1.5M market cap
};

export async function fetchCreatorScoreFromMock(fid: number): Promise<TalentApiResponse> {
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

export async function fetchMarketCapFromMock(fid: number): Promise<TalentApiResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const marketCap = MOCK_MARKET_CAPS[fid];
  
  if (marketCap !== undefined) {
    return {
      success: true,
      data: { marketCap },
    };
  }
  
  return {
    success: false,
    error: 'Market cap not found',
  };
}

// Main function that tries real API first, falls back to mock
export async function fetchUserData(fid: number): Promise<{
  creatorScore?: CreatorScore;
  marketCap?: MarketCap;
}> {
  try {
    // Try to get creator score from Talent API first
    const scoreResponse = await fetchCreatorScore(fid);
    
    // Try to get market cap from Talent API credentials endpoint
    const marketCapResponse = await fetchMarketCap(fid);

    const result: {
      creatorScore?: CreatorScore;
      marketCap?: MarketCap;
    } = {};

    if (scoreResponse.success && scoreResponse.data?.creatorScore) {
      result.creatorScore = {
        score: scoreResponse.data.creatorScore,
        timestamp: new Date().toISOString(),
        source: 'talent-api',
      };
    }

    if (marketCapResponse.success && marketCapResponse.data?.marketCap) {
      result.marketCap = {
        value: marketCapResponse.data.marketCap,
        currency: marketCapResponse.data.unitOfMeasure,
        timestamp: new Date().toISOString(),
        source: 'talent-api',
        readableValue: marketCapResponse.data.readableValue,
        unitOfMeasure: marketCapResponse.data.unitOfMeasure,
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching user data:', error);
    
    // Fallback to mock data if everything fails
    const mockScoreResponse = await fetchCreatorScoreFromMock(fid);
    const mockMarketCapResponse = await fetchMarketCapFromMock(fid);

    const result: {
      creatorScore?: CreatorScore;
      marketCap?: MarketCap;
    } = {};

    if (mockScoreResponse.success && mockScoreResponse.data?.creatorScore) {
      result.creatorScore = {
        score: mockScoreResponse.data.creatorScore,
        timestamp: new Date().toISOString(),
        source: 'talent-api',
      };
    }

    if (mockMarketCapResponse.success && mockMarketCapResponse.data?.marketCap) {
      result.marketCap = {
        value: mockMarketCapResponse.data.marketCap,
        currency: 'USD',
        timestamp: new Date().toISOString(),
        source: 'talent-api',
        readableValue: 'Mock Data',
        unitOfMeasure: 'USD',
      };
    }

    return result;
  }
}
