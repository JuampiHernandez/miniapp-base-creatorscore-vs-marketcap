"use client";

import { useState, useEffect } from 'react';
import { simulateCreatorScore, formatCurrency, formatRatio } from '../../lib/ratio-calculator';
import { SimulationResult } from '../../types/creator-score';

interface WhatIfSliderProps {
  currentCreatorScore: number;
  currentMarketCap: number;
}

export function WhatIfSlider({ currentCreatorScore, currentMarketCap }: WhatIfSliderProps) {
  const [simulatedScore, setSimulatedScore] = useState(currentCreatorScore);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  useEffect(() => {
    // Update simulation when current values change
    setSimulatedScore(currentCreatorScore);
  }, [currentCreatorScore]);

  useEffect(() => {
    // Calculate simulation result
    const result = simulateCreatorScore(
      currentMarketCap,
      currentCreatorScore,
      simulatedScore
    );
    setSimulationResult(result);
  }, [currentMarketCap, currentCreatorScore, simulatedScore]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(event.target.value);
    setSimulatedScore(newScore);
  };

  const resetToCurrent = () => {
    setSimulatedScore(currentCreatorScore);
  };

  const getChangeIndicator = () => {
    if (!simulationResult) return null;

    switch (simulationResult.change) {
      case 'improved':
        return (
          <div className="flex items-center text-green-600">
            <span className="text-lg">↗️</span>
            <span className="ml-1 text-sm font-medium">Improved</span>
          </div>
        );
      case 'worsened':
        return (
          <div className="flex items-center text-red-600">
            <span className="text-lg">↘️</span>
            <span className="ml-1 text-sm font-medium">Worsened</span>
          </div>
        );
      case 'unchanged':
        return (
          <div className="flex items-center text-gray-600">
            <span className="text-lg">→</span>
            <span className="ml-1 text-sm font-medium">No Change</span>
          </div>
        );
    }
  };

  const getSimulatedMarketCap = () => {
    if (currentCreatorScore === 0) return currentMarketCap;
    return simulatedScore * (currentMarketCap / currentCreatorScore);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 What If...</h3>
        <p className="text-sm text-gray-600">
          Explore how different Creator Scores would affect your valuation
        </p>
      </div>

      {/* Slider Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Creator Score
          </label>
          <span className="text-lg font-bold text-blue-600">
            {simulatedScore.toLocaleString()}
          </span>
        </div>

        <input
          type="range"
          min={Math.max(1, Math.floor(currentCreatorScore * 0.1))}
          max={Math.ceil(currentCreatorScore * 3)}
          value={simulatedScore}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />

        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.max(1, Math.floor(currentCreatorScore * 0.1)).toLocaleString()}</span>
          <span className="text-blue-600 font-medium">
            Current: {currentCreatorScore.toLocaleString()}
          </span>
          <span>{Math.ceil(currentCreatorScore * 3).toLocaleString()}</span>
        </div>

        <button
          onClick={resetToCurrent}
          className="w-full py-2 px-4 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reset to Current Score
        </button>
      </div>

      {/* Simulation Results */}
      {simulationResult && (
        <div className="mt-6 space-y-4">
          <div className="border-t border-blue-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Simulation Results</h4>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-500">Original Ratio</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatRatio(simulationResult.originalRatio)}
                </div>
                <div className="text-xs text-gray-600">
                  {simulationResult.originalCategory}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-500">Simulated Ratio</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatRatio(simulationResult.simulatedRatio)}
                </div>
                <div className="text-xs text-blue-600">
                  {simulationResult.simulatedCategory}
                </div>
              </div>
            </div>

            <div className="mt-3 text-center">
              {getChangeIndicator()}
            </div>
          </div>

          {/* Market Cap Impact */}
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-medium text-gray-700 mb-2">Market Cap Impact</div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(getSimulatedMarketCap())}
              </div>
              <div className="text-xs text-gray-500">
                Simulated market cap based on new creator score
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
