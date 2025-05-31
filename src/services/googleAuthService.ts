
import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow with onboarding data preservation using Supabase native flow
   * @param onboardingData - Optional onboarding data to preserve through OAuth
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting simplified Google OAuth with Supabase native flow');
    
    try {
      // Prepare redirect URL
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log('🔗 GoogleAuthService: Redirect URL:', redirectTo);
      
      // Prepare options for OAuth
      const options: any = {
        redirectTo,
      };
      
      // If we have onboarding data, pass it through OAuth metadata
      if (onboardingData) {
        console.log('📊 GoogleAuthService: Including onboarding data in OAuth flow:', {
          hasProfile: !!onboardingData.profile,
          hasConversation: !!onboardingData.conversation,
          userName: onboardingData.userName,
          promptMode: onboardingData.promptMode
        });
        
        // Pass onboarding data through OAuth options.data which gets stored in raw_user_meta_data
        options.data = {
          onboarding_profile: onboardingData.profile,
          onboarding_conversation: onboardingData.conversation,
          onboarding_user_name: onboardingData.userName,
          onboarding_prompt_mode: onboardingData.promptMode || 'structured'
        };
        
        console.log('💾 GoogleAuthService: OAuth data prepared:', {
          dataKeys: Object.keys(options.data),
          profileName: onboardingData.profile?.name,
          conversationLength: onboardingData.conversation?.messages?.length || 0
        });
      }
      
      // Use Supabase's native Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
        throw error;
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully');
      // The browser will redirect to Google, so we don't return here
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Get YouTube OAuth URL for connecting YouTube accounts
   */
  static getYouTubeAuthUrl(): string {
    // Use the edge function to get the YouTube auth URL
    const origin = window.location.origin;
    const redirectUri = `${origin}/youtube/callback`;
    
    // Call the edge function that generates the YouTube auth URL
    return `${origin}/api/google-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
  }

  /**
   * Exchange authorization code for access token
   * @param code - Authorization code from OAuth callback
   */
  static async exchangeCodeForToken(code: string) {
    try {
      console.log('🔄 GoogleAuthService: Exchanging code for token');
      
      const response = await fetch('/api/google-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GoogleAuthService: Token exchange failed:', errorText);
        throw new Error(`Token exchange failed: ${response.status}`);
      }

      const tokenData = await response.json();
      console.log('✅ GoogleAuthService: Token exchange successful');
      
      return tokenData;
    } catch (error) {
      console.error('❌ GoogleAuthService: Error exchanging code for token:', error);
      throw error;
    }
  }
}
