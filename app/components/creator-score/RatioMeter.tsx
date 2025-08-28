"use client";

import { useEffect, useState } from 'react';
import { RATIO_THRESHOLDS } from '../../lib/ratio-calculator';

interface RatioMeterProps {
  ratio: number;
  category: 'undervalued' | 'balanced' | 'overvalued';
}

export function RatioMeter({ ratio, category }: RatioMeterProps) {
  const [animatedRatio, setAnimatedRatio] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Animate the ratio from 0 to actual value
    setIsAnimating(true);
    setAnimatedRatio(0);
    
    const timer = setTimeout(() => {
      setAnimatedRatio(ratio);
      setIsAnimating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [ratio]);

  // Calculate meter position (0-100%)
  const getMeterPosition = () => {
    const maxRatio = 5000; // Maximum ratio to display
    const position = Math.min((animatedRatio / maxRatio) * 100, 100);
    return Math.max(position, 0);
  };

  // Get category colors
  const getCategoryColors = () => {
    switch (category) {
      case 'undervalued':
        return {
          bg: 'from-green-400 to-green-600',
          text: 'text-green-700',
          border: 'border-green-300',
        };
      case 'balanced':
        return {
          bg: 'from-blue-400 to-blue-600',
          text: 'text-blue-700',
          border: 'border-blue-300',
        };
      case 'overvalued':
        return {
          bg: 'from-orange-400 to-orange-600',
          text: 'text-orange-700',
          border: 'border-orange-300',
        };
    }
  };

  const colors = getCategoryColors();
  const meterPosition = getMeterPosition();

  return (
    <div className="space-y-4">
      {/* Meter Container */}
      <div className="relative">
        <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
          {/* Animated Fill */}
          <div
            className={`h-full bg-gradient-to-r ${colors.bg} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${meterPosition}%` }}
          />
        </div>
        
        {/* Threshold Markers */}
        <div className="absolute top-0 left-0 w-full h-4 pointer-events-none">
          {/* Undervalued threshold */}
          <div 
            className="absolute top-0 w-0.5 h-4 bg-green-500"
            style={{ left: `${(RATIO_THRESHOLDS.UNDERVALUED / 5000) * 100}%` }}
          />
          {/* Balanced threshold */}
          <div 
            className="absolute top-0 w-0.5 h-4 bg-blue-500"
            style={{ left: `${(RATIO_THRESHOLDS.BALANCED_MAX / 5000) * 100}%` }}
          />
        </div>

        {/* Current Position Indicator */}
        <div
          className={`absolute top-0 w-3 h-6 -mt-1 -ml-1.5 bg-white border-2 ${colors.border} rounded-full shadow-lg transition-all duration-1000 ease-out`}
          style={{ left: `${meterPosition}%` }}
        />
      </div>

      {/* Threshold Labels */}
      <div className="flex justify-between text-xs text-gray-500">
        <div className="text-left">
          <div className="font-medium text-green-600">🚀 Undervalued</div>
          <div>&lt; {RATIO_THRESHOLDS.UNDERVALUED.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="font-medium text-blue-600">⚖️ Balanced</div>
          <div>{RATIO_THRESHOLDS.UNDERVALUED.toLocaleString()} - {RATIO_THRESHOLDS.BALANCED_MAX.toLocaleString()}</div>
        </div>
        <div className="text-right">
          <div className="font-medium text-orange-600">🧃 Overvalued</div>
          <div>&gt; {RATIO_THRESHOLDS.BALANCED_MAX.toLocaleString()}</div>
        </div>
      </div>

      {/* Current Position Label */}
      <div className="text-center">
        <div className={`text-lg font-bold ${colors.text}`}>
          {isAnimating ? 'Calculating...' : `Ratio: ${ratio.toLocaleString()}`}
        </div>
        <div className="text-sm text-gray-500">
          Position: {meterPosition.toFixed(1)}% on the meter
        </div>
      </div>
    </div>
  );
}
