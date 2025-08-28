import { TalentApiResponse, CreatorScore } from '../types/creator-score';

const TALENT_API_BASE_URL = 'https://api.talentprotocol.com/score';

interface TalentApiConfig {
  apiKey: string;
}

class TalentApiService {
  private apiKey: string;

  constructor(config: TalentApiConfig) {
    this.apiKey = config.apiKey;
  }

  private async makeRequest<T>(url: string): Promise<T> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Talent API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async fetchCreatorScore(fid: number): Promise<TalentApiResponse> {
    try {
      const url = `${TALENT_API_BASE_URL}?id=${fid}&account_source=farcaster&scorer_slug=creator_score`;
      const data = await this.makeRequest<any>(url);

      if (data.score && typeof data.score.points === 'number') {
        return {
          success: true,
          data: {
            creatorScore: data.score.points,
          },
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format from Talent API',
        };
      }
    } catch (error) {
      console.error('Error fetching creator score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch creator score',
      };
    }
  }

  async fetchBuilderScore(fid: number): Promise<TalentApiResponse> {
    try {
      const url = `${TALENT_API_BASE_URL}?id=${fid}&account_source=farcaster&scorer_slug=builder_score`;
      const data = await this.makeRequest<any>(url);

      if (data.score && typeof data.score.points === 'number') {
        return {
          success: true,
          data: {
            creatorScore: data.score.points,
          },
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format from Talent API',
        };
      }
    } catch (error) {
      console.error('Error fetching builder score:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch builder score',
      };
    }
  }
}

// Create a singleton instance
let talentApiService: TalentApiService | null = null;

export function getTalentApiService(): TalentApiService {
  if (!talentApiService) {
    const apiKey = process.env.NEXT_PUBLIC_TALENT_API_KEY;
    
    if (!apiKey) {
      throw new Error('TALENT_API_KEY environment variable is not set');
    }
    
    talentApiService = new TalentApiService({ apiKey });
  }
  
  return talentApiService;
}

// Fallback to mock data if API key is not available
export async function fetchCreatorScore(fid: number): Promise<TalentApiResponse> {
  try {
    const service = getTalentApiService();
    return await service.fetchCreatorScore(fid);
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

export async function fetchBuilderScore(fid: number): Promise<TalentApiResponse> {
  try {
    const service = getTalentApiService();
    return await service.fetchBuilderScore(fid);
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    // Return mock data as fallback
    return {
      success: true,
      data: {
        creatorScore: Math.floor(Math.random() * 800) + 200, // Random score between 200-1000
      },
    };
  }
}
