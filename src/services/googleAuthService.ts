import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow with onboarding data preservation using redirect URL query parameter
   * @param onboardingData - Optional onboarding data to preserve through OAuth
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with redirect URL query parameter approach');
    
    try {
      let redirectTo = `${window.location.origin}/auth/callback`;
      let onboardingId: string | null = null;
      
      // If we have onboarding data, store it in the database first
      if (onboardingData) {
        console.log('📊 GoogleAuthService: Storing onboarding data in database before OAuth');
        console.log('📊 GoogleAuthService: Data details:', {
          hasProfile: !!onboardingData.profile,
          hasConversation: !!onboardingData.conversation,
          userName: onboardingData.userName,
          promptMode: onboardingData.promptMode
        });
        
        // Store onboarding data in the onboarding_data table
        const { data: onboardingRecord, error: storeError } = await supabase
          .from('onboarding_data')
          .insert({
            profile_data: onboardingData.profile || {},
            conversation_data: onboardingData.conversation || {},
            prompt_mode: onboardingData.promptMode || 'structured',
            is_anonymous: true, // Mark as anonymous since no user_id yet
            user_id: crypto.randomUUID() // Temporary ID, will be updated after auth
          })
          .select('id')
          .single();
        
        if (storeError) {
          console.error('❌ GoogleAuthService: Error storing onboarding data:', storeError);
          throw storeError;
        }
        
        if (onboardingRecord) {
          onboardingId = onboardingRecord.id;
          console.log('✅ GoogleAuthService: Stored onboarding data with ID:', onboardingId);
          
          // Embed the onboarding ID in the redirect URL as a query parameter
          redirectTo = `${window.location.origin}/auth/callback?onboarding_id=${onboardingId}`;
          
          // Store the temporary record ID for cleanup if needed
          localStorage.setItem('temp_onboarding_id', onboardingId);
        }
      }
      
      console.log('🔗 GoogleAuthService: Redirect URL with onboarding ID:', redirectTo);
      
      // Use Supabase's native Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo
        }
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
        // Clean up stored data if OAuth initiation fails
        if (onboardingId) {
          await supabase.from('onboarding_data').delete().eq('id', onboardingId);
          localStorage.removeItem('temp_onboarding_id');
        }
        throw error;
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully with redirect URL query parameter');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Retrieve onboarding data using onboarding ID
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
   * Clean up temporary onboarding data record
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
