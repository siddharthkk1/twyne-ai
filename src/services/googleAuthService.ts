
import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow with onboarding data preservation using OAuth metadata
   * @param onboardingData - Optional onboarding data to preserve through OAuth
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with OAuth metadata approach');
    
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Prepare OAuth options with onboarding data
      let oauthOptions: any = {
        redirectTo
      };
      
      // If we have onboarding data, include it in the OAuth metadata
      if (onboardingData) {
        console.log('📊 GoogleAuthService: Including onboarding data in OAuth metadata');
        console.log('📊 GoogleAuthService: Data details:', {
          hasProfile: !!onboardingData.profile,
          hasConversation: !!onboardingData.conversation,
          userName: onboardingData.userName,
          promptMode: onboardingData.promptMode
        });
        
        // Include onboarding data in OAuth options
        oauthOptions.data = {
          onboarding_profile: onboardingData.profile || {},
          onboarding_conversation: onboardingData.conversation || {},
          onboarding_prompt_mode: onboardingData.promptMode || 'structured',
          onboarding_user_name: onboardingData.userName || ''
        };
        
        console.log('✅ GoogleAuthService: OAuth metadata prepared with onboarding data');
      }
      
      console.log('🔗 GoogleAuthService: Starting OAuth with options:', {
        redirectTo,
        hasData: !!oauthOptions.data
      });
      
      // Use Supabase's native Google OAuth with metadata
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: oauthOptions
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
        throw error;
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully with metadata approach');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Retrieve onboarding data using onboarding ID (legacy support)
   * @param onboardingId - Onboarding ID from URL query parameter
   */
  static async retrieveOnboardingData(onboardingId: string) {
    try {
      console.log('🔍 GoogleAuthService: Retrieving onboarding data for ID:', onboardingId);
      
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('id', onboardingId)
        .eq('is_anonymous', true)
        .single();
      
      if (error) {
        console.error('❌ GoogleAuthService: Error retrieving onboarding data:', error);
        return null;
      }
      
      if (data) {
        console.log('✅ GoogleAuthService: Successfully retrieved onboarding data');
        console.log('📊 GoogleAuthService: Data details:', {
          hasProfileData: !!data.profile_data && Object.keys(data.profile_data).length > 0,
          hasConversationData: !!data.conversation_data && Object.keys(data.conversation_data).length > 0,
          promptMode: data.prompt_mode
        });
        
        return {
          id: data.id,
          profile: data.profile_data,
          conversation: data.conversation_data,
          promptMode: data.prompt_mode
        };
      }
      
      console.log('⚠️ GoogleAuthService: No onboarding data found for ID');
      return null;
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in retrieveOnboardingData:', error);
      return null;
    }
  }

  /**
   * Clean up temporary onboarding data record (legacy support)
   * @param onboardingId - Onboarding ID identifying the record to clean up
   */
  static async cleanupOnboardingData(onboardingId: string) {
    try {
      console.log('🧹 GoogleAuthService: Cleaning up onboarding data for ID:', onboardingId);
      
      const { error } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('id', onboardingId)
        .eq('is_anonymous', true);
      
      if (error) {
        console.error('❌ GoogleAuthService: Error cleaning up onboarding data:', error);
      } else {
        console.log('✅ GoogleAuthService: Successfully cleaned up temporary onboarding data');
      }
      
      // Also clean up localStorage
      localStorage.removeItem('temp_onboarding_id');
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in cleanupOnboardingData:', error);
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
