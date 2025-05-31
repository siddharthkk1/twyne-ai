
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
    // Always use the current origin for consistency
    const currentOrigin = window.location.origin;
    
    // Use the standard auth callback route to ensure proper session handling
    const redirectUri = `${currentOrigin}/auth/callback`;
    
    // Use the Supabase function to generate the auth URL
    const authUrlBase = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url`;
    
    console.log('GoogleAuthService: Requesting YouTube auth');
    console.log('GoogleAuthService: Current origin:', currentOrigin);
    console.log('GoogleAuthService: Redirect URI:', redirectUri);
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    console.log('GoogleAuthService: Starting token exchange');
    console.log('GoogleAuthService: Code length:', code?.length || 0);
    
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: { code }
    });
    
    if (error) {
      console.error('GoogleAuthService: Token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
    
    if (!data || !data.access_token) {
      console.error('GoogleAuthService: Invalid token response:', data);
      throw new Error('Invalid token response from server');
    }
    
    console.log('GoogleAuthService: Token exchange successful');
    console.log('GoogleAuthService: Token data keys:', Object.keys(data));
    
    return data;
  }
}
