
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
    // Get the actual auth URL from our edge function with correct redirect URI
    return `/api/google-auth-url?redirect_uri=${encodeURIComponent(`${window.location.origin}/auth/callback`)}`;
  }
  
  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: { code }
    });
    
    if (error) {
      throw new Error('Failed to exchange code for token');
    }
    
    return data;
  }
}
