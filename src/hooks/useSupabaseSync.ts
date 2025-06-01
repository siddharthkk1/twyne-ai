
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
        
        // For anonymous users, store in localStorage and generate temporary record with proper UUID
        const finalPromptMode = promptMode || 'structured';
        
        // Enhanced cleanup of any existing anonymous session with duplicate prevention
        const existingTempId = localStorage.getItem('temp_onboarding_id');
        if (existingTempId) {
          console.log("🧹 useSupabaseSync: Cleaning up existing anonymous session:", existingTempId);
          try {
            // Clean up all records with this user_id to prevent duplicates
            await supabase
              .from('onboarding_data')
              .delete()
              .eq('user_id', existingTempId)
              .eq('is_anonymous', true);
            console.log("✅ useSupabaseSync: Cleaned up all existing sessions for user_id:", existingTempId);
          } catch (cleanupError) {
            console.warn("⚠️ useSupabaseSync: Failed to cleanup existing session:", cleanupError);
          }
        }
        
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
          id: tempUserId, // Use proper UUID as id
          user_id: tempUserId, // Use same UUID as user_id for anonymous records
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
          is_anonymous: insertData.is_anonymous
        });

        // Enhanced duplicate prevention: check if record already exists before inserting
        const { data: existingRecord } = await supabase
          .from('onboarding_data')
          .select('id')
          .eq('id', tempUserId)
          .single();

        if (existingRecord) {
          console.log("⚠️ useSupabaseSync: Record with this ID already exists, updating instead");
          const { error, data } = await supabase
            .from('onboarding_data')
            .update({
              profile_data: insertData.profile_data,
              conversation_data: insertData.conversation_data,
              prompt_mode: insertData.prompt_mode,
              is_anonymous: insertData.is_anonymous
            })
            .eq('id', tempUserId)
            .select();

          if (error) {
            console.error("❌ useSupabaseSync: Error updating onboarding data:", error);
            throw error;
          }

          console.log("✅ useSupabaseSync: Data updated successfully for anonymous user");
          console.log("📊 useSupabaseSync: Update result:", {
            dataReturned: !!data,
            recordCount: data?.length || 0,
            updatedId: data?.[0]?.id
          });
        } else {
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
