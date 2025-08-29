"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { UserProfile, RatioAnalysis } from '../../types/creator-score';
import { analyzeRatio, formatCurrency } from '../../lib/ratio-calculator';
import { fetchUserData } from '../../lib/mock-api';
import RatioMeter from './RatioMeter';
import WhatIfSlider from './WhatIfSlider';

export function CreatorScoreProfile() {
  const { context } = useMiniKit();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ratioAnalysis, setRatioAnalysis] = useState<RatioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<{
    originalRatio: number;
    simulatedRatio: number;
    originalCategory: string;
    simulatedCategory: string;
    change: 'improved' | 'worsened' | 'unchanged';
    simulatedCreatorScore: number;
    simulatedMarketCap: number;
  } | null>(null);

  const loadUserData = useCallback(async () => {
    if (!context?.user?.fid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading user data for FID:', context.user.fid);
      console.log('Environment check - API key exists:', !!process.env.NEXT_PUBLIC_TALENT_API_KEY);

      // Get user data using FID - we'll get wallet addresses from Neynar API
      console.log('=== FARCaster Context Debug ===');
      console.log('Full context:', context);
      console.log('User object:', context.user);
      console.log('User FID:', context.user.fid);
      console.log('User username:', context.user.username);
      console.log('User displayName:', context.user.displayName);
      console.log('User pfpUrl:', context.user.pfpUrl);
      console.log('All user properties:', Object.keys(context.user));
      
      // Debug: Log the entire user object structure
      console.log('User object JSON:', JSON.stringify(context.user, null, 2));
      
      // Use FID directly - we'll get wallet addresses from Neynar API
      const fid = context.user.fid;
      console.log('🎯 Using FID for data fetching:', fid);
      
      console.log('================================');
      
      const userData = await fetchUserData(fid);
      console.log('User data loaded:', userData);
      
      // Create user profile with proper type handling
      const profile: UserProfile = {
        fid: context.user.fid,
        username: context.user.username || 'unknown',
        displayName: context.user.displayName || 'Unknown User',
        pfpUrl: context.user.pfpUrl || '',
        creatorScore: userData.creatorScore || undefined,
        marketCap: userData.marketCap || undefined
      };

      console.log('Profile created:', profile);
      setUserProfile(profile);

      // Calculate ratio if we have both values
      if (userData.creatorScore && userData.marketCap) {
        console.log('Both values available, calculating ratio...');
        const ratio = userData.marketCap.value / userData.creatorScore.score;
        const analysis = analyzeRatio(ratio);
        setRatioAnalysis(analysis);
      } else {
        console.log('Missing data:', { 
          creatorScore: !!userData.creatorScore, 
          marketCap: !!userData.marketCap 
        });
      }
    } catch (err) {
      console.error('Error in loadUserData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    if (context?.user) {
      loadUserData();
    }
  }, [context?.user, loadUserData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️</div>
        <p className="text-red-600 text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No user data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Header */}
      <div className="flex items-center space-x-4">
        <div className="relative w-16 h-16">
          <Image 
            src={userProfile.pfpUrl || '/default-avatar.png'} 
            alt="Profile"
            fill
            className="rounded-full border-2 border-gray-200 object-cover"
            onError={(e) => {
              // Fallback to default avatar
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.png';
            }}
          />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {userProfile.displayName}
          </h2>
          <p className="text-gray-600">@{userProfile.username}</p>
        </div>
      </div>

      {/* Creator Score & Market Cap */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="text-purple-600 text-sm font-medium">Creator Score</div>
          <div className="text-2xl font-bold text-purple-900">
            {userProfile.creatorScore ? userProfile.creatorScore.score.toLocaleString() : 'N/A'}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="text-green-600 text-sm font-medium">Market Cap</div>
          <div className="text-2xl font-bold text-green-900">
            {userProfile.marketCap ? formatCurrency(userProfile.marketCap.value) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Ratio Analysis */}
      {ratioAnalysis && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-3xl">{ratioAnalysis.categoryEmoji}</div>
              <div className="relative group">
                <span className="text-blue-500 cursor-help text-lg">ⓘ</span>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  <div className="text-center">
                    <div className="font-medium mb-1">How Ratio Works</div>
                    <div className="text-xs">
                      <div>📈 <strong>Undervalued</strong> (ratio &lt; 0.001):</div>
                      <div className="ml-2">High creator score, low market cap</div>
                      <div className="ml-2">Potential for growth!</div>
                      <div className="mt-1">⚖️ <strong>Balanced</strong> (0.001-0.01):</div>
                      <div className="ml-2">Fair valuation</div>
                      <div className="mt-1">📉 <strong>Overvalued</strong> (ratio &gt; 0.01):</div>
                      <div className="ml-2">Low creator score, high market cap</div>
                      <div className="ml-2">Consider building more!</div>
                    </div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {ratioAnalysis.categoryLabel}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {ratioAnalysis.description}
            </p>
          </div>

          {/* Ratio Meter */}
          <RatioMeter 
            ratioAnalysis={ratioAnalysis}
            simulationResult={simulationResult}
          />

          {/* What If Slider */}
          <WhatIfSlider 
            currentRatio={ratioAnalysis.ratio}
            onSimulation={setSimulationResult}
            currentCreatorScore={userProfile?.creatorScore?.score || 0}
            currentMarketCap={userProfile?.marketCap?.value || 0}
          />
        </div>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && context && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🔍 Debug Info</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div><strong>FID:</strong> {context.user.fid}</div>
            <div><strong>Username:</strong> {context.user.username}</div>
            <div><strong>Identifier Used:</strong> {userProfile?.fid || 'Loading...'}</div>
            <div><strong>Creator Score:</strong> {userProfile?.creatorScore ? '✅ Loaded' : '❌ Not loaded'}</div>
            <div><strong>Market Cap:</strong> {userProfile?.marketCap ? '✅ Loaded' : '❌ Not loaded'}</div>
            {userProfile?.marketCap && (
              <div><strong>Market Cap Value:</strong> {userProfile.marketCap.readableValue} {userProfile.marketCap.unitOfMeasure}</div>
            )}
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!userProfile.creatorScore || !userProfile.marketCap ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-4xl mb-2">📊</div>
          <p className="text-gray-600 text-sm">
            Creator Score or Market Cap data not available yet.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            This data will be populated when available from the Talent API.
          </p>
        </div>
      ) : null}
    </div>
  );
}
