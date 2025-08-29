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
  console.log('Searching through credentials for market cap data...');
  
  // First, try to find "Creator Coin Market Cap" credential
  const marketCapCredential = credentials.find(cred => cred.name === 'Creator Coin Market Cap');
  
  if (marketCapCredential) {
    console.log('Found Creator Coin Market Cap credential:', marketCapCredential);
    const dataPoint = marketCapCredential.points_calculation_logic.data_points[0];
    if (dataPoint) {
      const numericValue = parseFloat(dataPoint.value.split(' ')[0]);
      if (!isNaN(numericValue)) {
        return {
          value: numericValue,
          readableValue: marketCapCredential.readable_value,
          unitOfMeasure: marketCapCredential.uom,
        };
      }
    }
  }
  
  // If not found, search for any credential that might contain market cap data
  console.log('Searching for alternative market cap sources...');
  
  // Look for Zora-related credentials that might have market cap info
  const zoraCredentials = credentials.filter(cred => 
    cred.data_issuer_slug === 'zora' || 
    cred.name.toLowerCase().includes('market') ||
    cred.name.toLowerCase().includes('cap') ||
    cred.name.toLowerCase().includes('coin')
  );
  
  console.log('Zora-related credentials found:', zoraCredentials.length);
  zoraCredentials.forEach(cred => {
    console.log(`- ${cred.name}: ${cred.readable_value} ${cred.uom}`);
  });
  
  // Look for any credential with USDC or USD values that might be market cap
  const usdcCredentials = credentials.filter(cred => 
    cred.uom === 'USDC' || 
    cred.uom === 'USD' ||
    cred.readable_value.includes('K') ||
    cred.readable_value.includes('M')
  );
  
  console.log('USDC/USD credentials found:', usdcCredentials.length);
  usdcCredentials.forEach(cred => {
    console.log(`- ${cred.name}: ${cred.readable_value} ${cred.uom} (${cred.data_issuer_name})`);
  });
  
  // If we found any potential market cap data, return the first one
  if (usdcCredentials.length > 0) {
    const firstUsdcCred = usdcCredentials[0];
    console.log('Using first USDC credential as potential market cap:', firstUsdcCred);
    
    // Try to extract numeric value
    if (firstUsdcCred.points_calculation_logic.data_points && firstUsdcCred.points_calculation_logic.data_points.length > 0) {
      const dataPoint = firstUsdcCred.points_calculation_logic.data_points[0];
      const numericValue = parseFloat(dataPoint.value.split(' ')[0]);
      if (!isNaN(numericValue)) {
        return {
          value: numericValue,
          readableValue: firstUsdcCred.readable_value,
          unitOfMeasure: firstUsdcCred.uom,
        };
      }
    }
  }
  
  console.log('No market cap data found in any credentials');
  return null;
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

