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
  readableValue: string;
  unitOfMeasure: string;
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

// New types for credentials endpoint
export interface CredentialDataPoint {
  id: number;
  name: string;
  value: string;
  is_maximum?: boolean;
  multiplier: number;
  readable_value: string;
  multiplication_result?: string;
}

export interface Credential {
  account_source: string;
  calculating_score: boolean;
  category: string;
  data_issuer_name: string;
  data_issuer_slug: string;
  description: string;
  external_url: string;
  immutable: boolean;
  last_calculated_at: string | null;
  max_score: number;
  name: string;
  points: number;
  points_calculation_logic: {
    points: number;
    max_points: number;
    data_points: CredentialDataPoint[];
    points_description: string;
    points_number_calculated: number;
  };
  readable_value: string;
  slug: string;
  uom: string;
  updated_at: string | null;
}

export interface CredentialsResponse {
  success: boolean;
  data?: {
    credentials: Credential[];
  };
  error?: string;
}
