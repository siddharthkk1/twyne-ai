
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthService } from '@/services/googleAuthService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { Conversation } from '@/types/chat';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshSession } = useAuth();
  const [hasHandledCallback, setHasHandledCallback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Completing authentication...');

  // Helper function to safely extract and validate conversation data
  const extractConversationData = (data: any): Conversation | null => {
    console.log('🔍 AuthCallback: Extracting conversation data:', data);
    
    if (!data || typeof data !== 'object') {
      console.warn('⚠️ AuthCallback: Invalid conversation data - not an object');
      return null;
    }
    
    // Check if it has the expected conversation structure
    if (data.messages && Array.isArray(data.messages) && data.userAnswers && Array.isArray(data.userAnswers)) {
      console.log('✅ AuthCallback: Valid conversation structure found');
      return data as Conversation;
    }
    
    // Try to fix malformed conversation data
    const fixedConversation: Conversation = {
      messages: [],
      userAnswers: []
    };
    
    // Try to extract messages
    if (data.messages) {
      if (Array.isArray(data.messages)) {
        fixedConversation.messages = data.messages;
      } else if (typeof data.messages === 'object' && data.messages.length !== undefined) {
        fixedConversation.messages = Array.from(data.messages);
      }
    }
    
    // Try to extract userAnswers
    if (data.userAnswers) {
      if (Array.isArray(data.userAnswers)) {
        fixedConversation.userAnswers = data.userAnswers;
      } else if (typeof data.userAnswers === 'object' && data.userAnswers.length !== undefined) {
        fixedConversation.userAnswers = Array.from(data.userAnswers);
      }
    }
    
    console.log('🔧 AuthCallback: Fixed conversation data:', {
      originalMessageCount: data.messages?.length || 0,
      originalUserAnswerCount: data.userAnswers?.length || 0,
      fixedMessageCount: fixedConversation.messages.length,
      fixedUserAnswerCount: fixedConversation.userAnswers.length,
      hasValidData: fixedConversation.messages.length > 0 || fixedConversation.userAnswers.length > 0
    });
    
    // Only return if we have some valid data
    return (fixedConversation.messages.length > 0 || fixedConversation.userAnswers.length > 0) 
      ? fixedConversation 
      : null;
  };

  // Helper function to get conversation data from localStorage
  const getConversationFromLocalStorage = (): Conversation | null => {
    console.log('🔍 AuthCallback: Retrieving conversation from localStorage');
    
    const storedConversation = localStorage.getItem('onboarding_conversation') || localStorage.getItem('oauth_onboardingConversation');
    
    if (!storedConversation) {
      console.warn('⚠️ AuthCallback: No conversation data found in localStorage');
      return null;
    }
    
    try {
      const parsedConversation = JSON.parse(storedConversation);
      const validatedConversation = extractConversationData(parsedConversation);
      
      if (validatedConversation) {
        console.log('✅ AuthCallback: Successfully retrieved and validated conversation from localStorage');
        return validatedConversation;
      } else {
        console.warn('⚠️ AuthCallback: Invalid conversation structure in localStorage');
        return null;
      }
    } catch (parseError) {
      console.error('❌ AuthCallback: Error parsing conversation from localStorage:', parseError);
      return null;
    }
  };

  // Detect if this is a CreateAccountPrompt context
  const isCreateAccountPromptContext = () => {
    const oauthContext = localStorage.getItem('oauth_context');
    return oauthContext === 'onboarding_results';
  };

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🚀 AuthCallback: Starting enhanced OAuth callback handler');
      
      // Prevent duplicate processing
      if (hasHandledCallback || isProcessing) {
        console.log('⚠️ AuthCallback: Already handled callback or processing, skipping');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const code = urlParams.get('code');
      const onboardingId = urlParams.get('onboarding_id');

      console.log('🔍 AuthCallback: URL parameters:', { 
        hasError: !!error, 
        errorValue: error,
        hasCode: !!code, 
        hasOnboardingId: !!onboardingId,
        isCreateAccountPrompt: isCreateAccountPromptContext()
      });

      // Handle OAuth errors
      if (error) {
        console.error('❌ AuthCallback: OAuth error detected:', error);
        setStatusMessage('Authentication failed');
        
        // Clean up any stored data if we have an onboarding ID
        if (onboardingId) {
          await GoogleAuthService.cleanupOnboardingData(onboardingId);
        }
        
        toast({
          title: "Authentication Failed",
          description: "There was an error during authentication. Please try again.",
          variant: "destructive",
        });
        
        navigate('/auth');
        return;
      }

      // Wait for AuthContext to complete authentication
      if (isLoading) {
        console.log('⏳ AuthCallback: AuthContext is still loading, waiting...');
        return;
      }

      // If we have a code but no user yet, refresh session once
      if (code && !user) {
        console.log('🔄 AuthCallback: Code present but no user, refreshing session...');
        setStatusMessage('Verifying authentication...');
        setIsProcessing(true);
        
        try {
          await refreshSession();
          // Give AuthContext time to process
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error('❌ AuthCallback: Error refreshing session:', error);
          setStatusMessage('Authentication verification failed');
          navigate('/auth');
          return;
        } finally {
          setIsProcessing(false);
        }
        
        return;
      }

      // Only proceed once we have an authenticated user
      if (!user) {
        console.log('🚪 AuthCallback: No user after auth, redirecting to auth page');
        setStatusMessage('Redirecting...');
        navigate('/auth');
        return;
      }

      // Mark as handled to prevent re-runs
      setHasHandledCallback(true);
      setIsProcessing(true);

      console.log('🎯 AuthCallback: User authenticated, processing onboarding data transfer');
      
      try {
        // Detect context and set appropriate message
        const isCreateAccountPrompt = isCreateAccountPromptContext();
        if (isCreateAccountPrompt) {
          setStatusMessage('Setting up your account...');
          console.log('🎯 AuthCallback: CreateAccountPrompt context detected');
        } else {
          setStatusMessage('Loading your profile...');
          console.log('🎯 AuthCallback: Standard OAuth context');
        }

        // Wait a moment for AuthContext to finish loading user profile
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Get current user data to check onboarding status
        const { data: userData, error: fetchError } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (fetchError) {
          console.error('❌ AuthCallback: Error fetching user data:', fetchError);
          // If we can't fetch user data, redirect to onboarding
          navigate('/onboarding', { replace: true });
          return;
        }

        console.log('✅ AuthCallback: Found user_data:', {
          hasCompletedOnboarding: userData?.has_completed_onboarding,
          hasProfileData: !!userData?.profile_data && Object.keys(userData.profile_data).length > 0,
          hasSsoData: !!userData?.sso_data && Object.keys(userData.sso_data).length > 0
        });

        // Handle onboarding data transfer if needed
        let onboardingDataTransferred = false;

        // Strategy 1: Check URL parameter for onboarding ID
        if (onboardingId) {
          console.log('🔍 AuthCallback: Processing onboarding ID from URL:', onboardingId);
          setStatusMessage('Transferring your profile...');
          
          const onboardingData = await GoogleAuthService.retrieveOnboardingData(onboardingId);
          
          if (onboardingData) {
            console.log('✅ AuthCallback: Retrieved onboarding data from URL parameter');
            
            // Validate conversation data
            const validatedConversation = extractConversationData(onboardingData.conversation) || 
                                          getConversationFromLocalStorage() || 
                                          { messages: [], userAnswers: [] };
            
            const updateData = {
              profile_data: onboardingData.profile || {},
              onboarding_conversation: validatedConversation as any,
              onboarding_mode: onboardingData.promptMode || 'structured',
              has_completed_onboarding: true,
              updated_at: new Date().toISOString()
            };
            
            console.log('🔄 AuthCallback: Transferring onboarding data...');
            
            const { error: updateError } = await supabase
              .from('user_data')
              .update(updateData)
              .eq('user_id', user.id);
            
            if (updateError) {
              console.error('❌ AuthCallback: Error transferring onboarding data:', updateError);
            } else {
              console.log('✅ AuthCallback: Successfully transferred onboarding data');
              onboardingDataTransferred = true;
              
              toast({
                title: "Account created successfully!",
                description: "Welcome to Twyne! Your profile has been saved.",
              });
            }
            
            // Clean up the temporary onboarding data
            await GoogleAuthService.cleanupOnboardingData(onboardingId);
          }
        }

        // Strategy 2: Check localStorage for onboarding data (fallback for CreateAccountPrompt)
        if (!onboardingDataTransferred && isCreateAccountPrompt) {
          console.log('🔍 AuthCallback: Checking localStorage for CreateAccountPrompt data...');
          
          const storedProfile = localStorage.getItem('onboarding_profile') || localStorage.getItem('oauth_onboardingProfile');
          const storedPromptMode = localStorage.getItem('onboarding_prompt_mode') || localStorage.getItem('oauth_onboardingPromptMode');
          const conversationData = getConversationFromLocalStorage();
          
          if (storedProfile && conversationData) {
            try {
              const profileData = JSON.parse(storedProfile);
              const promptMode = storedPromptMode || 'structured';
              
              console.log('✅ AuthCallback: Retrieved onboarding data from localStorage');
              
              const updateData = {
                profile_data: profileData,
                onboarding_conversation: conversationData as any,
                onboarding_mode: promptMode,
                has_completed_onboarding: true,
                updated_at: new Date().toISOString()
              };
              
              console.log('🔄 AuthCallback: Transferring localStorage data...');
              
              const { error: updateError } = await supabase
                .from('user_data')
                .update(updateData)
                .eq('user_id', user.id);
              
              if (updateError) {
                console.error('❌ AuthCallback: Error transferring localStorage data:', updateError);
              } else {
                console.log('✅ AuthCallback: Successfully transferred localStorage data');
                onboardingDataTransferred = true;
                
                // Clean up localStorage after successful transfer
                const keysToRemove = [
                  'temp_onboarding_id', 'onboarding_profile', 'onboarding_user_name',
                  'onboarding_conversation', 'onboarding_prompt_mode', 'onboarding_timestamp',
                  'oauth_onboardingProfile', 'oauth_onboardingUserName', 'oauth_onboardingConversation',
                  'oauth_onboardingPromptMode', 'oauth_temp_onboarding_id', 'oauth_context'
                ];
                
                keysToRemove.forEach(key => localStorage.removeItem(key));
                
                toast({
                  title: "Account created successfully!",
                  description: "Welcome to Twyne! Your profile has been saved.",
                });
              }
            } catch (parseError) {
              console.error('❌ AuthCallback: Error parsing localStorage data:', parseError);
            }
          }
        }

        // Direct navigation based on onboarding status - bypassing HomeWrapper
        if (onboardingDataTransferred || (userData && userData.has_completed_onboarding)) {
          console.log('🎉 AuthCallback: User has completed onboarding, navigating directly to mirror');
          setStatusMessage('Loading your profile...');
          
          // Direct navigation to mirror, bypassing HomeWrapper
          navigate('/mirror', { replace: true });
        } else {
          console.log('🔄 AuthCallback: User needs to complete onboarding');
          setStatusMessage('Redirecting to onboarding...');
          
          // Direct navigation to onboarding, bypassing HomeWrapper
          navigate('/onboarding', { replace: true });
        }
        
      } catch (error) {
        console.error('❌ AuthCallback: Error in post-auth handling:', error);
        setStatusMessage('Setup failed - redirecting...');
        
        // Clean up onboarding data if we have it
        if (onboardingId) {
          await GoogleAuthService.cleanupOnboardingData(onboardingId);
        }
        
        toast({
          title: "Setup Error",
          description: "There was an issue setting up your account. Please complete onboarding manually.",
          variant: "destructive",
        });
        
        // Direct navigation to onboarding, bypassing HomeWrapper
        navigate('/onboarding', { replace: true });
      } finally {
        setIsProcessing(false);
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleCallback();
  }, [isLoading, user, navigate, hasHandledCallback, isProcessing, refreshSession]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg mb-2">{statusMessage}</p>
        
        {isProcessing && (
          <p className="text-sm text-gray-500 mt-2">This may take a moment...</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
