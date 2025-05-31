
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';

interface OnboardingData {
  userProfile: UserProfile;
  conversation?: Conversation;
  userName?: string;
  promptMode?: string;
}

export class OAuthSuccessHandler {
  /**
   * Transfer onboarding data from localStorage to authenticated user's profile
   */
  static async transferOnboardingData(userId: string): Promise<boolean> {
    try {
      console.log('OAuthSuccessHandler: Checking for onboarding data to transfer for user:', userId);
      
      // Check for stored onboarding data in localStorage
      const storedProfile = localStorage.getItem('onboardingProfile');
      const storedUserName = localStorage.getItem('onboardingUserName');
      const storedConversation = localStorage.getItem('onboardingConversation');
      const storedPromptMode = localStorage.getItem('onboardingPromptMode');
      
      if (!storedProfile) {
        console.log('OAuthSuccessHandler: No onboarding data found in localStorage');
        return false;
      }

      console.log('OAuthSuccessHandler: Found onboarding data, transferring...');
      
      let userProfile: UserProfile;
      let conversation: Conversation | null = null;
      
      try {
        userProfile = JSON.parse(storedProfile);
        if (storedConversation) {
          conversation = JSON.parse(storedConversation);
        }
      } catch (parseError) {
        console.error('OAuthSuccessHandler: Error parsing stored data:', parseError);
        return false;
      }

      // Ensure name is set from stored userName if available
      if (storedUserName && !userProfile.name) {
        userProfile.name = storedUserName;
      }

      // Update user_data with the onboarding profile
      const { error } = await supabase
        .from('user_data')
        .update({
          profile_data: userProfile as unknown as Json,
          conversation_data: (conversation || {}) as unknown as Json,
          prompt_mode: storedPromptMode || 'structured',
          has_completed_onboarding: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('OAuthSuccessHandler: Error updating user_data:', error);
        throw error;
      }

      console.log('OAuthSuccessHandler: Successfully transferred onboarding data');
      
      // Clean up localStorage after successful transfer
      localStorage.removeItem('onboardingProfile');
      localStorage.removeItem('onboardingUserName');
      localStorage.removeItem('onboardingConversation');
      localStorage.removeItem('onboardingPromptMode');
      
      return true;
    } catch (error) {
      console.error('OAuthSuccessHandler: Error in transferOnboardingData:', error);
      return false;
    }
  }

  /**
   * Check if user has completed onboarding and handle redirection
   */
  static async handlePostAuthRedirection(userId: string): Promise<string> {
    try {
      // Check current user data
      const { data: userData, error } = await supabase
        .from('user_data')
        .select('has_completed_onboarding, profile_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('OAuthSuccessHandler: Error fetching user data:', error);
        return '/onboarding'; // Default to onboarding on error
      }

      console.log('OAuthSuccessHandler: User data:', userData);

      // If user has completed onboarding, go to mirror
      if (userData.has_completed_onboarding) {
        console.log('OAuthSuccessHandler: User has completed onboarding, redirecting to mirror');
        return '/mirror';
      }

      // Try to transfer any pending onboarding data
      const transferred = await this.transferOnboardingData(userId);
      
      if (transferred) {
        console.log('OAuthSuccessHandler: Onboarding data transferred, redirecting to mirror');
        return '/mirror';
      }

      // If no onboarding data and hasn't completed onboarding, go to onboarding
      console.log('OAuthSuccessHandler: No onboarding completion, redirecting to onboarding');
      return '/onboarding';
      
    } catch (error) {
      console.error('OAuthSuccessHandler: Error in handlePostAuthRedirection:', error);
      return '/onboarding'; // Default to onboarding on error
    }
  }
}
