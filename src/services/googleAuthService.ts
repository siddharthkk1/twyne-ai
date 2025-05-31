
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
    
    // Check for onboarding data before starting OAuth
    const onboardingData = {
      profile: localStorage.getItem('onboardingProfile'),
      userName: localStorage.getItem('onboardingUserName'),
      conversation: localStorage.getItem('onboardingConversation'),
      promptMode: localStorage.getItem('onboardingPromptMode')
    };
    
    console.log('GoogleAuthService: Pre-OAuth localStorage check:', {
      hasProfile: !!onboardingData.profile,
      hasUserName: !!onboardingData.userName,
      hasConversation: !!onboardingData.conversation,
      hasPromptMode: !!onboardingData.promptMode
    });
    
    if (onboardingData.profile || onboardingData.userName) {
      console.log('GoogleAuthService: Onboarding data detected, ensuring persistence...');
      
      // Add timestamp to help track data persistence
      localStorage.setItem('oauthStartTime', Date.now().toString());
      
      // Store backup of critical data
      if (onboardingData.profile) {
        localStorage.setItem('onboardingProfileBackup', onboardingData.profile);
      }
      if (onboardingData.userName) {
        localStorage.setItem('onboardingUserNameBackup', onboardingData.userName);
      }
    }
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    console.log('GoogleAuthService: Starting token exchange');
    console.log('GoogleAuthService: Code length:', code?.length || 0);
    
    // Check if localStorage data is still present during token exchange
    const onboardingCheck = {
      profile: localStorage.getItem('onboardingProfile'),
      userName: localStorage.getItem('onboardingUserName'),
      conversation: localStorage.getItem('onboardingConversation'),
      promptMode: localStorage.getItem('onboardingPromptMode'),
      backup: localStorage.getItem('onboardingDataBackup')
    };
    
    console.log('GoogleAuthService: Token exchange localStorage check:', {
      hasProfile: !!onboardingCheck.profile,
      hasUserName: !!onboardingCheck.userName,
      hasConversation: !!onboardingCheck.conversation,
      hasPromptMode: !!onboardingCheck.promptMode,
      hasBackup: !!onboardingCheck.backup
    });
    
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
