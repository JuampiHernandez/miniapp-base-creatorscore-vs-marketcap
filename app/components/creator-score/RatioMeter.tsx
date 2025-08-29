"use client";

import { RatioAnalysis } from '../../types/creator-score';

interface SimulationResult {
  originalRatio: number;
  simulatedRatio: number;
  originalCategory: string;
  simulatedCategory: string;
  change: 'improved' | 'worsened' | 'unchanged';
  simulatedCreatorScore: number;
  simulatedMarketCap: number;
}

interface RatioMeterProps {
  ratioAnalysis: RatioAnalysis;
  simulationResult?: SimulationResult | null; // For real-time updates during simulation
}

export default function RatioMeter({ ratioAnalysis, simulationResult }: RatioMeterProps) {
  // Use simulation values if available, otherwise use current values
  const currentRatio = simulationResult?.simulatedRatio || ratioAnalysis.ratio;
  const currentCategory = simulationResult?.simulatedCategory || ratioAnalysis.category;
  const currentCategoryEmoji = simulationResult?.simulatedCategory ? 
    (simulationResult.simulatedCategory === 'undervalued' ? '📈' :
     simulationResult.simulatedCategory === 'overvalued' ? '📉' : '⚖️') :
    ratioAnalysis.categoryEmoji;
  const currentCategoryLabel = simulationResult?.simulatedCategory ? 
    (simulationResult.simulatedCategory === 'undervalued' ? 'Undervalued' :
     simulationResult.simulatedCategory === 'overvalued' ? 'Overvalued' : 'Balanced') :
    ratioAnalysis.categoryLabel;

  // Calculate meter position (0-100%)
  const getMeterPosition = () => {
    // Use the actual ratio thresholds: 0.002 = 0%, 0.01 = 100%
    const normalizedRatio = Math.max(0, Math.min(1, (currentRatio - 0.002) / (0.01 - 0.002)));
    return normalizedRatio * 100;
  };

  const meterPosition = getMeterPosition();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          ⚖️ Ratio Analysis
        </h3>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl">{currentCategoryEmoji}</span>
          <span className="text-lg font-medium text-gray-700">{currentCategoryLabel}</span>
        </div>
      </div>

      {/* Ratio Value */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-blue-600">
          {(currentRatio * 1000).toFixed(2)}‰
        </div>
        <div className="text-sm text-gray-600">
          Creator Score / Market Cap Ratio
        </div>
      </div>

      {/* Balance Meter */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>📈 Undervalued</span>
          <span>⚖️ Balanced</span>
          <span>📉 Overvalued</span>
        </div>
        
        <div className="relative h-4 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-full overflow-hidden">
          {/* Meter Indicator */}
          <div 
            className="absolute top-0 h-full w-2 bg-blue-600 rounded-full shadow-lg transition-all duration-300 ease-out"
            style={{ left: `${meterPosition}%`, transform: 'translateX(-50%)' }}
          />
          
          {/* Threshold Lines */}
          <div className="absolute top-0 h-full w-0.5 bg-green-600 left-[0%]" />
          <div className="absolute top-0 h-full w-0.5 bg-yellow-600 left-[37.5%]" />
          <div className="absolute top-0 h-full w-0.5 bg-red-600 left-[100%]" />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.002</span>
          <span>0.005</span>
          <span>0.01</span>
        </div>
      </div>

      {/* Category Description */}
      <div className="text-center">
        <p className="text-sm text-gray-700 leading-relaxed">
          {currentCategory === 'undervalued' && 
            "Your creator score is high relative to market cap - this suggests potential for growth and that your coin might be undervalued."}
          {currentCategory === 'balanced' && 
            "Your creator score and market cap are well balanced, indicating fair valuation."}
          {currentCategory === 'overvalued' && 
            "Your market cap is high relative to creator score - consider building more to justify the current valuation."}
        </p>
      </div>
    </div>
  );
}
