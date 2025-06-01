
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';

export const useSupabaseSync = () => {
  const { user } = useAuth();

  const saveOnboardingData = async (
    profile: UserProfile, 
    conversation: Conversation, 
    promptMode: string,
    currentUser?: any,
    clearNewUserFlag?: () => void
  ) => {
    try {
      console.log("🔄 useSupabaseSync: Starting to save onboarding data");
      
      if (!currentUser) {
        console.log("⚠️ useSupabaseSync: No user provided, skipping save");
        return;
      }

      // Check if user_data record exists
      const { data: existingData } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      const updateData = {
        profile_data: profile as unknown as Json,
        onboarding_conversation: conversation as unknown as Json,
        onboarding_mode: promptMode,
        has_completed_onboarding: true,
        updated_at: new Date().toISOString()
      };

      if (existingData) {
        // Update existing record
        const { error } = await supabase
          .from('user_data')
          .update(updateData)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_data')
          .insert({
            user_id: currentUser.id,
            ...updateData
          });

        if (error) throw error;
      }

      console.log("✅ useSupabaseSync: Successfully saved onboarding data");
      
      if (clearNewUserFlag) {
        clearNewUserFlag();
      }
    } catch (error) {
      console.error("❌ useSupabaseSync: Error saving onboarding data:", error);
    }
  };

  const cleanupOnboardingData = async (tempOnboardingId?: string) => {
    try {
      console.log("🧹 useSupabaseSync: Starting cleanup of onboarding data");
      
      // Clean up localStorage
      const keysToRemove = [
        'onboardingProfile',
        'onboardingUserName', 
        'onboardingConversation',
        'onboardingPromptMode',
        'onboarding_profile',
        'onboarding_user_name',
        'onboarding_conversation',
        'onboarding_prompt_mode',
        'prompt_mode',
        'temp_onboarding_id',
        'onboarding_timestamp',
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

      // Clean up database records if tempOnboardingId is provided
      if (tempOnboardingId) {
        const { error } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('id', tempOnboardingId);
        
        if (error) {
          console.warn('⚠️ useSupabaseSync: Failed to cleanup database records:', error);
        } else {
          console.log('✅ useSupabaseSync: Successfully cleaned up database records');
        }
      }
      
      console.log("✅ useSupabaseSync: Cleanup completed");
    } catch (error) {
      console.error("❌ useSupabaseSync: Error during cleanup:", error);
    }
  };

  return {
    saveOnboardingData,
    cleanupOnboardingData
  };
};
