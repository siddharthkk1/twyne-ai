
import { supabase } from "@/integrations/supabase/client";

export class GoogleAuthService {
  /**
   * Initiate Google OAuth flow with onboarding data preservation
   * @param onboardingData - Optional onboarding data to preserve through OAuth
   */
  static async initiateGoogleAuth(onboardingData?: {
    profile?: any;
    conversation?: any;
    userName?: string;
    promptMode?: string;
  }) {
    console.log('🚀 GoogleAuthService: Starting Google OAuth with Supabase native flow');
    
    try {
      // Prepare options for OAuth with data preservation
      const options: any = {
        redirectTo: `${window.location.origin}/auth/callback`,
      };
      
      // If we have onboarding data, pass it through OAuth metadata
      if (onboardingData) {
        console.log('📊 GoogleAuthService: Including onboarding data in OAuth flow:', {
          hasProfile: !!onboardingData.profile,
          hasConversation: !!onboardingData.conversation,
          userName: onboardingData.userName,
          promptMode: onboardingData.promptMode
        });
        
        // Pass onboarding data through OAuth options.data
        options.data = {
          onboarding_profile: onboardingData.profile,
          onboarding_conversation: onboardingData.conversation,
          onboarding_user_name: onboardingData.userName,
          onboarding_prompt_mode: onboardingData.promptMode || 'structured'
        };
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
      return { success: true };
      
    } catch (error) {
      console.error('❌ GoogleAuthService: Error in OAuth flow:', error);
      throw error;
    }
  }
  
  /**
   * Legacy method for backward compatibility - now uses native Supabase OAuth
   */
  static getYouTubeAuthUrl(): string {
    console.warn('⚠️ GoogleAuthService: getYouTubeAuthUrl is deprecated, use initiateGoogleAuth instead');
    
    // For backward compatibility, initiate OAuth without data
    this.initiateGoogleAuth().catch(error => {
      console.error('❌ GoogleAuthService: Legacy OAuth failed:', error);
    });
    
    // Return empty string since we're handling the redirect internally
    return '';
  }
  
  /**
   * Legacy method for backward compatibility - no longer needed with native OAuth
   */
  static async exchangeCodeForToken(code: string): Promise<any> {
    console.warn('⚠️ GoogleAuthService: exchangeCodeForToken is deprecated with native Supabase OAuth');
    throw new Error('Token exchange is handled automatically by Supabase OAuth');
  }
}
