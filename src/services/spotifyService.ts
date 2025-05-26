
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images: Array<{ url: string; height: number; width: number }>;
  followers: { total: number };
  country: string;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images: Array<{ url: string }> };
  external_urls: { spotify: string };
}

export class SpotifyService {
  private static readonly AUTH_URL = 'https://accounts.spotify.com/authorize';
  private static readonly TOKEN_URL = 'https://accounts.spotify.com/api/token';
  private static readonly API_BASE = 'https://api.spotify.com/v1';
  
  static getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: process.env.SPOTIFY_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: `${window.location.origin}/settings`,
      scope: 'user-read-private user-read-email user-top-read user-read-recently-played playlist-read-private',
      state: Math.random().toString(36).substring(7)
    });
    
    return `${this.AUTH_URL}?${params.toString()}`;
  }
  
  static async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
    const response = await fetch('/api/spotify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code })
    });
    
    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }
    
    return response.json();
  }
  
  static async getUserProfile(accessToken: string): Promise<SpotifyProfile> {
    const response = await fetch(`${this.API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return response.json();
  }
  
  static async getTopTracks(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
    const response = await fetch(`${this.API_BASE}/me/top/tracks?time_range=${timeRange}&limit=20`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch top tracks');
    }
    
    const data = await response.json();
    return data.items;
  }
  
  static async getRecentlyPlayed(accessToken: string): Promise<SpotifyTrack[]> {
    const response = await fetch(`${this.API_BASE}/me/player/recently-played?limit=20`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch recently played tracks');
    }
    
    const data = await response.json();
    return data.items.map((item: any) => item.track);
  }
}
