
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
    const params = new URLSearchParams({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: `${window.location.origin}/settings`,
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: 'youtube_auth'
    });
    
    return `${this.AUTH_URL}?${params.toString()}`;
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
