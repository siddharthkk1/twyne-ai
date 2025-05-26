
import { supabase } from "@/integrations/supabase/client";

interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export class GoogleAuthService {
  static getYouTubeAuthUrl(): string {
    // Use our edge function to get the proper Google OAuth URL
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
