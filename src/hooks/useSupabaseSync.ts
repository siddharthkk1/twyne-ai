
import { supabase } from "@/integrations/supabase/client";
import { UserProfile, Conversation } from '@/types/chat';
import { PromptModeType } from './usePromptMode';
import type { Json } from '@/integrations/supabase/types';

export const useSupabaseSync = () => {
  const saveOnboardingData = async (
    profile: UserProfile, 
    conversation: Conversation, 
    promptMode: PromptModeType,
    user: any,
    clearNewUserFlag: () => void
  ) => {
    console.log("Starting saveOnboardingData function");
    
    try {
      if (user) {
        console.log("User auth state: Authenticated, updating user_data table");
        
        // For authenticated users, update the user_data table with onboarding completion
        const { error } = await supabase
          .from('user_data')
          .update({
            profile_data: profile as unknown as Json,
            conversation_data: conversation as unknown as Json,
            prompt_mode: promptMode || 'structured',
            has_completed_onboarding: true
          })
          .eq('user_id', user.id);

        if (error) {
          console.error("Error updating user data:", error);
          throw error;
        }

        console.log("User data updated successfully for authenticated user");
        clearNewUserFlag();
      } else {
        console.log("User auth state: Anonymous");
        
        // For anonymous users, generate a temporary ID and save to onboarding_data
        const tempUserId = crypto.randomUUID();
        console.log("Saving to onboarding_data table for anonymous user:", tempUserId);

        const { error } = await supabase
          .from('onboarding_data')
          .insert({
            user_id: tempUserId,
            profile_data: profile as unknown as Json,
            conversation_data: conversation as unknown as Json,
            prompt_mode: promptMode || 'structured',
            is_anonymous: true
          });

        if (error) {
          console.error("Error saving onboarding data:", error);
          throw error;
        }

        console.log("Data saved successfully for anonymous user");
      }
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
      throw error;
    }
  };

  return {
    saveOnboardingData
  };
};
