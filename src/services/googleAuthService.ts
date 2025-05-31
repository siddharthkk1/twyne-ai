
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
    
    // Enhanced pre-OAuth data preservation
    this.preserveOnboardingDataForOAuth();
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  /**
   * Enhanced data preservation before OAuth with multiple backup strategies
   */
  private static preserveOnboardingDataForOAuth(): void {
    try {
      console.log('GoogleAuthService: Starting enhanced data preservation...');
      
      // Get all onboarding-related data
      const onboardingData = {
        profile: localStorage.getItem('onboardingProfile'),
        userName: localStorage.getItem('onboardingUserName'),
        conversation: localStorage.getItem('onboardingConversation'),
        promptMode: localStorage.getItem('onboardingPromptMode')
      };
      
      console.log('GoogleAuthService: Current onboarding data:', {
        hasProfile: !!onboardingData.profile,
        hasUserName: !!onboardingData.userName,
        hasConversation: !!onboardingData.conversation,
        hasPromptMode: !!onboardingData.promptMode
      });
      
      if (onboardingData.profile || onboardingData.userName || onboardingData.conversation) {
        const timestamp = Date.now();
        
        // Strategy 1: Store in sessionStorage (survives redirects but not new tabs)
        const sessionBackup = {
          ...onboardingData,
          timestamp,
          source: 'pre-oauth-backup'
        };
        sessionStorage.setItem('onboardingBackup', JSON.stringify(sessionBackup));
        console.log('GoogleAuthService: Stored backup in sessionStorage');
        
        // Strategy 2: Enhanced localStorage backup with random suffix to avoid conflicts
        const backupKey = `onboardingBackup_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(backupKey, JSON.stringify(sessionBackup));
        localStorage.setItem('latestBackupKey', backupKey);
        console.log('GoogleAuthService: Stored backup in localStorage with key:', backupKey);
        
        // Strategy 3: Store individual backup items with OAuth prefix
        if (onboardingData.profile) {
          localStorage.setItem('oauth_onboardingProfile', onboardingData.profile);
          sessionStorage.setItem('oauth_onboardingProfile', onboardingData.profile);
        }
        if (onboardingData.userName) {
          localStorage.setItem('oauth_onboardingUserName', onboardingData.userName);
          sessionStorage.setItem('oauth_onboardingUserName', onboardingData.userName);
        }
        if (onboardingData.conversation) {
          localStorage.setItem('oauth_onboardingConversation', onboardingData.conversation);
          sessionStorage.setItem('oauth_onboardingConversation', onboardingData.conversation);
        }
        if (onboardingData.promptMode) {
          localStorage.setItem('oauth_onboardingPromptMode', onboardingData.promptMode);
          sessionStorage.setItem('oauth_onboardingPromptMode', onboardingData.promptMode);
        }
        
        // Strategy 4: Temporary database storage for anonymous users
        this.storeDataInTempTable(sessionBackup);
        
        console.log('GoogleAuthService: All backup strategies completed');
      } else {
        console.log('GoogleAuthService: No onboarding data to preserve');
      }
    } catch (error) {
      console.error('GoogleAuthService: Error in data preservation:', error);
    }
  }
  
  /**
   * Store data temporarily in database for recovery
   */
  private static async storeDataInTempTable(data: any): Promise<void> {
    try {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await supabase
        .from('onboarding_data')
        .insert({
          user_id: tempId,
          profile_data: data.profile ? JSON.parse(data.profile) : {},
          conversation_data: data.conversation ? JSON.parse(data.conversation) : {},
          prompt_mode: data.promptMode || 'structured',
          is_anonymous: true
        });
      
      if (!error) {
        localStorage.setItem('tempOnboardingId', tempId);
        console.log('GoogleAuthService: Stored data in temp database table with ID:', tempId);
      }
    } catch (error) {
      console.error('GoogleAuthService: Error storing temp data:', error);
    }
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
    
    return data;
  }
}
