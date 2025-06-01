
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Conversation } from '@/types/chat';
import { PromptModeType } from './usePromptMode';
import type { Json } from '@/integrations/supabase/types';

export const useSupabaseSync = () => {
  const saveOnboardingData = async (
    profile: UserProfile, 
    conversation: Conversation, 
    promptMode: PromptModeType | string,
    user: any,
    clearNewUserFlag: () => void
  ) => {
    console.log("🚀 useSupabaseSync: Starting saveOnboardingData function");
    console.log("📊 useSupabaseSync: Input parameters:", {
      hasProfile: !!profile,
      profileName: profile?.name,
      profileKeys: profile ? Object.keys(profile) : [],
      hasConversation: !!conversation,
      conversationMessageCount: conversation?.messages?.length || 0,
      conversationUserAnswerCount: conversation?.userAnswers?.length || 0,
      promptMode: promptMode,
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email
    });
    
    try {
      if (user) {
        console.log("✅ useSupabaseSync: User auth state - Authenticated, updating user_data table");
        console.log("📊 useSupabaseSync: Authenticated user details:", {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          createdAt: user.created_at
        });
        
        // Store the prompt mode in localStorage for potential OAuth flow
        const finalPromptMode = promptMode || 'structured';
        localStorage.setItem('onboardingPromptMode', finalPromptMode);
        console.log("💾 useSupabaseSync: Stored prompt mode in localStorage:", finalPromptMode);
        
        // Prepare data for database insertion with explicit field mapping
        const updateData = {
          profile_data: profile as unknown as Json,
          conversation_data: conversation as unknown as Json,
          prompt_mode: finalPromptMode,
          has_completed_onboarding: true,
          updated_at: new Date().toISOString()
        };
        
        console.log("🗄️ useSupabaseSync: Preparing database update with data:", {
          profileDataKeys: Object.keys(profile),
          conversationDataKeys: Object.keys(conversation),
          promptMode: finalPromptMode,
          hasCompletedOnboarding: true,
          conversationMessageCount: conversation?.messages?.length || 0,
          conversationUserAnswerCount: conversation?.userAnswers?.length || 0
        });
        
        // For authenticated users, update the user_data table with explicit upsert
        const { error, data } = await supabase
          .from('user_data')
          .upsert(
            {
              user_id: user.id,
              ...updateData
            },
            {
              onConflict: 'user_id',
              ignoreDuplicates: false
            }
          )
          .select();

        if (error) {
          console.error("❌ useSupabaseSync: Error updating user data:", error);
          throw error;
        }

        console.log("✅ useSupabaseSync: User data updated successfully for authenticated user");
        console.log("📊 useSupabaseSync: Update result:", {
          dataReturned: !!data,
          recordCount: data?.length || 0,
          updatedData: data?.[0] ? {
            hasProfileData: !!data[0].profile_data,
            hasConversationData: !!data[0].conversation_data,
            promptMode: data[0].prompt_mode,
            hasCompletedOnboarding: data[0].has_completed_onboarding
          } : null
        });

        // Enhanced cleanup of any temporary onboarding_data records
        await cleanupOnboardingData(user.id);
        
        clearNewUserFlag();
      } else {
        console.log("⚠️ useSupabaseSync: User auth state - Anonymous");
        
        // For anonymous users, store in localStorage and generate temporary record with proper UUID
        const finalPromptMode = promptMode || 'structured';
        
        // Enhanced cleanup of any existing anonymous session
        await cleanupExistingAnonymousSessions();
        
        // Generate proper UUID for the session with fallback
        let tempUserId: string;
        try {
          tempUserId = crypto.randomUUID();
          console.log("🔑 useSupabaseSync: Generated proper UUID using crypto.randomUUID():", tempUserId);
        } catch (cryptoError) {
          // Fallback for older browsers
          console.warn("⚠️ useSupabaseSync: crypto.randomUUID() not available, using fallback");
          tempUserId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
          console.log("🔑 useSupabaseSync: Generated fallback ID:", tempUserId);
        }
        
        console.log("💾 useSupabaseSync: Storing data in localStorage for anonymous user...");
        localStorage.setItem('temp_onboarding_id', tempUserId);
        localStorage.setItem('onboarding_profile', JSON.stringify(profile));
        localStorage.setItem('onboarding_user_name', profile.name || '');
        localStorage.setItem('onboarding_conversation', JSON.stringify(conversation));
        localStorage.setItem('onboarding_prompt_mode', finalPromptMode);
        localStorage.setItem('onboarding_timestamp', Date.now().toString());
        
        console.log("📊 useSupabaseSync: LocalStorage data stored:", {
          tempId: tempUserId,
          profileStored: !!localStorage.getItem('onboarding_profile'),
          userNameStored: !!localStorage.getItem('onboarding_user_name'),
          userNameValue: localStorage.getItem('onboarding_user_name'),
          conversationStored: !!localStorage.getItem('onboarding_conversation'),
          promptModeStored: !!localStorage.getItem('onboarding_prompt_mode'),
          promptModeValue: localStorage.getItem('onboarding_prompt_mode')
        });
        
        console.log("🗄️ useSupabaseSync: Saving to onboarding_data table for anonymous user with proper UUID:", tempUserId);

        const insertData = {
          id: tempUserId,
          user_id: tempUserId,
          profile_data: profile as unknown as Json,
          conversation_data: conversation as unknown as Json,
          prompt_mode: finalPromptMode,
          is_anonymous: true
        };
        
        console.log("📊 useSupabaseSync: Database insert data:", {
          id: insertData.id,
          user_id: insertData.user_id,
          profileDataKeys: Object.keys(profile),
          conversationDataKeys: Object.keys(conversation),
          prompt_mode: insertData.prompt_mode,
          is_anonymous: insertData.is_anonymous,
          conversationMessageCount: conversation?.messages?.length || 0,
          conversationUserAnswerCount: conversation?.userAnswers?.length || 0
        });

        // Use insert instead of upsert to avoid conflicts and ensure new record
        const { error, data } = await supabase
          .from('onboarding_data')
          .insert(insertData)
          .select();

        if (error) {
          console.error("❌ useSupabaseSync: Error saving onboarding data:", error);
          throw error;
        }

        console.log("✅ useSupabaseSync: Data saved successfully for anonymous user");
        console.log("📊 useSupabaseSync: Insert result:", {
          dataReturned: !!data,
          recordCount: data?.length || 0,
          insertedId: data?.[0]?.id,
          insertedData: data?.[0] ? {
            hasProfileData: !!data[0].profile_data,
            hasConversationData: !!data[0].conversation_data,
            promptMode: data[0].prompt_mode,
            isAnonymous: data[0].is_anonymous
          } : null
        });
      }
    } catch (error) {
      console.error("❌ useSupabaseSync: Error in saveOnboardingData:", error);
      throw error;
    }
  };

  // Enhanced function to clean up existing anonymous sessions
  const cleanupExistingAnonymousSessions = async () => {
    try {
      console.log("🧹 useSupabaseSync: Starting cleanup of existing anonymous sessions");
      
      // Get existing temp onboarding ID from localStorage
      const existingTempId = localStorage.getItem('temp_onboarding_id');
      
      if (existingTempId) {
        console.log("🗄️ useSupabaseSync: Cleaning up existing anonymous session:", existingTempId);
        
        // Clean up any records with this specific ID or user_id
        const { error } = await supabase
          .from('onboarding_data')
          .delete()
          .or(`id.eq.${existingTempId},user_id.eq.${existingTempId}`)
          .eq('is_anonymous', true);
        
        if (error) {
          console.warn("⚠️ useSupabaseSync: Failed to cleanup existing session:", error);
        } else {
          console.log("✅ useSupabaseSync: Successfully cleaned up existing session records");
        }
      }
      
      // Also clean up any other anonymous records that might be stale (older than 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { error: staleCleanupError } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('is_anonymous', true)
        .lt('created_at', oneHourAgo);
      
      if (staleCleanupError) {
        console.warn("⚠️ useSupabaseSync: Failed to cleanup stale anonymous records:", staleCleanupError);
      } else {
        console.log("✅ useSupabaseSync: Successfully cleaned up stale anonymous records");
      }
      
    } catch (error) {
      console.error("❌ useSupabaseSync: Error during cleanup:", error);
    }
  };

  // Enhanced cleanup function with better targeting of session-related records
  const cleanupOnboardingData = async (userId: string) => {
    try {
      console.log("🧹 useSupabaseSync: Starting comprehensive cleanup of onboarding_data records for user:", userId);
      
      // Get temp onboarding ID from localStorage
      const tempOnboardingId = localStorage.getItem('temp_onboarding_id');
      
      // Enhanced cleanup: remove ALL anonymous records that could be related to this session
      const cleanupPromises = [];
      
      if (tempOnboardingId) {
        console.log("🗄️ useSupabaseSync: Cleaning up records with session ID:", tempOnboardingId);
        
        // Clean up records where id or user_id matches the temp session ID
        cleanupPromises.push(
          supabase
            .from('onboarding_data')
            .delete()
            .or(`id.eq.${tempOnboardingId},user_id.eq.${tempOnboardingId}`)
            .eq('is_anonymous', true)
        );
      }
      
      // Clean up any anonymous records older than 24 hours (general cleanup)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      cleanupPromises.push(
        supabase
          .from('onboarding_data')
          .delete()
          .eq('is_anonymous', true)
          .lt('created_at', twentyFourHoursAgo)
      );
      
      // Execute all cleanup operations
      const results = await Promise.allSettled(cleanupPromises);
      
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.warn(`⚠️ useSupabaseSync: Cleanup operation ${index + 1} failed:`, result.reason);
        } else {
          console.log(`✅ useSupabaseSync: Cleanup operation ${index + 1} completed successfully`);
        }
      });
      
      // Clean up localStorage items related to onboarding
      const keysToRemove = [
        'temp_onboarding_id',
        'onboarding_profile',
        'onboarding_user_name',
        'onboarding_conversation',
        'onboarding_prompt_mode',
        'onboarding_timestamp',
        'latestBackupKey',
        'oauth_onboardingProfile',
        'oauth_onboardingUserName',
        'oauth_onboardingConversation',
        'oauth_onboardingPromptMode',
        'oauth_temp_onboarding_id'
      ];
      
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`🧹 useSupabaseSync: Removed localStorage key: ${key}`);
        }
      });
      
      // Clean up sessionStorage
      const sessionKeysToRemove = [
        'onboarding_profile',
        'onboarding_user_name',
        'onboarding_conversation',
        'onboarding_prompt_mode',
        'temp_onboarding_id',
        'onboardingBackup'
      ];
      
      sessionKeysToRemove.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key);
          console.log(`🧹 useSupabaseSync: Removed sessionStorage key: ${key}`);
        }
      });
      
      console.log("✅ useSupabaseSync: Comprehensive cleanup completed successfully");
      
    } catch (error) {
      console.error("❌ useSupabaseSync: Error during comprehensive cleanup:", error);
    }
  };

  return {
    saveOnboardingData
  };
};
