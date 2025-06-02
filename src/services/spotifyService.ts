import { supabase } from "@/integrations/supabase/client";

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
  album: { 
    id: string;
    name: string; 
    images: Array<{ url: string }> 
  };
  external_urls: { spotify: string };
  popularity: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: Array<{ url: string }>;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: { total: number };
  public: boolean;
  images: Array<{ url: string }>;
}

export class SpotifyService {
  private static readonly AUTH_URL = 'https://accounts.spotify.com/authorize';
  private static readonly API_BASE = 'https://api.spotify.com/v1';
  
  static getAuthUrl(): string {
    // Use dedicated Spotify callback route - MUST match what's configured in Spotify App
    const redirectUri = `${window.location.origin}/auth/callback/spotify`;
    
    // Use the correct Supabase edge function URL
    const authUrlBase = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/spotify-auth-url`;
    
    console.log('SpotifyService: Requesting Spotify auth with redirect URI:', redirectUri);
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  static async exchangeCodeForToken(code: string): Promise<SpotifyTokenResponse> {
    const { data, error } = await supabase.functions.invoke('spotify-auth', {
      body: { code }
    });
    
    if (error) {
      console.error('Spotify token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
    
    return data;
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
    const response = await fetch(`${this.API_BASE}/me/top/tracks?time_range=${timeRange}&limit=50`, {
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

  static async getTopArtists(accessToken: string, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[]> {
    const response = await fetch(`${this.API_BASE}/me/top/artists?time_range=${timeRange}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }
    
    const data = await response.json();
    return data.items;
  }
  
  static async getRecentlyPlayed(accessToken: string): Promise<SpotifyTrack[]> {
    const response = await fetch(`${this.API_BASE}/me/player/recently-played?limit=50`, {
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

  static async getUserPlaylists(accessToken: string): Promise<SpotifyPlaylist[]> {
    const response = await fetch(`${this.API_BASE}/me/playlists?limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    const data = await response.json();
    return data.items;
  }

  static async getSavedTracks(accessToken: string): Promise<SpotifyTrack[]> {
    const response = await fetch(`${this.API_BASE}/me/tracks?limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch saved tracks');
    }
    
    const data = await response.json();
    return data.items.map((item: any) => item.track);
  }

  static async getFollowedArtists(accessToken: string): Promise<SpotifyArtist[]> {
    const response = await fetch(`${this.API_BASE}/me/following?type=artist&limit=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch followed artists');
    }
    
    const data = await response.json();
    return data.artists.items;
  }
}
