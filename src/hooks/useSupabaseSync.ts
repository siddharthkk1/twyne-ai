
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';
import { cleanupOnboardingData } from '@/utils/onboardingStorage';

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
      
      // Only save to authenticated user tables if user is provided
      if (!currentUser) {
        console.log("⚠️ useSupabaseSync: No user provided, skipping authenticated save");
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
      
      // FIXED: Clean up onboarding_data record after successful save
      console.log("🧹 useSupabaseSync: Cleaning up temporary onboarding data");
      await cleanupOnboardingData();
      
      if (clearNewUserFlag) {
        clearNewUserFlag();
      }
    } catch (error) {
      console.error("❌ useSupabaseSync: Error saving onboarding data:", error);
    }
  };

  const cleanupOnboardingDataOnly = async (tempOnboardingId?: string) => {
    try {
      console.log("🧹 useSupabaseSync: Starting cleanup of onboarding data");
      await cleanupOnboardingData(tempOnboardingId);
      console.log("✅ useSupabaseSync: Cleanup completed");
    } catch (error) {
      console.error("❌ useSupabaseSync: Error during cleanup:", error);
    }
  };

  return {
    saveOnboardingData,
    cleanupOnboardingData: cleanupOnboardingDataOnly
  };
};
