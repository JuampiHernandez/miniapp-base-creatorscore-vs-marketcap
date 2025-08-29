import { NextRequest, NextResponse } from 'next/server';

// Define proper types for credential data
interface CredentialDataPoint {
  id: number;
  name: string;
  value: string;
  is_maximum?: boolean;
  multiplier: number;
  readable_value: string;
  multiplication_result?: string;
}

interface Credential {
  account_source: string;
  calculating_score: boolean;
  category: string;
  data_issuer_name: string;
  data_issuer_slug: string;
  description: string;
  external_url: string;
  immutable: boolean;
  last_calculated_at: string | null;
  max_score: number;
  name: string;
  points: number;
  points_calculation_logic: {
    points: number;
    max_points: number;
    data_points: CredentialDataPoint[];
    points_description: string;
    points_number_calculated: number;
  };
  readable_value: string;
  slug: string;
  uom: string;
  updated_at: string | null;
}

interface ExtendedCredential extends Credential {
  source_slug: string;
  account_source: string;
}

interface CredentialsResponse {
  credentials: Credential[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');
    const wallet = searchParams.get('wallet');
    
    console.log('=== Credentials API Debug ===');
    console.log('Request URL:', request.url);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    console.log('FID parameter:', fid);
    console.log('Wallet parameter:', wallet);
    console.log('============================');
    
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
    console.log(`Identifier type: ${typeof identifier}`);
    console.log(`Identifier length: ${identifier?.toString().length}`);

    // Try multiple slugs to find Creator Coin Market Cap
    const slugsToTry = ['zora', 'talent', 'ethereum', 'coinbase', 'opensea', 'base'];
    const allCredentials: ExtendedCredential[] = [];
    
    for (const slug of slugsToTry) {
      try {
        const url = `https://api.talentprotocol.com/credentials?id=${identifier}&account_source=${accountSource}&slug=${slug}`;
        console.log(`Trying: ${accountSource}/${slug} with identifier: ${identifier}`);
        console.log(`Full API URL: ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'X-API-KEY': apiKey,
            'Accept': 'application/json',
          },
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response headers:`, Object.fromEntries(response.headers.entries()));

        if (response.ok) {
          const data = await response.json() as CredentialsResponse;
          console.log(`Response for ${accountSource}/${slug}:`, JSON.stringify(data, null, 2));
          
          // Collect all credentials for debugging
          if (data.credentials && data.credentials.length > 0) {
            allCredentials.push(...data.credentials.map((cred: Credential): ExtendedCredential => ({
              ...cred,
              source_slug: slug,
              account_source: accountSource
            })));
          }
          
          // Check if this response contains Creator Coin Market Cap
          if (data.credentials && data.credentials.some((cred: Credential) => 
            cred.name === 'Creator Coin Market Cap'
          )) {
            console.log(`Found Creator Coin Market Cap in ${accountSource}/${slug}`);
            return NextResponse.json(data);
          }
        } else {
          console.log(`API error for ${slug}: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.log(`Error response body:`, errorText);
        }
      } catch (error) {
        console.log(`Error with ${accountSource}/${slug}:`, error);
        continue; // Try next slug
      }
    }
    
    // If no Creator Coin Market Cap found, return all available credentials for debugging
    console.log('No Creator Coin Market Cap found. Available credentials:', allCredentials);
    
    if (allCredentials.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          credentials: allCredentials,
          debug: {
            message: 'No Creator Coin Market Cap found, but other credentials available',
            available_credentials: allCredentials.map((cred: ExtendedCredential) => ({
              name: cred.name,
              source: cred.source_slug,
              account_source: cred.account_source,
              points: cred.points,
              max_score: cred.max_score
            }))
          }
        }
      });
    }
    
    // If no credentials at all, return empty with debug info
    return NextResponse.json({
      success: true,
      data: {
        credentials: [],
        debug: {
          message: 'No credentials found for any slug',
          tried_combinations: slugsToTry.map(slug => `${accountSource}/${slug}`),
          identifier: identifier,
          account_source: accountSource,
          note: wallet ? 
            'Wallet address used but no credentials found. User may need to earn credentials first.' :
            'FID used but no credentials found. Try using wallet address instead.'
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
