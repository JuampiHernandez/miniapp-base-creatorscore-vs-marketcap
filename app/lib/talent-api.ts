import { TalentApiResponse, CredentialsResponse, Credential } from '../types/creator-score';

// Function that uses our server-side API route for creator score
export async function fetchCreatorScoreViaApi(fid: number): Promise<TalentApiResponse> {
  try {
    console.log('Fetching creator score via API route for FID:', fid);
    
    const response = await fetch(`/api/creator-score?fid=${fid}`);
    
    if (!response.ok) {
      throw new Error(`API route error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Creator score result:', result);
    
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

// Function to fetch credentials (including market cap) via API route
export async function fetchCredentialsViaApi(fid: number, slug: string = 'zora'): Promise<CredentialsResponse> {
  try {
    console.log('Fetching credentials via API route for FID:', fid, 'slug:', slug);
    
    const response = await fetch(`/api/credentials?fid=${fid}&slug=${slug}`);
    
    if (!response.ok) {
      throw new Error(`API route error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Credentials result:', result);
    
    if (result.success && result.data?.credentials) {
      return {
        success: true,
        data: {
          credentials: result.data.credentials,
        },
      };
    } else {
      return {
        success: false,
        error: 'Invalid response from API route',
      };
    }
  } catch (error) {
    console.error('Error fetching credentials via API route:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch credentials via API route',
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

// Main function to fetch market cap data
export async function fetchMarketCap(fid: number): Promise<{ success: boolean; data?: { marketCap: number; readableValue: string; unitOfMeasure: string }; error?: string }> {
  try {
    console.log('Attempting to fetch market cap for FID:', fid);
    
    // Use the server-side API route for credentials
    const result = await fetchCredentialsViaApi(fid, 'zora');
    
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

