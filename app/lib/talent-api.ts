import { CreatorScore, TalentApiResponse, CredentialsResponse, Credential } from '../types/creator-score';

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

// Function that uses our server-side API route for credentials
export async function fetchCredentialsViaApi(identifier: number | string): Promise<CredentialsResponse> {
  try {
    const response = await fetch(`/api/credentials?${typeof identifier === 'string' ? 'wallet' : 'fid'}=${identifier}`);
    if (!response.ok) {
      console.error('Credentials API error:', response.status);
      return {
        success: false,
        error: `API route error: ${response.status}`,
      };
    }
    
    const data = await response.json();
    console.log('Credentials result:', data);
    
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching via API route:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch via API route',
    };
  }
}

// Function to extract market cap from credentials
export function extractMarketCapFromCredentials(credentials: Credential[]): { value: number; readableValue: string; unitOfMeasure: string } | null {
  const marketCapCredential = credentials.find(cred => cred.name === 'Creator Coin Market Cap');
  
  if (!marketCapCredential) {
    return null;
  }
  
  // Get the raw value from data points
  const dataPoint = marketCapCredential.points_calculation_logic.data_points[0];
  if (!dataPoint) {
    return null;
  }
  
  // Parse the numeric value (e.g., "321.89094426528992 USDC" -> 321.89)
  const numericValue = parseFloat(dataPoint.value.split(' ')[0]);
  
  if (isNaN(numericValue)) {
    return null;
  }
  
  return {
    value: numericValue,
    readableValue: marketCapCredential.readable_value,
    unitOfMeasure: marketCapCredential.uom,
  };
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

// Main function to fetch market cap data
export async function fetchMarketCap(identifier: number | string): Promise<{ success: boolean; data?: { marketCap: number; readableValue: string; unitOfMeasure: string }; error?: string }> {
  try {
    console.log('Attempting to fetch market cap for identifier:', identifier);
    
    // Use the server-side API route for credentials
    const result = await fetchCredentialsViaApi(identifier);
    
    if (result.success && result.data?.credentials) {
      const marketCapData = extractMarketCapFromCredentials(result.data.credentials);
      
      if (marketCapData) {
        return {
          success: true,
          data: {
            marketCap: marketCapData.value,
            readableValue: marketCapData.readableValue,
            unitOfMeasure: marketCapData.unitOfMeasure,
          },
        };
      } else {
        return {
          success: false,
          error: 'Market cap data not found in credentials',
        };
      }
    } else {
      return {
        success: false,
        error: result.error || 'Failed to fetch credentials',
      };
    }
    
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    // Return mock data as fallback
    return {
      success: true,
      data: {
        marketCap: Math.floor(Math.random() * 5000000) + 100000, // Random market cap between 100K-5M
        readableValue: 'Mock Data',
        unitOfMeasure: 'USDC',
      },
    };
  }
}

