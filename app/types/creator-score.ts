export interface CreatorScore {
  score: number;
  timestamp: string;
  source: 'talent-api';
}

export interface MarketCap {
  value: number;
  currency: string;
  timestamp: string;
  source: 'talent-api';
}

export interface UserProfile {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  creatorScore?: CreatorScore;
  marketCap?: MarketCap;
}

export interface RatioAnalysis {
  ratio: number;
  category: 'undervalued' | 'balanced' | 'overvalued';
  categoryEmoji: string;
  categoryLabel: string;
  description: string;
}

export interface SimulationResult {
  originalRatio: number;
  simulatedRatio: number;
  originalCategory: string;
  simulatedCategory: string;
  change: 'improved' | 'worsened' | 'unchanged';
}

export interface TalentApiResponse {
  success: boolean;
  data?: {
    creatorScore?: number;
    marketCap?: number;
  };
  error?: string;
}
