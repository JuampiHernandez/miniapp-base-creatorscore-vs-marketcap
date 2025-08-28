"use client";

import { useEffect, useState } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { UserProfile, RatioAnalysis } from '../../types/creator-score';
import { analyzeRatio, formatCurrency, formatRatio } from '../../lib/ratio-calculator';
import { fetchUserData } from '../../lib/mock-api';
import { RatioMeter } from './RatioMeter';
import { WhatIfSlider } from './WhatIfSlider';

export function CreatorScoreProfile() {
  const { context } = useMiniKit();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [ratioAnalysis, setRatioAnalysis] = useState<RatioAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      if (!context?.user?.fid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const userData = await fetchUserData(context.user.fid);
        
        const profile: UserProfile = {
          fid: context.user.fid,
          username: context.user.username || 'unknown',
          displayName: context.user.displayName || 'Unknown User',
          pfpUrl: context.user.pfpUrl || '',
          ...userData,
        };

        setUserProfile(profile);

        // Calculate ratio if we have both values
        if (userData.creatorScore && userData.marketCap) {
          const ratio = userData.marketCap.value / userData.creatorScore.score;
          const analysis = analyzeRatio(ratio);
          setRatioAnalysis(analysis);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [context?.user?.fid]);

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
        <img 
          src={userProfile.pfpUrl || '/default-avatar.png'} 
          alt="Profile"
          className="w-16 h-16 rounded-full border-2 border-gray-200"
          onError={(e) => {
            e.currentTarget.src = '/default-avatar.png';
          }}
        />
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
            <div className="text-3xl mb-2">{ratioAnalysis.categoryEmoji}</div>
            <h3 className="text-lg font-semibold text-gray-900">
              {ratioAnalysis.categoryLabel}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {ratioAnalysis.description}
            </p>
          </div>

          <RatioMeter ratio={ratioAnalysis.ratio} category={ratioAnalysis.category} />
          
          <div className="text-center">
            <div className="text-sm text-gray-500">Ratio</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatRatio(ratioAnalysis.ratio)}
            </div>
          </div>
        </div>
      )}

      {/* What If Slider */}
      {userProfile.creatorScore && userProfile.marketCap && (
        <WhatIfSlider 
          currentCreatorScore={userProfile.creatorScore.score}
          currentMarketCap={userProfile.marketCap.value}
        />
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
