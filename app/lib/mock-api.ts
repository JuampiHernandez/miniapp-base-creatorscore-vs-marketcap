import { TalentApiResponse, CreatorScore, MarketCap } from '../types/creator-score';

// Mock data for development
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

export async function fetchCreatorScore(fid: number): Promise<TalentApiResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
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

export async function fetchMarketCap(fid: number): Promise<TalentApiResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
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

export async function fetchUserData(fid: number): Promise<{
  creatorScore?: CreatorScore;
  marketCap?: MarketCap;
}> {
  const [scoreResponse, marketCapResponse] = await Promise.all([
    fetchCreatorScore(fid),
    fetchMarketCap(fid),
  ]);

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
      currency: 'USD',
      timestamp: new Date().toISOString(),
      source: 'talent-api',
    };
  }

  return result;
}
