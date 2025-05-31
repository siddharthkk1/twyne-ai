
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
}
