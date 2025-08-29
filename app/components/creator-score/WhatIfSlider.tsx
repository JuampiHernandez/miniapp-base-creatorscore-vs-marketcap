"use client";

import { useState, useEffect } from 'react';

interface SimulationResult {
  originalRatio: number;
  simulatedRatio: number;
  originalCategory: string;
  simulatedCategory: string;
  change: 'improved' | 'worsened' | 'unchanged';
  simulatedCreatorScore: number;
  simulatedMarketCap: number;
}

interface WhatIfSliderProps {
  currentRatio: number;
  onSimulation: (result: SimulationResult) => void;
  currentCreatorScore: number;
  currentMarketCap: number;
}

export default function WhatIfSlider({ 
  currentRatio, 
  onSimulation, 
  currentCreatorScore, 
  currentMarketCap 
}: WhatIfSliderProps) {
  const [creatorScore, setCreatorScore] = useState(currentCreatorScore);
  const [marketCap, setMarketCap] = useState(currentMarketCap);
  const [simulatedRatio, setSimulatedRatio] = useState(currentRatio);

  // Update simulation when sliders change
  useEffect(() => {
    const newRatio = marketCap > 0 ? creatorScore / marketCap : 0;
    setSimulatedRatio(newRatio);
    
    // Calculate category based on new ratio
    let category = 'balanced';
    
    if (newRatio < 0.001) {
      category = 'undervalued';
    } else if (newRatio > 0.01) {
      category = 'overvalued';
    }
    
    const simulationResult: SimulationResult = {
      originalRatio: currentRatio,
      simulatedRatio: newRatio,
      originalCategory: getCategoryFromRatio(currentRatio),
      simulatedCategory: category,
      change: getChangeType(currentRatio, newRatio),
      simulatedCreatorScore: creatorScore,
      simulatedMarketCap: marketCap
    };
    
    onSimulation(simulationResult);
  }, [creatorScore, marketCap, currentRatio, onSimulation]);

  const getCategoryFromRatio = (ratio: number) => {
    if (ratio < 0.001) return 'undervalued';
    if (ratio > 0.01) return 'overvalued';
    return 'balanced';
  };

  const getChangeType = (original: number, simulated: number) => {
    if (Math.abs(original - simulated) < 0.0001) return 'unchanged';
    return simulated > original ? 'improved' : 'worsened';
  };

  const formatCreatorScore = (value: number) => Math.round(value);
  const formatMarketCap = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return Math.round(value).toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🎮 What If Simulator
      </h3>
      
      {/* Creator Score Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Creator Score: <span className="text-blue-600 font-bold">{formatCreatorScore(creatorScore)}</span>
          </label>
          <span className="text-xs text-gray-500">
            Current: {formatCreatorScore(currentCreatorScore)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          value={creatorScore}
          onChange={(e) => setCreatorScore(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>500</span>
          <span>1000</span>
        </div>
      </div>

      {/* Market Cap Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">
            Market Cap: <span className="text-green-600 font-bold">{formatMarketCap(marketCap)} USDC</span>
          </label>
          <span className="text-xs text-gray-500">
            Current: {formatMarketCap(currentMarketCap)}
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1000000"
          step="1000"
          value={marketCap}
          onChange={(e) => setMarketCap(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0</span>
          <span>500K</span>
          <span>1M</span>
        </div>
      </div>

      {/* Simulation Results */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Current Ratio</div>
            <div className="text-lg font-bold text-gray-800">
              {(currentRatio * 1000).toFixed(2)}‰
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Simulated Ratio</div>
            <div className="text-lg font-bold text-blue-600">
              {(simulatedRatio * 1000).toFixed(2)}‰
            </div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">Simulation Status</div>
          <div className={`text-sm font-medium ${
            getChangeType(currentRatio, simulatedRatio) === 'improved' ? 'text-green-600' :
            getChangeType(currentRatio, simulatedRatio) === 'worsened' ? 'text-red-600' :
            'text-gray-600'
          }`}>
            {getChangeType(currentRatio, simulatedRatio) === 'improved' ? '📈 Improved' :
             getChangeType(currentRatio, simulatedRatio) === 'worsened' ? '📉 Worsened' :
             '➡️ No Change'}
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={() => {
          setCreatorScore(currentCreatorScore);
          setMarketCap(currentMarketCap);
        }}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
      >
        🔄 Reset to Current Values
      </button>
    </div>
  );
}
