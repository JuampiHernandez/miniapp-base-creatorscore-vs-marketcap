import { NextRequest, NextResponse } from 'next/server';

const TALENT_API_BASE_URL = 'https://api.talentprotocol.com/score';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    
    if (!fid) {
      return NextResponse.json(
        { error: 'FID parameter is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.TALENT_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Talent API key not configured' },
        { status: 500 }
      );
    }

    const url = `${TALENT_API_BASE_URL}?id=${fid}&account_source=farcaster&scorer_slug=creator_score`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Talent API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Error fetching creator score:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch creator score' 
      },
      { status: 500 }
    );
  }
}
