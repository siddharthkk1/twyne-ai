
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
   * Enhanced recovery of onboarding data from multiple sources
   */
  private static async recoverOnboardingData(): Promise<any> {
    console.log('OAuthSuccessHandler: Starting enhanced data recovery...');
    
    let recoveredData: any = null;
    
    // Strategy 1: Try sessionStorage first (most reliable for redirects)
    try {
      const sessionBackup = sessionStorage.getItem('onboardingBackup');
      if (sessionBackup) {
        recoveredData = JSON.parse(sessionBackup);
        console.log('OAuthSuccessHandler: Recovered data from sessionStorage');
        return recoveredData;
      }
    } catch (error) {
      console.error('OAuthSuccessHandler: Error reading sessionStorage:', error);
    }
    
    // Strategy 2: Try localStorage backup with latest key
    try {
      const latestBackupKey = localStorage.getItem('latestBackupKey');
      if (latestBackupKey) {
        const backupData = localStorage.getItem(latestBackupKey);
        if (backupData) {
          recoveredData = JSON.parse(backupData);
          console.log('OAuthSuccessHandler: Recovered data from localStorage backup');
          return recoveredData;
        }
      }
    } catch (error) {
      console.error('OAuthSuccessHandler: Error reading localStorage backup:', error);
    }
    
    // Strategy 3: Try OAuth-prefixed items
    try {
      const oauthProfile = localStorage.getItem('oauth_onboardingProfile') || sessionStorage.getItem('oauth_onboardingProfile');
      const oauthUserName = localStorage.getItem('oauth_onboardingUserName') || sessionStorage.getItem('oauth_onboardingUserName');
      const oauthConversation = localStorage.getItem('oauth_onboardingConversation') || sessionStorage.getItem('oauth_onboardingConversation');
      const oauthPromptMode = localStorage.getItem('oauth_onboardingPromptMode') || sessionStorage.getItem('oauth_onboardingPromptMode');
      
      if (oauthProfile || oauthUserName || oauthConversation) {
        recoveredData = {
          profile: oauthProfile,
          userName: oauthUserName,
          conversation: oauthConversation,
          promptMode: oauthPromptMode,
          source: 'oauth-prefixed'
        };
        console.log('OAuthSuccessHandler: Recovered data from OAuth-prefixed storage');
        return recoveredData;
      }
    } catch (error) {
      console.error('OAuthSuccessHandler: Error reading OAuth-prefixed data:', error);
    }
    
    // Strategy 4: Try temporary database storage
    try {
      const tempId = localStorage.getItem('tempOnboardingId');
      if (tempId) {
        const { data, error } = await supabase
          .from('onboarding_data')
          .select('*')
          .eq('user_id', tempId)
          .eq('is_anonymous', true)
          .maybeSingle();
        
        if (!error && data) {
          recoveredData = {
            profile: JSON.stringify(data.profile_data),
            conversation: JSON.stringify(data.conversation_data),
            promptMode: data.prompt_mode,
            source: 'temp-database'
          };
          console.log('OAuthSuccessHandler: Recovered data from temp database');
          
          // Clean up temp record
          await supabase.from('onboarding_data').delete().eq('user_id', tempId);
          localStorage.removeItem('tempOnboardingId');
          
          return recoveredData;
        }
      }
    } catch (error) {
      console.error('OAuthSuccessHandler: Error reading temp database:', error);
    }
    
    // Strategy 5: Try standard localStorage (might still be there)
    try {
      const profile = localStorage.getItem('onboardingProfile');
      const userName = localStorage.getItem('onboardingUserName');
      const conversation = localStorage.getItem('onboardingConversation');
      const promptMode = localStorage.getItem('onboardingPromptMode');
      
      if (profile || userName || conversation) {
        recoveredData = {
          profile,
          userName,
          conversation,
          promptMode,
          source: 'standard-localStorage'
        };
        console.log('OAuthSuccessHandler: Recovered data from standard localStorage');
        return recoveredData;
      }
    } catch (error) {
      console.error('OAuthSuccessHandler: Error reading standard localStorage:', error);
    }
    
    console.log('OAuthSuccessHandler: No onboarding data could be recovered');
    return null;
  }
  
  /**
   * Enhanced transfer onboarding data from multiple sources to authenticated user's profile
   */
  static async transferOnboardingData(userId: string): Promise<boolean> {
    try {
      console.log('OAuthSuccessHandler: Starting enhanced onboarding data transfer for user:', userId);
      
      // Use the new recovery method
      const recoveredData = await this.recoverOnboardingData();
      
      if (!recoveredData) {
        console.log('OAuthSuccessHandler: No onboarding data found after comprehensive recovery');
        return false;
      }
      
      console.log('OAuthSuccessHandler: Successfully recovered data from:', recoveredData.source);
      console.log('OAuthSuccessHandler: Data keys available:', Object.keys(recoveredData).filter(k => k !== 'source'));
      
      let userProfile: UserProfile;
      let conversation: Conversation | null = null;
      
      try {
        // Parse profile data or create default
        if (recoveredData.profile) {
          userProfile = JSON.parse(recoveredData.profile);
          console.log('OAuthSuccessHandler: Successfully parsed recovered profile');
        } else {
          // Create minimal profile from available data
          userProfile = {
            name: recoveredData.userName || "User",
            location: "",
            interests: [],
            socialStyle: "",
            connectionPreferences: "",
            personalInsights: []
          };
          console.log('OAuthSuccessHandler: Created minimal profile from userName');
        }
        
        // Parse conversation data if available
        if (recoveredData.conversation) {
          conversation = JSON.parse(recoveredData.conversation);
          console.log('OAuthSuccessHandler: Successfully parsed recovered conversation');
        }
      } catch (parseError) {
        console.error('OAuthSuccessHandler: Error parsing recovered data:', parseError);
        
        // Create fallback profile
        userProfile = {
          name: recoveredData.userName || "User",
          location: "",
          interests: [],
          socialStyle: "",
          connectionPreferences: "",
          personalInsights: []
        };
        conversation = null;
        console.log('OAuthSuccessHandler: Created fallback profile due to parse error');
      }
      
      // Ensure name is set from recovered userName if available
      if (recoveredData.userName && (!userProfile.name || userProfile.name === "User")) {
        userProfile.name = recoveredData.userName;
        console.log('OAuthSuccessHandler: Set profile name from recovered userName:', recoveredData.userName);
      }
      
      // Determine prompt mode with fallback
      const finalPromptMode = recoveredData.promptMode || 'gpt-paste';
      console.log('OAuthSuccessHandler: Using prompt mode:', finalPromptMode);
      
      console.log('OAuthSuccessHandler: Updating user_data table...');
      
      // Update user_data with the onboarding profile using upsert for reliability
      const updateData = {
        user_id: userId,
        profile_data: userProfile as unknown as Json,
        conversation_data: (conversation || {}) as unknown as Json,
        prompt_mode: finalPromptMode,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString()
      };
      
      console.log('OAuthSuccessHandler: Upserting user data with profile keys:', Object.keys(userProfile));
      
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
      
      // Clean up all backup data after successful transfer
      this.cleanupBackupData();
      
      return true;
    } catch (error) {
      console.error('OAuthSuccessHandler: Error in transferOnboardingData:', error);
      return false;
    }
  }
  
  /**
   * Clean up all backup data after successful transfer
   */
  private static cleanupBackupData(): void {
    try {
      console.log('OAuthSuccessHandler: Cleaning up backup data...');
      
      // Clear sessionStorage
      sessionStorage.removeItem('onboardingBackup');
      
      // Clear OAuth-prefixed items
      ['oauth_onboardingProfile', 'oauth_onboardingUserName', 'oauth_onboardingConversation', 'oauth_onboardingPromptMode'].forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      
      // Clear backup with latest key
      const latestBackupKey = localStorage.getItem('latestBackupKey');
      if (latestBackupKey) {
        localStorage.removeItem(latestBackupKey);
        localStorage.removeItem('latestBackupKey');
      }
      
      // Clear standard onboarding items
      ['onboardingProfile', 'onboardingUserName', 'onboardingConversation', 'onboardingPromptMode'].forEach(key => {
        localStorage.removeItem(key);
      });
      
      console.log('OAuthSuccessHandler: Backup data cleanup completed');
    } catch (error) {
      console.error('OAuthSuccessHandler: Error during cleanup:', error);
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
