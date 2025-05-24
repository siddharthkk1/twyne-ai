
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
        console.log("User auth state: Authenticated, saving to user_data table");
        
        // For authenticated users, save to user_data table
        const { error } = await supabase
          .from('user_data')
          .insert({
            user_id: user.id,
            profile_data: profile as unknown as Json,
            conversation_data: conversation as unknown as Json,
            prompt_mode: promptMode || 'structured'
          });

        if (error) {
          console.error("Error saving user data:", error);
          throw error;
        }

        console.log("User data saved successfully for authenticated user");
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
