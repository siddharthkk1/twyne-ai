
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
   * Enhanced debugging for localStorage data
   */
  private static debugLocalStorageData(): void {
    console.log('=== OAUTH SUCCESS HANDLER DEBUG ===');
    console.log('OAuthSuccessHandler: Current localStorage contents:');
    
    try {
      const allKeys = Object.keys(localStorage);
      console.log('OAuthSuccessHandler: All localStorage keys:', allKeys);
      
      const onboardingKeys = allKeys.filter(key => key.includes('onboarding'));
      console.log('OAuthSuccessHandler: Onboarding-related keys:', onboardingKeys);
      
      onboardingKeys.forEach(key => {
        const value = localStorage.getItem(key);
        console.log(`OAuthSuccessHandler: ${key}:`, value ? value.substring(0, 200) + '...' : 'null');
      });
      
      // Check specific keys
      const specificKeys = ['onboardingProfile', 'onboardingUserName', 'onboardingConversation', 'onboardingPromptMode'];
      specificKeys.forEach(key => {
        const exists = localStorage.getItem(key) !== null;
        console.log(`OAuthSuccessHandler: ${key} exists:`, exists);
      });
    } catch (error) {
      console.error('OAuthSuccessHandler: Error accessing localStorage:', error);
    }
    
    console.log('=== END OAUTH DEBUG ===');
  }

  /**
   * Enhanced transfer onboarding data from localStorage to authenticated user's profile
   */
  static async transferOnboardingData(userId: string): Promise<boolean> {
    try {
      console.log('OAuthSuccessHandler: Starting enhanced onboarding data transfer for user:', userId);
      
      // Enhanced debugging
      this.debugLocalStorageData();
      
      // Multiple attempts to access localStorage data with timing delays
      let storedProfile: string | null = null;
      let storedUserName: string | null = null;
      let storedConversation: string | null = null;
      let storedPromptMode: string | null = null;
      
      // Retry mechanism for localStorage access
      const maxRetries = 3;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`OAuthSuccessHandler: Attempt ${attempt}/${maxRetries} to access localStorage`);
        
        storedProfile = localStorage.getItem('onboardingProfile');
        storedUserName = localStorage.getItem('onboardingUserName');
        storedConversation = localStorage.getItem('onboardingConversation');
        storedPromptMode = localStorage.getItem('onboardingPromptMode');
        
        console.log('OAuthSuccessHandler: Retrieved data attempt', attempt, ':');
        console.log('- Profile exists:', !!storedProfile);
        console.log('- UserName exists:', !!storedUserName);
        console.log('- Conversation exists:', !!storedConversation);
        console.log('- PromptMode:', storedPromptMode);
        
        if (storedProfile || storedUserName || storedConversation || storedPromptMode) {
          console.log('OAuthSuccessHandler: Found some data on attempt', attempt);
          break;
        }
        
        if (attempt < maxRetries) {
          console.log('OAuthSuccessHandler: No data found, waiting before retry...');
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      // If no onboarding data found after retries
      if (!storedProfile && !storedUserName && !storedConversation && !storedPromptMode) {
        console.log('OAuthSuccessHandler: No onboarding data found in localStorage after retries');
        return false;
      }

      console.log('OAuthSuccessHandler: Found onboarding data, parsing...');
      
      let userProfile: UserProfile;
      let conversation: Conversation | null = null;
      
      try {
        // Parse profile data or create default
        if (storedProfile) {
          userProfile = JSON.parse(storedProfile);
          console.log('OAuthSuccessHandler: Successfully parsed stored profile');
        } else {
          // Create minimal profile from available data
          userProfile = {
            name: storedUserName || "User",
            location: "",
            interests: [],
            socialStyle: "",
            connectionPreferences: "",
            personalInsights: []
          };
          console.log('OAuthSuccessHandler: Created minimal profile from userName');
        }
        
        // Parse conversation data if available
        if (storedConversation) {
          conversation = JSON.parse(storedConversation);
          console.log('OAuthSuccessHandler: Successfully parsed stored conversation');
        }
      } catch (parseError) {
        console.error('OAuthSuccessHandler: Error parsing stored data:', parseError);
        
        // Create fallback profile
        userProfile = {
          name: storedUserName || "User",
          location: "",
          interests: [],
          socialStyle: "",
          connectionPreferences: "",
          personalInsights: []
        };
        conversation = null;
        console.log('OAuthSuccessHandler: Created fallback profile due to parse error');
      }

      // Ensure name is set from stored userName if available and not already set
      if (storedUserName && (!userProfile.name || userProfile.name === "User")) {
        userProfile.name = storedUserName;
        console.log('OAuthSuccessHandler: Set profile name from stored userName:', storedUserName);
      }

      // Determine prompt mode with fallback
      const finalPromptMode = storedPromptMode || 'gpt-paste';
      console.log('OAuthSuccessHandler: Using prompt mode:', finalPromptMode);

      console.log('OAuthSuccessHandler: Updating user_data table...');
      
      // First, try to get existing user data
      const { data: existingData, error: fetchError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('OAuthSuccessHandler: Error fetching existing user data:', fetchError);
      } else {
        console.log('OAuthSuccessHandler: Existing user data:', existingData ? 'found' : 'not found');
      }

      // Update user_data with the onboarding profile using upsert for reliability
      const updateData = {
        user_id: userId,
        profile_data: userProfile as unknown as Json,
        conversation_data: (conversation || {}) as unknown as Json,
        prompt_mode: finalPromptMode,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString()
      };

      console.log('OAuthSuccessHandler: Upserting user data with:', {
        user_id: userId,
        profile_data_keys: Object.keys(userProfile),
        conversation_data_exists: !!conversation,
        prompt_mode: finalPromptMode,
        has_completed_onboarding: true
      });

      const { error: upsertError, data: upsertData } = await supabase
        .from('user_data')
        .upsert(updateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select();

      if (upsertError) {
        console.error('OAuthSuccessHandler: Error upserting user_data:', upsertError);
        throw upsertError;
      }

      console.log('OAuthSuccessHandler: Successfully transferred onboarding data to database');
      console.log('OAuthSuccessHandler: Upserted data:', upsertData);
      
      // Verify the data was stored correctly
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_data')
        .select('profile_data, prompt_mode, has_completed_onboarding')
        .eq('user_id', userId)
        .single();

      if (verifyError) {
        console.error('OAuthSuccessHandler: Error verifying stored data:', verifyError);
      } else {
        console.log('OAuthSuccessHandler: Verification - stored data:', {
          profile_data_keys: verifyData.profile_data ? Object.keys(verifyData.profile_data as any) : [],
          prompt_mode: verifyData.prompt_mode,
          has_completed_onboarding: verifyData.has_completed_onboarding
        });
      }
      
      // Clean up localStorage after successful transfer
      try {
        localStorage.removeItem('onboardingProfile');
        localStorage.removeItem('onboardingUserName');
        localStorage.removeItem('onboardingConversation');
        localStorage.removeItem('onboardingPromptMode');
        console.log('OAuthSuccessHandler: Cleaned up localStorage');
      } catch (cleanupError) {
        console.error('OAuthSuccessHandler: Error cleaning up localStorage:', cleanupError);
      }
      
      return true;
    } catch (error) {
      console.error('OAuthSuccessHandler: Error in transferOnboardingData:', error);
      return false;
    }
  }

  /**
   * Enhanced post-auth redirection with better user data handling
   */
  static async handlePostAuthRedirection(userId: string): Promise<string> {
    try {
      console.log('OAuthSuccessHandler: Starting enhanced post-auth redirection for user:', userId);
      
      // Always attempt to transfer onboarding data first
      console.log('OAuthSuccessHandler: Attempting to transfer onboarding data...');
      const transferred = await this.transferOnboardingData(userId);
      
      if (transferred) {
        console.log('OAuthSuccessHandler: Onboarding data transferred successfully, redirecting to mirror');
        return '/mirror';
      }
      
      // Check current user data with enhanced retry logic
      let userData = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!userData && attempts < maxAttempts) {
        attempts++;
        console.log(`OAuthSuccessHandler: Fetching user data (attempt ${attempts}/${maxAttempts})`);
        
        const { data, error } = await supabase
          .from('user_data')
          .select('has_completed_onboarding, profile_data, sso_data, prompt_mode')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.error('OAuthSuccessHandler: Error fetching user data:', error);
          if (attempts === maxAttempts) {
            console.log('OAuthSuccessHandler: Max attempts reached, defaulting to onboarding');
            return '/onboarding';
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        userData = data;
        
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
        hasSsoData: !!userData.sso_data && Object.keys(userData.sso_data as any || {}).length > 0,
        promptMode: userData.prompt_mode
      });

      // Enhanced completion check
      const hasCompletedOnboarding = userData.has_completed_onboarding;
      const hasValidProfileData = userData.profile_data && 
                                  Object.keys(userData.profile_data as any || {}).length > 0 &&
                                  (userData.profile_data as any).name;
      
      if (hasCompletedOnboarding && hasValidProfileData) {
        console.log('OAuthSuccessHandler: User has completed onboarding with valid profile, redirecting to mirror');
        return '/mirror';
      }

      console.log('OAuthSuccessHandler: User needs to complete onboarding, redirecting to onboarding');
      return '/onboarding';
      
    } catch (error) {
      console.error('OAuthSuccessHandler: Error in handlePostAuthRedirection:', error);
      return '/onboarding';
    }
  }
}
