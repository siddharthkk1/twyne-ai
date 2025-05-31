
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
   * Enhanced recovery of onboarding data from multiple sources with detailed logging
   */
  private static async recoverOnboardingData(): Promise<any> {
    console.log('🔍 OAuthSuccessHandler: Starting enhanced data recovery...');
    console.log('📊 OAuthSuccessHandler: Initial storage state:');
    console.log('📊 OAuthSuccessHandler: localStorage keys:', Object.keys(localStorage));
    console.log('📊 OAuthSuccessHandler: sessionStorage keys:', Object.keys(sessionStorage));
    
    let recoveredData: any = null;
    let recoverySource: string = '';
    
    // Strategy 1: Try sessionStorage first (most reliable for redirects)
    try {
      console.log('🔍 OAuthSuccessHandler: Strategy 1 - Checking sessionStorage...');
      const sessionBackup = sessionStorage.getItem('onboardingBackup');
      if (sessionBackup) {
        recoveredData = JSON.parse(sessionBackup);
        recoverySource = 'sessionStorage';
        console.log('✅ OAuthSuccessHandler: Strategy 1 SUCCESS - Recovered data from sessionStorage');
        console.log('📊 OAuthSuccessHandler: SessionStorage data keys:', Object.keys(recoveredData));
        console.log('📊 OAuthSuccessHandler: SessionStorage data details:', {
          hasProfile: !!recoveredData.profile,
          hasUserName: !!recoveredData.userName,
          userNameValue: recoveredData.userName,
          hasConversation: !!recoveredData.conversation,
          hasPromptMode: !!recoveredData.promptMode,
          promptModeValue: recoveredData.promptMode,
          timestamp: recoveredData.timestamp,
          source: recoveredData.source
        });
        return { ...recoveredData, recoverySource };
      } else {
        console.log('❌ OAuthSuccessHandler: Strategy 1 FAILED - No sessionStorage backup found');
      }
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Strategy 1 ERROR - Error reading sessionStorage:', error);
    }
    
    // Strategy 2: Try localStorage backup with latest key
    try {
      console.log('🔍 OAuthSuccessHandler: Strategy 2 - Checking localStorage backup...');
      const latestBackupKey = localStorage.getItem('latestBackupKey');
      console.log('🔍 OAuthSuccessHandler: Latest backup key:', latestBackupKey);
      if (latestBackupKey) {
        const backupData = localStorage.getItem(latestBackupKey);
        if (backupData) {
          recoveredData = JSON.parse(backupData);
          recoverySource = 'localStorage-backup';
          console.log('✅ OAuthSuccessHandler: Strategy 2 SUCCESS - Recovered data from localStorage backup');
          console.log('📊 OAuthSuccessHandler: LocalStorage backup data keys:', Object.keys(recoveredData));
          return { ...recoveredData, recoverySource };
        } else {
          console.log('❌ OAuthSuccessHandler: Strategy 2 FAILED - Backup key exists but no data found');
        }
      } else {
        console.log('❌ OAuthSuccessHandler: Strategy 2 FAILED - No latest backup key found');
      }
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Strategy 2 ERROR - Error reading localStorage backup:', error);
    }
    
    // Strategy 3: Try OAuth-prefixed items
    try {
      console.log('🔍 OAuthSuccessHandler: Strategy 3 - Checking OAuth-prefixed storage...');
      const oauthProfile = localStorage.getItem('oauth_onboardingProfile') || sessionStorage.getItem('oauth_onboardingProfile');
      const oauthUserName = localStorage.getItem('oauth_onboardingUserName') || sessionStorage.getItem('oauth_onboardingUserName');
      const oauthConversation = localStorage.getItem('oauth_onboardingConversation') || sessionStorage.getItem('oauth_onboardingConversation');
      const oauthPromptMode = localStorage.getItem('oauth_onboardingPromptMode') || sessionStorage.getItem('oauth_onboardingPromptMode');
      
      console.log('📊 OAuthSuccessHandler: OAuth-prefixed data check:', {
        hasProfile: !!oauthProfile,
        hasUserName: !!oauthUserName,
        userNameValue: oauthUserName,
        hasConversation: !!oauthConversation,
        hasPromptMode: !!oauthPromptMode,
        promptModeValue: oauthPromptMode
      });
      
      if (oauthProfile || oauthUserName || oauthConversation) {
        recoveredData = {
          profile: oauthProfile,
          userName: oauthUserName,
          conversation: oauthConversation,
          promptMode: oauthPromptMode,
          source: 'oauth-prefixed'
        };
        recoverySource = 'oauth-prefixed';
        console.log('✅ OAuthSuccessHandler: Strategy 3 SUCCESS - Recovered data from OAuth-prefixed storage');
        return { ...recoveredData, recoverySource };
      } else {
        console.log('❌ OAuthSuccessHandler: Strategy 3 FAILED - No OAuth-prefixed data found');
      }
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Strategy 3 ERROR - Error reading OAuth-prefixed data:', error);
    }
    
    // Strategy 4: Try temporary database storage
    try {
      console.log('🔍 OAuthSuccessHandler: Strategy 4 - Checking temporary database storage...');
      const tempId = localStorage.getItem('tempOnboardingId');
      console.log('🔍 OAuthSuccessHandler: Temp ID found:', tempId);
      if (tempId) {
        console.log('🔍 OAuthSuccessHandler: Querying onboarding_data table for temp ID...');
        const { data, error } = await supabase
          .from('onboarding_data')
          .select('*')
          .eq('user_id', tempId)
          .eq('is_anonymous', true)
          .maybeSingle();
        
        console.log('📊 OAuthSuccessHandler: Database query result:', { 
          hasData: !!data, 
          hasError: !!error,
          errorDetails: error ? { message: error.message, details: error.details } : null
        });
        
        if (!error && data) {
          recoveredData = {
            profile: JSON.stringify(data.profile_data),
            conversation: JSON.stringify(data.conversation_data),
            promptMode: data.prompt_mode,
            source: 'temp-database'
          };
          recoverySource = 'temp-database';
          console.log('✅ OAuthSuccessHandler: Strategy 4 SUCCESS - Recovered data from temp database');
          console.log('📊 OAuthSuccessHandler: Database data details:', {
            profileDataKeys: Object.keys(data.profile_data || {}),
            conversationDataKeys: Object.keys(data.conversation_data || {}),
            promptMode: data.prompt_mode
          });
          
          // Clean up temp record
          console.log('🧹 OAuthSuccessHandler: Cleaning up temp database record...');
          await supabase.from('onboarding_data').delete().eq('user_id', tempId);
          localStorage.removeItem('tempOnboardingId');
          console.log('✅ OAuthSuccessHandler: Temp database record cleaned up');
          
          return { ...recoveredData, recoverySource };
        } else {
          console.log('❌ OAuthSuccessHandler: Strategy 4 FAILED - No temp database data found or error occurred');
        }
      } else {
        console.log('❌ OAuthSuccessHandler: Strategy 4 FAILED - No temp ID found');
      }
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Strategy 4 ERROR - Error reading temp database:', error);
    }
    
    // Strategy 5: Try standard localStorage (might still be there)
    try {
      console.log('🔍 OAuthSuccessHandler: Strategy 5 - Checking standard localStorage...');
      const profile = localStorage.getItem('onboardingProfile');
      const userName = localStorage.getItem('onboardingUserName');
      const conversation = localStorage.getItem('onboardingConversation');
      const promptMode = localStorage.getItem('onboardingPromptMode');
      
      console.log('📊 OAuthSuccessHandler: Standard localStorage check:', {
        hasProfile: !!profile,
        hasUserName: !!userName,
        userNameValue: userName,
        hasConversation: !!conversation,
        hasPromptMode: !!promptMode,
        promptModeValue: promptMode
      });
      
      if (profile || userName || conversation) {
        recoveredData = {
          profile,
          userName,
          conversation,
          promptMode,
          source: 'standard-localStorage'
        };
        recoverySource = 'standard-localStorage';
        console.log('✅ OAuthSuccessHandler: Strategy 5 SUCCESS - Recovered data from standard localStorage');
        return { ...recoveredData, recoverySource };
      } else {
        console.log('❌ OAuthSuccessHandler: Strategy 5 FAILED - No standard localStorage data found');
      }
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Strategy 5 ERROR - Error reading standard localStorage:', error);
    }
    
    console.log('❌ OAuthSuccessHandler: ALL STRATEGIES FAILED - No onboarding data could be recovered');
    return null;
  }
  
  /**
   * Enhanced transfer onboarding data from multiple sources to authenticated user's profile
   */
  static async transferOnboardingData(userId: string): Promise<boolean> {
    try {
      console.log('🚀 OAuthSuccessHandler: Starting enhanced onboarding data transfer for user:', userId);
      
      // Use the new recovery method
      const recoveredData = await this.recoverOnboardingData();
      
      if (!recoveredData) {
        console.log('❌ OAuthSuccessHandler: No onboarding data found after comprehensive recovery');
        return false;
      }
      
      console.log('✅ OAuthSuccessHandler: Successfully recovered data');
      console.log('📊 OAuthSuccessHandler: Recovery details:', {
        source: recoveredData.recoverySource,
        originalSource: recoveredData.source,
        hasProfile: !!recoveredData.profile,
        hasUserName: !!recoveredData.userName,
        userNameValue: recoveredData.userName,
        hasConversation: !!recoveredData.conversation,
        hasPromptMode: !!recoveredData.promptMode,
        promptModeValue: recoveredData.promptMode
      });
      
      let userProfile: UserProfile;
      let conversation: Conversation | null = null;
      
      try {
        // Parse profile data or create default
        if (recoveredData.profile) {
          console.log('🔄 OAuthSuccessHandler: Parsing recovered profile data...');
          userProfile = JSON.parse(recoveredData.profile);
          console.log('✅ OAuthSuccessHandler: Successfully parsed recovered profile');
          console.log('📊 OAuthSuccessHandler: Profile keys:', Object.keys(userProfile));
        } else {
          console.log('🔄 OAuthSuccessHandler: Creating minimal profile from available data...');
          // Create minimal profile from available data
          userProfile = {
            name: recoveredData.userName || "User",
            location: "",
            interests: [],
            socialStyle: "",
            connectionPreferences: "",
            personalInsights: []
          };
          console.log('✅ OAuthSuccessHandler: Created minimal profile from userName:', recoveredData.userName);
        }
        
        // Parse conversation data if available
        if (recoveredData.conversation) {
          console.log('🔄 OAuthSuccessHandler: Parsing recovered conversation data...');
          conversation = JSON.parse(recoveredData.conversation);
          console.log('✅ OAuthSuccessHandler: Successfully parsed recovered conversation');
          console.log('📊 OAuthSuccessHandler: Conversation details:', {
            hasMessages: !!(conversation?.messages),
            messageCount: conversation?.messages?.length || 0,
            hasUserAnswers: !!(conversation?.userAnswers),
            userAnswerCount: conversation?.userAnswers?.length || 0
          });
        } else {
          console.log('⚠️ OAuthSuccessHandler: No conversation data to parse');
        }
      } catch (parseError) {
        console.error('❌ OAuthSuccessHandler: Error parsing recovered data:', parseError);
        console.error('❌ OAuthSuccessHandler: Parse error details:', {
          message: parseError.message,
          profileData: recoveredData.profile?.substring(0, 100),
          conversationData: recoveredData.conversation?.substring(0, 100)
        });
        
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
        console.log('🔄 OAuthSuccessHandler: Created fallback profile due to parse error');
      }
      
      // Ensure name is set from recovered userName if available
      if (recoveredData.userName && (!userProfile.name || userProfile.name === "User")) {
        userProfile.name = recoveredData.userName;
        console.log('✅ OAuthSuccessHandler: Set profile name from recovered userName:', recoveredData.userName);
      }
      
      // Determine prompt mode with fallback
      const finalPromptMode = recoveredData.promptMode || 'gpt-paste';
      console.log('📊 OAuthSuccessHandler: Using prompt mode:', finalPromptMode);
      
      console.log('🗄️ OAuthSuccessHandler: Preparing to update user_data table...');
      
      // Update user_data with the onboarding profile using upsert for reliability
      const updateData = {
        user_id: userId,
        profile_data: userProfile as unknown as Json,
        conversation_data: (conversation || {}) as unknown as Json,
        prompt_mode: finalPromptMode,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString()
      };
      
      console.log('📊 OAuthSuccessHandler: Update data structure:', {
        user_id: updateData.user_id,
        profileDataKeys: Object.keys(userProfile),
        conversationDataKeys: Object.keys(conversation || {}),
        prompt_mode: updateData.prompt_mode,
        has_completed_onboarding: updateData.has_completed_onboarding
      });
      
      const { error: upsertError, data: upsertData } = await supabase
        .from('user_data')
        .upsert(updateData, { 
          onConflict: 'user_id',
          ignoreDuplicates: false 
        })
        .select();
      
      if (upsertError) {
        console.error('❌ OAuthSuccessHandler: Error upserting user_data:', upsertError);
        console.error('❌ OAuthSuccessHandler: Upsert error details:', {
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
          code: upsertError.code
        });
        throw upsertError;
      }
      
      console.log('✅ OAuthSuccessHandler: Successfully transferred onboarding data to database');
      console.log('📊 OAuthSuccessHandler: Upsert result:', {
        dataReturned: !!upsertData,
        recordCount: upsertData?.length || 0
      });
      
      // Clean up all backup data after successful transfer
      this.cleanupBackupData();
      
      return true;
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Error in transferOnboardingData:', error);
      console.error('❌ OAuthSuccessHandler: Transfer error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return false;
    }
  }
  
  /**
   * Clean up all backup data after successful transfer
   */
  private static cleanupBackupData(): void {
    try {
      console.log('🧹 OAuthSuccessHandler: Starting backup data cleanup...');
      
      // Clear sessionStorage
      sessionStorage.removeItem('onboardingBackup');
      console.log('🧹 OAuthSuccessHandler: Cleared sessionStorage backup');
      
      // Clear OAuth-prefixed items
      const oauthKeys = ['oauth_onboardingProfile', 'oauth_onboardingUserName', 'oauth_onboardingConversation', 'oauth_onboardingPromptMode'];
      oauthKeys.forEach(key => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
      console.log('🧹 OAuthSuccessHandler: Cleared OAuth-prefixed items');
      
      // Clear backup with latest key
      const latestBackupKey = localStorage.getItem('latestBackupKey');
      if (latestBackupKey) {
        localStorage.removeItem(latestBackupKey);
        localStorage.removeItem('latestBackupKey');
        console.log('🧹 OAuthSuccessHandler: Cleared latest backup key and data');
      }
      
      // Clear standard onboarding items
      const standardKeys = ['onboardingProfile', 'onboardingUserName', 'onboardingConversation', 'onboardingPromptMode'];
      standardKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      console.log('🧹 OAuthSuccessHandler: Cleared standard onboarding items');
      
      console.log('✅ OAuthSuccessHandler: Backup data cleanup completed');
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Error during cleanup:', error);
    }
  }
  
  /**
   * Enhanced post-auth redirection with better user data handling
   */
  static async handlePostAuthRedirection(userId: string): Promise<string> {
    try {
      console.log('🚀 OAuthSuccessHandler: Starting enhanced post-auth redirection for user:', userId);
      
      // Always attempt to transfer onboarding data first
      console.log('🔄 OAuthSuccessHandler: Attempting to transfer onboarding data...');
      const transferred = await this.transferOnboardingData(userId);
      
      if (transferred) {
        console.log('✅ OAuthSuccessHandler: Onboarding data transferred successfully, redirecting to mirror');
        return '/mirror';
      } else {
        console.log('⚠️ OAuthSuccessHandler: No data transferred, checking existing user data...');
      }
      
      // Check current user data with enhanced retry logic
      let userData = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!userData && attempts < maxAttempts) {
        attempts++;
        console.log(`🔍 OAuthSuccessHandler: Fetching user data (attempt ${attempts}/${maxAttempts})`);
        
        const { data, error } = await supabase
          .from('user_data')
          .select('has_completed_onboarding, profile_data, sso_data, prompt_mode')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('❌ OAuthSuccessHandler: Error fetching user data:', error);
          console.error('❌ OAuthSuccessHandler: Fetch error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          if (attempts === maxAttempts) {
            console.log('❌ OAuthSuccessHandler: Max attempts reached, defaulting to onboarding');
            return '/onboarding';
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        userData = data;
        console.log('📊 OAuthSuccessHandler: User data fetch result:', {
          attempt: attempts,
          hasData: !!userData,
          dataId: userData?.user_id
        });
        
        if (!userData && attempts < maxAttempts) {
          console.log('⏳ OAuthSuccessHandler: No user data found, waiting for trigger...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!userData) {
        console.log('❌ OAuthSuccessHandler: No user data found after retries, redirecting to onboarding');
        return '/onboarding';
      }
      
      console.log('📊 OAuthSuccessHandler: Final user data analysis:', {
        hasCompletedOnboarding: userData.has_completed_onboarding,
        hasProfileData: !!userData.profile_data && Object.keys(userData.profile_data as any || {}).length > 0,
        profileDataKeys: userData.profile_data ? Object.keys(userData.profile_data as any) : [],
        profileDataName: (userData.profile_data as any)?.name,
        hasSsoData: !!userData.sso_data && Object.keys(userData.sso_data as any || {}).length > 0,
        ssoDataKeys: userData.sso_data ? Object.keys(userData.sso_data as any) : [],
        promptMode: userData.prompt_mode
      });
      
      // Enhanced completion check
      const hasCompletedOnboarding = userData.has_completed_onboarding;
      const hasValidProfileData = userData.profile_data && 
                                  Object.keys(userData.profile_data as any || {}).length > 0 &&
                                  (userData.profile_data as any).name;
      
      if (hasCompletedOnboarding && hasValidProfileData) {
        console.log('✅ OAuthSuccessHandler: User has completed onboarding with valid profile, redirecting to mirror');
        return '/mirror';
      }
      
      console.log('🔄 OAuthSuccessHandler: User needs to complete onboarding, redirecting to onboarding');
      return '/onboarding';
      
    } catch (error) {
      console.error('❌ OAuthSuccessHandler: Error in handlePostAuthRedirection:', error);
      console.error('❌ OAuthSuccessHandler: Redirection error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return '/onboarding';
    }
  }
}
