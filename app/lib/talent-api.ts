import { TalentApiResponse } from '../types/creator-score';

// Function that uses our server-side API route
export async function fetchCreatorScoreViaApi(fid: number): Promise<TalentApiResponse> {
  try {
    console.log('Fetching creator score via API route for FID:', fid);
    
    const response = await fetch(`/api/creator-score?fid=${fid}`);
    
    if (!response.ok) {
      throw new Error(`API route error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('API route result:', result);
    
    if (result.success && result.data?.score?.points) {
      return {
        success: true,
        data: {
          creatorScore: result.data.score.points,
        },
      };
    } else {
      return {
        success: false,
        error: 'Invalid response from API route',
      };
    }
  } catch (error) {
    console.error('Error fetching via API route:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch via API route',
    };
  }
}

// Main function that uses the server-side API route
export async function fetchCreatorScore(fid: number): Promise<TalentApiResponse> {
  try {
    console.log('Attempting to fetch creator score for FID:', fid);
    
    // Use the server-side API route
    const result = await fetchCreatorScoreViaApi(fid);
    console.log('Creator score result:', result);
    return result;
    
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

