export interface NeynarUserResponse {
  users: Array<{
    object: string;
    fid: number;
    username: string;
    display_name: string;
    custody_address: string;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
      primary: {
        eth_address: string;
        sol_address: string;
      };
    };
    auth_addresses: Array<{
      address: string;
      app: {
        object: string;
        fid: number;
        username: string;
        display_name: string;
        pfp_url: string;
        custody_address: string;
        score: number;
      };
    }>;
  }>;
}

export class NeynarApiService {
  private static readonly BASE_URL = 'https://api.neynar.com/v2/farcaster';

  /**
   * Fetch user information by FID to get wallet addresses
   */
  static async getUserByFid(fid: number): Promise<string[]> {
    try {
      const apiKey = process.env.NEYNAR_API_KEY;
      if (!apiKey) {
        throw new Error('NEYNAR_API_KEY not found in environment variables');
      }

      console.log(`🔍 Fetching user data from Neynar API for FID: ${fid}`);
      
      const response = await fetch(`${this.BASE_URL}/user/bulk/?fids=${fid}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'x-neynar-experimental': 'false',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Neynar API error: ${response.status} ${response.statusText}`);
      }

      const data: NeynarUserResponse = await response.json();
      console.log('📡 Neynar API response:', data);

      if (!data.users || data.users.length === 0) {
        throw new Error(`No user found for FID: ${fid}`);
      }

      const user = data.users[0];
      console.log('👤 Neynar user data:', user);

      // Collect all wallet addresses from different sources
      const walletAddresses = new Set<string>();

      // Add custody address if it exists
      if (user.custody_address) {
        walletAddresses.add(user.custody_address.toLowerCase());
        console.log('💰 Custody address:', user.custody_address);
      }

      // Add verification addresses
      if (user.verifications && user.verifications.length > 0) {
        user.verifications.forEach(addr => {
          walletAddresses.add(addr.toLowerCase());
        });
        console.log('✅ Verification addresses:', user.verifications);
      }

      // Add verified ETH addresses
      if (user.verified_addresses?.eth_addresses) {
        user.verified_addresses.eth_addresses.forEach(addr => {
          walletAddresses.add(addr.toLowerCase());
        });
        console.log('🔐 Verified ETH addresses:', user.verified_addresses.eth_addresses);
      }

      // Add primary ETH address
      if (user.verified_addresses?.primary?.eth_address) {
        walletAddresses.add(user.verified_addresses.primary.eth_address.toLowerCase());
        console.log('⭐ Primary ETH address:', user.verified_addresses.primary.eth_address);
      }

      // Add auth addresses
      if (user.auth_addresses) {
        user.auth_addresses.forEach(auth => {
          walletAddresses.add(auth.address.toLowerCase());
        });
        console.log('🔑 Auth addresses:', user.auth_addresses.map(a => a.address));
      }

      const uniqueAddresses = Array.from(walletAddresses);
      console.log(`🎯 Found ${uniqueAddresses.length} unique wallet addresses:`, uniqueAddresses);

      return uniqueAddresses;
    } catch (error) {
      console.error('❌ Error fetching user from Neynar API:', error);
      throw error;
    }
  }
}
