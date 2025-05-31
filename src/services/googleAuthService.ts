
import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow with onboarding data preservation using state parameter
   * @param onboardingData - Optional onboarding data to preserve through OAuth
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with state parameter approach');
    
    try {
      // Prepare redirect URL
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log('🔗 GoogleAuthService: Redirect URL:', redirectTo);
      
      let stateParam = undefined;
      
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
          stateParam = onboardingRecord.id;
          console.log('✅ GoogleAuthService: Stored onboarding data with ID:', stateParam);
          
          // Store the temporary record ID for cleanup if needed
          localStorage.setItem('temp_onboarding_id', stateParam);
        }
      }
      
      // Prepare options for OAuth
      const options: any = {
        redirectTo,
      };
      
      // Add state parameter if we have stored data
      if (stateParam) {
        options.queryParams = {
          state: stateParam
        };
        console.log('🔗 GoogleAuthService: Added state parameter:', stateParam);
      }
      
      // Use Supabase's native Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: OAuth initiation failed:', error);
        // Clean up stored data if OAuth initiation fails
        if (stateParam) {
          await supabase.from('onboarding_data').delete().eq('id', stateParam);
          localStorage.removeItem('temp_onboarding_id');
        }
        throw error;
      }
      
      console.log('✅ GoogleAuthService: OAuth flow initiated successfully with state parameter');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Retrieve onboarding data using state parameter
   * @param stateParam - State parameter from OAuth callback
   */
  static async retrieveOnboardingData(stateParam: string) {
    try {
      console.log('🔍 GoogleAuthService: Retrieving onboarding data for state:', stateParam);
      
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('id', stateParam)
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
      
      console.log('⚠️ GoogleAuthService: No onboarding data found for state parameter');
      return null;
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in retrieveOnboardingData:', error);
      return null;
    }
  }

  /**
   * Clean up temporary onboarding data record
   * @param stateParam - State parameter identifying the record to clean up
   */
  static async cleanupOnboardingData(stateParam: string) {
    try {
      console.log('🧹 GoogleAuthService: Cleaning up onboarding data for state:', stateParam);
      
      const { error } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('id', stateParam)
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
