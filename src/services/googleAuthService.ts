
import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow using standardized redirect URL method
   * @param onboardingData - Optional onboarding data to preserve through localStorage and URL params
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with redirect URL approach');
    
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      
      // Store onboarding data in localStorage for retrieval after OAuth
      if (onboardingData) {
        console.log('💾 GoogleAuthService: Storing onboarding data in localStorage');
        const tempOnboardingId = crypto.randomUUID();
        
        // Store in localStorage with temp ID for retrieval
        localStorage.setItem('temp_onboarding_id', tempOnboardingId);
        localStorage.setItem('onboarding_profile', JSON.stringify(onboardingData.profile || {}));
        localStorage.setItem('onboarding_conversation', JSON.stringify(onboardingData.conversation || {}));
        localStorage.setItem('onboarding_user_name', onboardingData.userName || '');
        localStorage.setItem('onboarding_prompt_mode', onboardingData.promptMode || 'structured');
        
        console.log('✅ GoogleAuthService: Onboarding data stored with temp ID:', tempOnboardingId);
        
        // Also store in database for backup (in case localStorage is cleared)
        try {
          await supabase
            .from('onboarding_data')
            .insert({
              id: tempOnboardingId,
              user_id: tempOnboardingId, // Use temp ID as user_id for anonymous records
              profile_data: onboardingData.profile || {},
              conversation_data: onboardingData.conversation || {},
              prompt_mode: onboardingData.promptMode || 'structured',
              is_anonymous: true
            });
          
          console.log('✅ GoogleAuthService: Backup onboarding data stored in database');
        } catch (dbError) {
          console.warn('⚠️ GoogleAuthService: Failed to store backup onboarding data:', dbError);
          // Continue with OAuth even if backup storage fails
        }
        
        // Add onboarding ID to redirect URL for retrieval
        const urlWithOnboarding = `${redirectTo}?onboarding_id=${tempOnboardingId}`;
        
        console.log('🔗 GoogleAuthService: Starting OAuth with onboarding redirect:', urlWithOnboarding);
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: urlWithOnboarding
          }
        });
        
        if (error) {
          console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
          throw error;
        }
        
      } else {
        console.log('🔗 GoogleAuthService: Starting OAuth without onboarding data');
        
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo
          }
        });
        
        if (error) {
          console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
          throw error;
        }
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully with redirect URL method');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Retrieve onboarding data using onboarding ID from URL or localStorage
   * @param onboardingId - Onboarding ID from URL query parameter or localStorage
   */
  static async retrieveOnboardingData(onboardingId: string) {
    try {
      console.log('🔍 GoogleAuthService: Retrieving onboarding data for ID:', onboardingId);
      
      // Try to get from localStorage first (most reliable)
      const localProfile = localStorage.getItem('onboarding_profile');
      const localConversation = localStorage.getItem('onboarding_conversation');
      const localUserName = localStorage.getItem('onboarding_user_name');
      const localPromptMode = localStorage.getItem('onboarding_prompt_mode');
      const localTempId = localStorage.getItem('temp_onboarding_id');
      
      if (localProfile && localConversation && localTempId === onboardingId) {
        console.log('✅ GoogleAuthService: Retrieved onboarding data from localStorage');
        
        return {
          id: onboardingId,
          profile: JSON.parse(localProfile),
          conversation: JSON.parse(localConversation),
          userName: localUserName || '',
          promptMode: localPromptMode || 'structured'
        };
      }
      
      // Fallback to database if localStorage is not available
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
        console.log('✅ GoogleAuthService: Successfully retrieved onboarding data from database');
        
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
   * Clean up temporary onboarding data after successful OAuth
   * @param onboardingId - Onboarding ID identifying the record to clean up
   */
  static async cleanupOnboardingData(onboardingId: string) {
    try {
      console.log('🧹 GoogleAuthService: Cleaning up onboarding data for ID:', onboardingId);
      
      // Clean up localStorage
      localStorage.removeItem('temp_onboarding_id');
      localStorage.removeItem('onboarding_profile');
      localStorage.removeItem('onboarding_conversation');
      localStorage.removeItem('onboarding_user_name');
      localStorage.removeItem('onboarding_prompt_mode');
      
      // Clean up database record
      const { error } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('id', onboardingId)
        .eq('is_anonymous', true);
      
      if (error) {
        console.error('❌ GoogleAuthService: Error cleaning up database record:', error);
      } else {
        console.log('✅ GoogleAuthService: Successfully cleaned up temporary onboarding data');
      }
      
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
