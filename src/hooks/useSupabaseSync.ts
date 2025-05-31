
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
        
        // Prepare data for database insertion
        const updateData = {
          profile_data: profile as unknown as Json,
          conversation_data: conversation as unknown as Json,
          prompt_mode: finalPromptMode,
          has_completed_onboarding: true
        };
        
        console.log("🗄️ useSupabaseSync: Preparing database update with data:", {
          profileDataKeys: Object.keys(profile),
          conversationDataKeys: Object.keys(conversation),
          promptMode: finalPromptMode,
          hasCompletedOnboarding: true
        });
        
        // For authenticated users, update the user_data table with onboarding completion
        const { error, data } = await supabase
          .from('user_data')
          .update(updateData)
          .eq('user_id', user.id)
          .select();

        if (error) {
          console.error("❌ useSupabaseSync: Error updating user data:", error);
          console.error("❌ useSupabaseSync: Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log("✅ useSupabaseSync: User data updated successfully for authenticated user");
        console.log("📊 useSupabaseSync: Update result:", {
          dataReturned: !!data,
          recordCount: data?.length || 0
        });
        clearNewUserFlag();
      } else {
        console.log("⚠️ useSupabaseSync: User auth state - Anonymous");
        
        // For anonymous users, store in localStorage and generate temporary record
        const finalPromptMode = promptMode || 'structured';
        
        console.log("💾 useSupabaseSync: Storing data in localStorage for anonymous user...");
        localStorage.setItem('onboardingProfile', JSON.stringify(profile));
        localStorage.setItem('onboardingUserName', profile.name || '');
        localStorage.setItem('onboardingConversation', JSON.stringify(conversation));
        localStorage.setItem('onboardingPromptMode', finalPromptMode);
        
        console.log("📊 useSupabaseSync: LocalStorage data stored:", {
          profileStored: !!localStorage.getItem('onboardingProfile'),
          userNameStored: !!localStorage.getItem('onboardingUserName'),
          userNameValue: localStorage.getItem('onboardingUserName'),
          conversationStored: !!localStorage.getItem('onboardingConversation'),
          promptModeStored: !!localStorage.getItem('onboardingPromptMode'),
          promptModeValue: localStorage.getItem('onboardingPromptMode')
        });
        
        // Generate a temporary ID and save to onboarding_data
        const tempUserId = crypto.randomUUID();
        console.log("🗄️ useSupabaseSync: Saving to onboarding_data table for anonymous user:", tempUserId);

        const insertData = {
          user_id: tempUserId,
          profile_data: profile as unknown as Json,
          conversation_data: conversation as unknown as Json,
          prompt_mode: finalPromptMode,
          is_anonymous: true
        };
        
        console.log("📊 useSupabaseSync: Database insert data:", {
          user_id: insertData.user_id,
          profileDataKeys: Object.keys(profile),
          conversationDataKeys: Object.keys(conversation),
          prompt_mode: insertData.prompt_mode,
          is_anonymous: insertData.is_anonymous
        });

        const { error, data } = await supabase
          .from('onboarding_data')
          .insert(insertData)
          .select();

        if (error) {
          console.error("❌ useSupabaseSync: Error saving onboarding data:", error);
          console.error("❌ useSupabaseSync: Error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log("✅ useSupabaseSync: Data saved successfully for anonymous user");
        console.log("📊 useSupabaseSync: Insert result:", {
          dataReturned: !!data,
          recordCount: data?.length || 0,
          insertedId: data?.[0]?.id
        });
      }
    } catch (error) {
      console.error("❌ useSupabaseSync: Error in saveOnboardingData:", error);
      console.error("❌ useSupabaseSync: Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    }
  };

  return {
    saveOnboardingData
  };
};
