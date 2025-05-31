
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
    
    // Simple data preservation for testing - just store what we have
    this.preserveTestDataForOAuth();
    
    return `${authUrlBase}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }
  
  /**
   * Simplified data preservation for validation test
   */
  private static preserveTestDataForOAuth(): void {
    try {
      console.log('🔄 GoogleAuthService: Starting simple data preservation for test...');
      
      // Check for test data
      const testData = localStorage.getItem('oauth_test_data');
      
      if (testData) {
        console.log('📊 GoogleAuthService: Test data found:', testData);
        
        // Store with OAuth-specific key for recovery
        localStorage.setItem('oauth_preserved_test_data', testData);
        sessionStorage.setItem('oauth_preserved_test_data', testData);
        
        console.log('✅ GoogleAuthService: Test data preserved successfully');
      } else {
        console.log('⚠️ GoogleAuthService: No test data to preserve');
      }
      
      // For onboarding data preservation (if exists)
      const onboardingData = {
        profile: localStorage.getItem('onboardingProfile'),
        userName: localStorage.getItem('onboardingUserName'),
        conversation: localStorage.getItem('onboardingConversation'),
        promptMode: localStorage.getItem('onboardingPromptMode')
      };
      
      if (onboardingData.profile || onboardingData.userName) {
        console.log('📊 GoogleAuthService: Onboarding data found, preserving...');
        
        // Store with OAuth-specific keys
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
        
        console.log('✅ GoogleAuthService: Onboarding data preserved successfully');
      }
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in data preservation:', error);
    }
  }
  
  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    console.log('🔄 GoogleAuthService: Starting token exchange');
    console.log('🔍 GoogleAuthService: Code length:', code?.length || 0);
    console.log('🔍 GoogleAuthService: Code preview:', code?.substring(0, 20) + '...');
    
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: { code }
    });
    
    if (error) {
      console.error('❌ GoogleAuthService: Token exchange error:', error);
      throw new Error('Failed to exchange code for token');
    }
    
    if (!data || !data.access_token) {
      console.error('❌ GoogleAuthService: Invalid token response:', data);
      throw new Error('Invalid token response from server');
    }
    
    console.log('✅ GoogleAuthService: Token exchange successful');
    
    return data;
  }
}
