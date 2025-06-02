
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, Conversation } from '@/types/chat';
import type { Json } from '@/integrations/supabase/types';

export interface OnboardingStorageResult {
  sessionId: string;
  success: boolean;
  error?: string;
}

/**
 * Shared utility function for storing onboarding data securely
 * Works for both authenticated and anonymous users
 */
export const storeOnboardingDataSecurely = async (
  profileData: UserProfile, 
  conversationData: Conversation, 
  promptMode: string
): Promise<OnboardingStorageResult> => {
  try {
    console.log('🚀 OnboardingStorage: Starting enhanced data storage...');
    console.log('📊 OnboardingStorage: Profile name:', profileData.name);
    
    const timestamp = Date.now();
    
    // Enhanced cleanup: Remove existing anonymous sessions first
    console.log('🧹 OnboardingStorage: Performing cleanup of existing anonymous sessions...');
    
    const existingSessionId = localStorage.getItem('temp_onboarding_id');
    if (existingSessionId) {
      console.log('🗄️ OnboardingStorage: Found existing session, cleaning up:', existingSessionId);
      
      try {
        // Clean up existing records - now works with RLS policies
        const { error: deleteError } = await supabase
          .from('onboarding_data')
          .delete()
          .eq('id', existingSessionId);
        
        if (deleteError) {
          console.warn('⚠️ OnboardingStorage: Failed to cleanup existing session records:', deleteError);
        } else {
          console.log('✅ OnboardingStorage: Successfully cleaned up existing session records');
        }
      } catch (cleanupError) {
        console.warn('⚠️ OnboardingStorage: Error during session cleanup:', cleanupError);
      }
    }
    
    // Generate proper UUID for the session
    let tempId: string;
    try {
      tempId = crypto.randomUUID();
      console.log('🔑 OnboardingStorage: Generated UUID using crypto.randomUUID():', tempId);
    } catch (cryptoError) {
      // Fallback for older browsers
      console.warn('⚠️ OnboardingStorage: crypto.randomUUID() not available, using fallback');
      tempId = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
      console.log('🔑 OnboardingStorage: Generated fallback ID:', tempId);
    }
    
    // Clear previous localStorage entries to prevent conflicts
    const keysToRemove = [
      'temp_onboarding_id',
      'onboarding_profile',
      'onboarding_user_name',
      'onboarding_conversation',
      'onboarding_prompt_mode',
      'onboarding_timestamp'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 OnboardingStorage: Cleared existing localStorage key: ${key}`);
      }
    });
    
    // ENHANCED: Store with improved userName handling
    localStorage.setItem('temp_onboarding_id', tempId);
    localStorage.setItem('onboarding_profile', JSON.stringify(profileData));
    
    // ENHANCED: Store userName with multiple fallbacks
    const userNameToStore = profileData.name || '';
    localStorage.setItem('onboarding_user_name', userNameToStore);
    localStorage.setItem('onboardingUserName', userNameToStore); // Additional key for compatibility
    
    localStorage.setItem('onboarding_conversation', JSON.stringify(conversationData));
    localStorage.setItem('onboarding_prompt_mode', promptMode);
    localStorage.setItem('onboarding_timestamp', timestamp.toString());
    
    console.log('💾 OnboardingStorage: Enhanced localStorage completed with session ID:', tempId);
    console.log('📊 OnboardingStorage: Stored userName:', userNameToStore);
    
    // Enhanced sessionStorage backup
    sessionStorage.setItem('onboarding_profile', JSON.stringify(profileData));
    sessionStorage.setItem('onboarding_user_name', userNameToStore);
    sessionStorage.setItem('onboardingUserName', userNameToStore); // Additional key
    sessionStorage.setItem('onboarding_conversation', JSON.stringify(conversationData));
    sessionStorage.setItem('onboarding_prompt_mode', promptMode);
    sessionStorage.setItem('temp_onboarding_id', tempId);
    console.log('💾 OnboardingStorage: Enhanced sessionStorage backup completed');
    
    // Enhanced database storage using insert with proper JSON conversion
    console.log('🗄️ OnboardingStorage: Attempting database storage with proper UUID:', tempId);
    
    const insertData = {
      id: tempId,
      profile_data: profileData as unknown as Json,
      onboarding_conversation: conversationData as unknown as Json,
      onboarding_mode: promptMode
    };
    
    console.log('📊 OnboardingStorage: Database insert data:', {
      id: insertData.id,
      profileDataKeys: Object.keys(profileData),
      profileName: profileData.name,
      conversationDataKeys: Object.keys(conversationData),
      onboarding_mode: insertData.onboarding_mode,
      conversationMessageCount: conversationData?.messages?.length || 0,
      conversationUserAnswerCount: conversationData?.userAnswers?.length || 0
    });
    
    // Use insert to create new record - now compatible with RLS policies
    const { error, data } = await supabase
      .from('onboarding_data')
      .insert(insertData)
      .select();
    
    if (error) {
      console.error('❌ OnboardingStorage: Database storage failed:', error);
      throw error;
    } else {
      console.log('✅ OnboardingStorage: Database storage successful with UUID:', tempId);
      console.log('📊 OnboardingStorage: Database result:', {
        dataReturned: !!data,
        recordCount: data?.length || 0,
        savedData: data?.[0] ? {
          hasProfileData: !!data[0].profile_data,
          hasConversationData: !!data[0].onboarding_conversation,
          onboardingMode: data[0].onboarding_mode
        } : null
      });
    }
    
    console.log('✅ OnboardingStorage: All enhanced data storage strategies completed successfully');
    return {
      sessionId: tempId,
      success: true
    };
  } catch (error) {
    console.error('❌ OnboardingStorage: Error in enhanced storage:', error);
    return {
      sessionId: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Clean up onboarding data after successful account creation
 */
export const cleanupOnboardingData = async (sessionId?: string): Promise<void> => {
  try {
    console.log('🧹 OnboardingStorage: Starting cleanup of onboarding data');
    
    // Get sessionId from localStorage if not provided
    const tempId = sessionId || localStorage.getItem('temp_onboarding_id');
    
    // Clean up localStorage
    const keysToRemove = [
      'temp_onboarding_id',
      'onboarding_profile',
      'onboarding_user_name',
      'onboardingUserName', // Additional key
      'onboarding_conversation',
      'onboarding_prompt_mode',
      'onboarding_timestamp'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 OnboardingStorage: Removed localStorage key: ${key}`);
      }
    });

    // Clean up sessionStorage
    keysToRemove.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`🧹 OnboardingStorage: Removed sessionStorage key: ${key}`);
      }
    });

    // Clean up database records if tempId is available
    if (tempId) {
      console.log('🗄️ OnboardingStorage: Cleaning up database records for session:', tempId);
      
      const { error } = await supabase
        .from('onboarding_data')
        .delete()
        .eq('id', tempId);
      
      if (error) {
        console.warn('⚠️ OnboardingStorage: Failed to cleanup database records:', error);
      } else {
        console.log('✅ OnboardingStorage: Successfully cleaned up database records');
      }
    }
    
    console.log('✅ OnboardingStorage: Cleanup completed successfully');
  } catch (error) {
    console.error('❌ OnboardingStorage: Error during cleanup:', error);
  }
};
