import { RatioAnalysis, SimulationResult } from '../types/creator-score';

export const RATIO_THRESHOLDS = {
  UNDERVALUED: 0.0005,  // 0.5‰ - High score, low market cap = undervalued
  BALANCED: 0.002,       // 2‰ - Fair valuation
  OVERVALUED: 0.005      // 5‰ - Low score, high market cap = overvalued
} as const;

export function calculateRatio(marketCap: number, creatorScore: number): number {
  if (creatorScore === 0) return Infinity;
  return marketCap / creatorScore;
}

export function analyzeRatio(ratio: number): RatioAnalysis {
  let category: 'undervalued' | 'balanced' | 'overvalued';
  let categoryEmoji: string;
  let categoryLabel: string;
  let description: string;

  if (ratio < RATIO_THRESHOLDS.UNDERVALUED) {
    category = 'undervalued';
    categoryEmoji = '📈';
    categoryLabel = 'Undervalued';
    description = 'High potential, low market recognition. Your creator value exceeds market expectations!';
  } else if (ratio >= RATIO_THRESHOLDS.UNDERVALUED && ratio <= RATIO_THRESHOLDS.BALANCED) {
    category = 'balanced';
    categoryEmoji = '⚖️';
    categoryLabel = 'Balanced';
    description = 'Fair valuation. Your creator score and market cap are well-aligned.';
  } else {
    category = 'overvalued';
    categoryEmoji = '📉';
    categoryLabel = 'Overvalued';
    description = 'High market cap relative to creator score. Focus on building your creator value!';
  }

  return {
    ratio,
    category,
    categoryEmoji,
    categoryLabel,
    description
  };
}

export function simulateCreatorScore(
  originalMarketCap: number,
  originalCreatorScore: number,
  newCreatorScore: number
): SimulationResult {
  const originalRatio = calculateRatio(originalMarketCap, originalCreatorScore);
  const simulatedRatio = calculateRatio(originalMarketCap, newCreatorScore);
  
  const originalAnalysis = analyzeRatio(originalRatio);
  const simulatedAnalysis = analyzeRatio(simulatedRatio);
  
  let change: 'improved' | 'worsened' | 'unchanged';
  
  if (simulatedRatio < originalRatio) {
    change = 'improved';
  } else if (simulatedRatio > originalRatio) {
    change = 'worsened';
  } else {
    change = 'unchanged';
  }

  return {
    originalRatio,
    simulatedRatio,
    originalCategory: originalAnalysis.categoryLabel,
    simulatedCategory: simulatedAnalysis.categoryLabel,
    change,
  };
}

export function formatCurrency(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

export function formatRatio(ratio: number): string {
  if (ratio === Infinity) return '∞';
  if (ratio >= 1e6) {
    return `${(ratio / 1e6).toFixed(2)}M`;
  } else if (ratio >= 1e3) {
    return `${(ratio / 1e3).toFixed(2)}K`;
  } else {
    return ratio.toFixed(2);
  }
}
