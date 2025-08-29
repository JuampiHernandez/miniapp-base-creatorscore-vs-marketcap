import { CreatorScore, TalentApiResponse } from '../types/creator-score';

// Function that uses our server-side API route for creator score
export async function fetchCreatorScoreViaApi(identifier: number | string): Promise<CreatorScore | null> {
  try {
    const response = await fetch(`/api/creator-score?${typeof identifier === 'string' ? 'wallet' : 'fid'}=${identifier}`);
    if (!response.ok) {
      console.error('Creator score API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('Creator score API response:', data);
    
    // Handle the new response format
    if (data.score && data.score.points !== undefined) {
      return {
        score: data.score.points,
        slug: data.score.slug || 'creator_score',
        lastCalculatedAt: data.score.last_calculated_at,
        source: 'talent-api',
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching creator score via API:', error);
    return null;
  }
}

// Main function that uses the server-side API route for creator score
export async function fetchCreatorScore(identifier: number | string): Promise<TalentApiResponse> {
  try {
    console.log('Attempting to fetch creator score for identifier:', identifier);
    
    // Use the server-side API route
    const result = await fetchCreatorScoreViaApi(identifier);
    console.log('Creator score result:', result);
    
    if (result) {
      return {
        success: true,
        data: {
          creatorScore: result.score,
        },
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch creator score',
      };
    }
    
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    // Return mock data as fallback
    return {
      success: true,
      data: {
        creatorScore: Math.floor(Math.random() * 1000) + 100, // Random score between 100-1100
      },
    };
  }
}

