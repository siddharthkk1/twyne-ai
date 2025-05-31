
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';

export class OAuthSuccessHandler {
  /**
   * Simple post-auth redirection handler for legacy support
   * Note: The new state parameter approach in GoogleAuthService is preferred
   */
  static async handlePostAuthRedirection(userId: string): Promise<string> {
    try {
      console.log('🚀 OAuthSuccessHandler: Legacy redirection handler for user:', userId);
      
      // Check current user data
      const { data: userData, error } = await supabase
        .from('user_data')
        .select('has_completed_onboarding, profile_data')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ OAuthSuccessHandler: Error fetching user data:', error);
        return '/onboarding';
      }
      
      console.log('📊 OAuthSuccessHandler: User data analysis:', {
        hasCompletedOnboarding: userData?.has_completed_onboarding,
        hasProfileData: !!userData?.profile_data && Object.keys(userData.profile_data as any || {}).length > 0,
        profileDataKeys: userData?.profile_data ? Object.keys(userData.profile_data as any) : []
      });
      
      // Check if user has completed onboarding with valid profile data
      const hasValidProfile = userData?.has_completed_onboarding && 
                              userData?.profile_data && 
                              Object.keys(userData.profile_data as any || {}).length > 0;
      
      if (hasValidProfile) {
        console.log('✅ OAuthSuccessHandler: User has completed onboarding, redirecting to mirror');
        return '/mirror';
      }
      
      console.log('🔄 OAuthSuccessHandler: User needs to complete onboarding');
      return '/onboarding';
      
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Error in handlePostAuthRedirection:', error);
      return '/onboarding';
    }
  }
}
