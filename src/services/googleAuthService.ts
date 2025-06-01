import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface OnboardingData {
  profile: any;
  conversation: any;
  userName: string;
  promptMode: string;
}

export class GoogleAuthService {
  private static generateTempId(): string {
    return crypto.randomUUID();
  }

  private static async storeOnboardingData(tempId: string, data: OnboardingData): Promise<void> {
    const { error } = await supabase
      .from('onboarding_data')
      .insert({
        id: tempId,
        user_id: tempId,
        profile_data: data.profile as Json,
        onboarding_conversation: data.conversation as Json,
        onboarding_mode: data.promptMode,
        is_anonymous: true
      });

    if (error) {
      console.error('Error storing onboarding data:', error);
      throw new Error('Failed to store onboarding data');
    }
  }

  public static async initiateGoogleAuth(onboardingData?: OnboardingData): Promise<void> {
    try {
      console.log('🚀 GoogleAuthService: Starting Google OAuth with enhanced onboarding data preservation');
      
      let tempOnboardingId: string | undefined;
      
      // Enhanced: Store onboarding data if provided with validation
      if (onboardingData) {
        console.log('📊 GoogleAuthService: Onboarding data provided for OAuth:', {
          hasProfile: !!onboardingData.profile,
          hasConversation: !!onboardingData.conversation,
          userName: onboardingData.userName,
          promptMode: onboardingData.promptMode
        });
        
        // Validate conversation data structure
        if (onboardingData.conversation && 
            (!onboardingData.conversation.messages || !Array.isArray(onboardingData.conversation.messages) ||
             !onboardingData.conversation.userAnswers || !Array.isArray(onboardingData.conversation.userAnswers))) {
          console.warn('⚠️ GoogleAuthService: Invalid conversation structure, fixing...');
          onboardingData.conversation = {
            messages: onboardingData.conversation.messages || [],
            userAnswers: onboardingData.conversation.userAnswers || []
          };
        }
        
        tempOnboardingId = this.generateTempId();
        
        // Store enhanced onboarding data in database for retrieval after OAuth
        await this.storeOnboardingData(tempOnboardingId, onboardingData);
        
        // Also store in localStorage as fallback for OAuth preservation
        localStorage.setItem('oauth_onboardingProfile', JSON.stringify(onboardingData.profile));
        localStorage.setItem('oauth_onboardingUserName', onboardingData.userName || '');
        localStorage.setItem('oauth_onboardingConversation', JSON.stringify(onboardingData.conversation));
        localStorage.setItem('oauth_onboardingPromptMode', onboardingData.promptMode || 'structured');
        localStorage.setItem('oauth_temp_onboarding_id', tempOnboardingId);
        
        console.log('💾 GoogleAuthService: Stored onboarding data with temp ID:', tempOnboardingId);
      }
      
      // Get the auth URL with enhanced callback URL including onboarding ID
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { 
          onboardingId: tempOnboardingId,
          context: 'onboarding_results'
        }
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: Error getting auth URL:', error);
        throw new Error(`Failed to get Google auth URL: ${error.message}`);
      }
      
      if (!data?.url) {
        console.error('❌ GoogleAuthService: No auth URL received');
        throw new Error('No authentication URL received');
      }
      
      console.log('✅ GoogleAuthService: Got auth URL, redirecting to Google OAuth');
      
      // Store context for the callback page
      localStorage.setItem('oauth_context', 'onboarding_results');
      
      // Redirect to Google OAuth
      window.location.href = data.url;
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in Google OAuth initiation:', error);
      throw error;
    }
  }

  public static async retrieveOnboardingData(tempId: string): Promise<OnboardingData | null> {
    try {
      console.log('🔍 GoogleAuthService: Retrieving onboarding data for temp ID:', tempId);
      
      const { data, error } = await supabase
        .from('onboarding_data')
        .select('*')
        .eq('id', tempId)
        .eq('is_anonymous', true)
        .single();
      
      if (error) {
        console.error('❌ GoogleAuthService: Error retrieving onboarding data:', error);
        return null;
      }
      
      if (!data) {
        console.log('⚠️ GoogleAuthService: No onboarding data found for temp ID:', tempId);
        return null;
      }
      
      console.log('✅ GoogleAuthService: Successfully retrieved onboarding data');
      
      return {
        profile: data.profile_data,
        conversation: data.onboarding_conversation,
        userName: '', // userName is typically stored in the profile
        promptMode: data.onboarding_mode || 'structured'
      };
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in retrieveOnboardingData:', error);
      return null;
    }
  }

  public static async cleanupOnboardingData(tempId: string): Promise<void> {
    try {
      console.log('🧹 GoogleAuthService: Cleaning up onboarding data for temp ID:', tempId);
      
      // Remove from database
      const { error } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('id', tempId)
        .eq('is_anonymous', true);
      
      if (error) {
        console.warn('⚠️ GoogleAuthService: Error cleaning up database record:', error);
      } else {
        console.log('✅ GoogleAuthService: Successfully cleaned up database record');
      }
      
      // Clean up localStorage
      const keysToRemove = [
        'oauth_onboardingProfile',
        'oauth_onboardingUserName', 
        'oauth_onboardingConversation',
        'oauth_onboardingPromptMode',
        'oauth_temp_onboarding_id',
        'oauth_context'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🧹 GoogleAuthService: Removed localStorage key: ${key}`);
      });
      
      console.log('✅ GoogleAuthService: Cleanup completed');
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error during cleanup:', error);
    }
  }

  public static getYouTubeAuthUrl(): string {
    try {
      console.log('🔗 GoogleAuthService: Generating YouTube auth URL');
      
      // Get the origin with fallback
      const origin = window.location.origin || 'https://preview--twyne-ai.lovable.app';
      const redirectUri = `${origin}/youtube/callback`;
      
      console.log('🔗 GoogleAuthService: Using redirect URI:', redirectUri);
      
      // Call the Supabase edge function to get the auth URL
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { 
          redirect_uri: redirectUri,
          context: 'youtube_auth'
        }
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: Error getting YouTube auth URL:', error);
        throw new Error(`Failed to get YouTube auth URL: ${error.message}`);
      }
      
      if (!data?.authUrl) {
        console.error('❌ GoogleAuthService: No auth URL received from edge function');
        throw new Error('No authentication URL received');
      }
      
      console.log('✅ GoogleAuthService: Successfully generated YouTube auth URL');
      return data.authUrl;
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in getYouTubeAuthUrl:', error);
      throw error;
    }
  }

  public static async exchangeCodeForToken(code: string): Promise<any> {
    try {
      console.log('🔄 GoogleAuthService: Exchanging authorization code for tokens');
      console.log('🔄 GoogleAuthService: Code length:', code.length);
      
      // Call the Supabase edge function to exchange the code
      const { data, error } = await supabase.functions.invoke('google-auth', {
        body: { code }
      });
      
      if (error) {
        console.error('❌ GoogleAuthService: Error exchanging code for token:', error);
        throw new Error(`Token exchange failed: ${error.message}`);
      }
      
      if (!data) {
        console.error('❌ GoogleAuthService: No token data received');
        throw new Error('No token data received from exchange');
      }
      
      console.log('✅ GoogleAuthService: Successfully exchanged code for tokens');
      console.log('✅ GoogleAuthService: Token data keys:', Object.keys(data));
      
      return data;
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in exchangeCodeForToken:', error);
      throw error;
    }
  }
}
