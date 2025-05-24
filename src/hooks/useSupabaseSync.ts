
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
      
      // Get a unique ID for anonymous users
      const anonymousId = localStorage.getItem('anonymous_twyne_id') || crypto.randomUUID();
      
      // If this is a new anonymous user, save the ID
      if (!localStorage.getItem('anonymous_twyne_id')) {
        localStorage.setItem('anonymous_twyne_id', anonymousId);
      }
      
      // If user is logged in, save with user ID, otherwise use anonymous ID
      const userId = user?.id || anonymousId;
      console.log("Using ID for save:", userId);
      console.log("Is anonymous:", !user);
      
      // Debug profile and conversation data
      console.log("Profile data to save:", profile);
      console.log("Conversation data length:", convoData.messages.length);
      
      try {
        // Fix the insert by correctly preparing data for Supabase
        const { error } = await supabase
          .from('onboarding_data')
          .insert({
            user_id: userId,
            is_anonymous: !user,
            profile_data: profile as unknown as Json,
            conversation_data: convoData as unknown as Json,
            prompt_mode: promptMode,
          });
        
        if (error) {
          console.error("Error saving with Supabase client:", error);
          // Try fallback REST API approach
          console.log("Attempting to save data with REST API to onboarding_data table");
          const response = await fetch(`https://lzwkccarbwokfxrzffjd.supabase.co/rest/v1/onboarding_data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE`,
              'apikey': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              user_id: userId,
              is_anonymous: !user,
              profile_data: profile,
              conversation_data: convoData,
              prompt_mode: promptMode,
            })
          });
          
          console.log("REST API response status:", response.status);
          
          if (!response.ok) {
            const errorData = await response.text();
            console.error("Error saving with REST API:", errorData);
            throw new Error(`Failed to save data: ${errorData}`);
          } else {
            console.log("Data saved successfully with REST API");
          }
        } else {
          console.log("Data saved successfully with Supabase client");
        }
        
        // If user is logged in, update their metadata
        if (user) {
          markUserAsOnboarded(profile, convoData, user);
          clearNewUserFlag();
        }
        
        // Show success message to user
        toast({
          title: "Profile Saved",
          description: "Your profile has been saved successfully!",
        });

        return true;
      } catch (innerError) {
        console.error("Error in save operation:", innerError);
        
        // Show error toast for save operation failure
        toast({
          title: "Error",
          description: "Failed to save your profile data. Please try again or contact support.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
      
      // Show generic error message for uncaught exceptions
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving your data.",
        variant: "destructive",
      });
      return false;
    }
  };

  const markUserAsOnboarded = async (profile: UserProfile, conversation: Conversation, user: any) => {
    if (!user) return;
    
    try {
      console.log("Attempting to mark user as onboarded");
      // Save user profile data to user metadata
      const { error } = await supabase.auth.updateUser({
        data: { 
          has_onboarded: true,
          profile_data: profile,
          conversation_data: conversation
        }
      });
      
      if (error) {
        console.error("Error updating user metadata:", error);
        toast({
          title: "Error",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("User has been marked as onboarded");
      }
    } catch (error) {
      console.error("Error marking user as onboarded:", error);
    }
  };

  return { saveOnboardingData };
};
