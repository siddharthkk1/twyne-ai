
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserProfile, Conversation } from '@/types/chat';
import { PromptModeType } from './usePromptMode';
import type { Json } from '@/integrations/supabase/types';

export const useSupabaseSync = () => {
  const saveOnboardingData = async (
    profile: UserProfile, 
    convoData: Conversation, 
    promptMode: PromptModeType,
    user: any | null,
    clearNewUserFlag: () => void
  ) => {
    try {
      console.log("Starting saveOnboardingData function");
      console.log("User auth state:", user ? "Logged in" : "Anonymous");
      
      if (user) {
        // User is logged in - save to user_data table
        console.log("Saving to user_data table for authenticated user:", user.id);
        
        const { error: userDataError } = await supabase
          .from('user_data')
          .upsert({
            user_id: user.id,
            profile_data: profile as unknown as Json,
            conversation_data: convoData as unknown as Json,
            prompt_mode: promptMode,
            updated_at: new Date().toISOString(),
          });
        
        if (userDataError) {
          console.error("Error saving to user_data table:", userDataError);
          throw new Error(`Failed to save profile data: ${userDataError.message}`);
        }
        
        // Also update user metadata
        const { error: metaError } = await supabase.auth.updateUser({
          data: { 
            has_onboarded: true,
            profile_data: profile,
            conversation_data: convoData
          }
        });
        
        if (metaError) {
          console.error("Error updating user metadata:", metaError);
        }
        
        clearNewUserFlag();
        console.log("Profile data saved successfully for authenticated user");
      } else {
        // User is anonymous - save to onboarding_data table
        const anonymousId = localStorage.getItem('anonymous_twyne_id') || crypto.randomUUID();
        
        if (!localStorage.getItem('anonymous_twyne_id')) {
          localStorage.setItem('anonymous_twyne_id', anonymousId);
        }
        
        console.log("Saving to onboarding_data table for anonymous user:", anonymousId);
        
        const { error } = await supabase
          .from('onboarding_data')
          .insert({
            user_id: anonymousId,
            is_anonymous: true,
            profile_data: profile as unknown as Json,
            conversation_data: convoData as unknown as Json,
            prompt_mode: promptMode,
          });
        
        if (error) {
          console.error("Error saving to onboarding_data table:", error);
          throw new Error(`Failed to save data: ${error.message}`);
        }
        
        console.log("Data saved successfully for anonymous user");
      }
      
      toast({
        title: "Profile Saved",
        description: "Your profile has been saved successfully!",
      });

      return true;
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
      
      toast({
        title: "Error",
        description: "Failed to save your profile data. Please try again or contact support.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { saveOnboardingData };
};
