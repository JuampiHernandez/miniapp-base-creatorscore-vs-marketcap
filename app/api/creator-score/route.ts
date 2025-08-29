import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const wallet = searchParams.get('wallet');
    
    if (!fid && !wallet) {
      return NextResponse.json({ error: 'Either FID or wallet parameter is required' }, { status: 400 });
    }

    const apiKey = process.env.TALENT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Use wallet if provided, otherwise use FID
    const identifier = wallet || fid;
    const accountSource = wallet ? 'wallet' : 'farcaster';
    
    console.log(`Using identifier: ${identifier}, account_source: ${accountSource}`);
    
    try {
      const url = `https://api.talentprotocol.com/score?id=${identifier}&account_source=${accountSource}&scorer_slug=creator_score`;
      console.log(`Fetching creator score: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'X-API-KEY': apiKey,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Creator score response:`, data);
        
        // Check if we have valid score data
        if (data.score && data.score.points !== undefined) {
          console.log(`Found creator score:`, data.score.points);
          return NextResponse.json(data);
        }
      }
      
      // If no valid response found, return error
      console.log('No valid creator score found');
      return NextResponse.json(
        { error: 'Creator score not found' },
        { status: 404 }
      );
      
    } catch (error) {
      console.error('Error fetching creator score:', error);
      return NextResponse.json(
        { error: 'Failed to fetch creator score' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error in creator score API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
