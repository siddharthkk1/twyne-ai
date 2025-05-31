
import { supabase } from "@/integrations/supabase/client";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class GoogleAuthService {
  private static readonly AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  
  static getYouTubeAuthUrl(): string {
    // Determine the correct origin based on current domain
    const currentOrigin = window.location.origin;
    
    // Use dedicated YouTube callback route
    const redirectUri = `${currentOrigin}/auth/callback/youtube`;
    
    // Handle different domains
    let authUrlBase;
    if (currentOrigin.includes('lovableproject.com')) {
      authUrlBase = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url`;
    } else if (currentOrigin.includes('lovable.app')) {
      authUrlBase = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url`;
    } else {
      // Local development or other domains
      authUrlBase = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url`;
    }
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: { code }
    });
    
    if (error) {
      console.error('Google token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
    
    return data;
  }
}
