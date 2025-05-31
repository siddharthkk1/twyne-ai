
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
      console.log('OAuthSuccessHandler: Starting onboarding data transfer for user:', userId);
      
      // Check for stored onboarding data in localStorage
      const storedProfile = localStorage.getItem('onboardingProfile');
      const storedUserName = localStorage.getItem('onboardingUserName');
      const storedConversation = localStorage.getItem('onboardingConversation');
      const storedPromptMode = localStorage.getItem('onboardingPromptMode');
      
      console.log('OAuthSuccessHandler: Checking localStorage data:');
      console.log('OAuthSuccessHandler: - Profile:', !!storedProfile);
      console.log('OAuthSuccessHandler: - UserName:', !!storedUserName);
      console.log('OAuthSuccessHandler: - Conversation:', !!storedConversation);
      console.log('OAuthSuccessHandler: - PromptMode:', storedPromptMode);
      
      if (!storedProfile) {
        console.log('OAuthSuccessHandler: No onboarding data found in localStorage');
        return false;
      }

      console.log('OAuthSuccessHandler: Found onboarding data, parsing...');
      
      let userProfile: UserProfile;
      let conversation: Conversation | null = null;
      
      try {
        userProfile = JSON.parse(storedProfile);
        if (storedConversation) {
          conversation = JSON.parse(storedConversation);
        }
        console.log('OAuthSuccessHandler: Successfully parsed stored data');
      } catch (parseError) {
        console.error('OAuthSuccessHandler: Error parsing stored data:', parseError);
        return false;
      }

      // Ensure name is set from stored userName if available
      if (storedUserName && !userProfile.name) {
        userProfile.name = storedUserName;
        console.log('OAuthSuccessHandler: Set profile name from stored userName:', storedUserName);
      }

      console.log('OAuthSuccessHandler: Updating user_data table...');
      
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

      console.log('OAuthSuccessHandler: Successfully transferred onboarding data to database');
      
      // Clean up localStorage after successful transfer
      localStorage.removeItem('onboardingProfile');
      localStorage.removeItem('onboardingUserName');
      localStorage.removeItem('onboardingConversation');
      localStorage.removeItem('onboardingPromptMode');
      
      console.log('OAuthSuccessHandler: Cleaned up localStorage');
      
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
      console.log('OAuthSuccessHandler: Starting post-auth redirection for user:', userId);
      
      // Check current user data with retry logic for newly created users
      let userData = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!userData && attempts < maxAttempts) {
        attempts++;
        console.log(`OAuthSuccessHandler: Fetching user data (attempt ${attempts}/${maxAttempts})`);
        
        const { data, error } = await supabase
          .from('user_data')
          .select('has_completed_onboarding, profile_data, sso_data')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('OAuthSuccessHandler: Error fetching user data:', error);
          if (attempts === maxAttempts) {
            console.log('OAuthSuccessHandler: Max attempts reached, defaulting to onboarding');
            return '/onboarding';
          }
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        userData = data;
        
        // If no user data found, wait a bit for the trigger to create it
        if (!userData && attempts < maxAttempts) {
          console.log('OAuthSuccessHandler: No user data found, waiting for trigger...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!userData) {
        console.log('OAuthSuccessHandler: No user data found after retries, redirecting to onboarding');
        return '/onboarding';
      }

      console.log('OAuthSuccessHandler: User data found:', {
        hasCompletedOnboarding: userData.has_completed_onboarding,
        hasProfileData: !!userData.profile_data && Object.keys(userData.profile_data as any || {}).length > 0,
        hasSsoData: !!userData.sso_data && Object.keys(userData.sso_data as any || {}).length > 0
      });

      // If user has completed onboarding, go to mirror
      if (userData.has_completed_onboarding) {
        console.log('OAuthSuccessHandler: User has completed onboarding, redirecting to mirror');
        return '/mirror';
      }

      // Try to transfer any pending onboarding data
      console.log('OAuthSuccessHandler: Attempting to transfer onboarding data...');
      const transferred = await this.transferOnboardingData(userId);
      
      if (transferred) {
        console.log('OAuthSuccessHandler: Onboarding data transferred, redirecting to mirror');
        return '/mirror';
      }

      // If no onboarding data and hasn't completed onboarding, go to onboarding
      console.log('OAuthSuccessHandler: No onboarding completion or transfer, redirecting to onboarding');
      return '/onboarding';
      
    } catch (error) {
      console.error('OAuthSuccessHandler: Error in handlePostAuthRedirection:', error);
      return '/onboarding'; // Default to onboarding on error
    }
  }
}
