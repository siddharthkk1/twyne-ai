
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
  const [isNewUser, setIsNewUser] = useState<boolean | null>(null);

  // ENHANCED: Helper function to safely extract and validate conversation data with improved validation
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
    
    // ENHANCED: Try to fix malformed conversation data with more robust validation
    const fixedConversation: Conversation = {
      messages: [],
      userAnswers: []
    };
    
    // Try to extract messages
    if (data.messages) {
      if (Array.isArray(data.messages)) {
        fixedConversation.messages = data.messages;
      } else if (typeof data.messages === 'object' && data.messages.length !== undefined) {
        // Handle array-like objects
        fixedConversation.messages = Array.from(data.messages);
      }
    }
    
    // Try to extract userAnswers
    if (data.userAnswers) {
      if (Array.isArray(data.userAnswers)) {
        fixedConversation.userAnswers = data.userAnswers;
      } else if (typeof data.userAnswers === 'object' && data.userAnswers.length !== undefined) {
        // Handle array-like objects
        fixedConversation.userAnswers = Array.from(data.userAnswers);
      }
    }
    
    // ENHANCED: Additional fallback - try to extract from nested structures
    if (fixedConversation.messages.length === 0 && fixedConversation.userAnswers.length === 0) {
      // Check if data is wrapped in another object
      const keys = Object.keys(data);
      for (const key of keys) {
        if (data[key] && typeof data[key] === 'object') {
          const nestedResult = extractConversationData(data[key]);
          if (nestedResult && (nestedResult.messages.length > 0 || nestedResult.userAnswers.length > 0)) {
            console.log('✅ AuthCallback: Found valid conversation data in nested structure');
            return nestedResult;
          }
        }
      }
    }
    
    console.log('🔧 AuthCallback: Fixed conversation data:', {
      originalMessageCount: data.messages?.length || 0,
      originalUserAnswerCount: data.userAnswers?.length || 0,
      fixedMessageCount: fixedConversation.messages.length,
      fixedUserAnswerCount: fixedConversation.userAnswers.length,
      hasValidData: fixedConversation.messages.length > 0 || fixedConversation.userAnswers.length > 0
    });
    
    // Only return if we have some valid data, otherwise return null
    return (fixedConversation.messages.length > 0 || fixedConversation.userAnswers.length > 0) 
      ? fixedConversation 
      : null;
  };

  // ENHANCED: Helper function to get conversation data from localStorage with improved parsing
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

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🚀 AuthCallback: Starting OAuth callback handler with enhanced conversation data preservation');
      
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
        codeLength: code?.length || 0,
        hasOnboardingId: !!onboardingId,
        onboardingIdValue: onboardingId,
        fullUrl: window.location.href
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
        
        navigate('/');
        return;
      }

      // If we have a code but no user yet, wait for authentication to complete
      if (code && !user && !isLoading) {
        console.log('🔄 AuthCallback: Code present but no user, refreshing session...');
        setStatusMessage('Verifying authentication...');
        
        setIsProcessing(true);
        
        try {
          await refreshSession();
          // Give more time for the session to be established
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          if (!user) {
            console.warn('⚠️ AuthCallback: Session refresh completed but no user found');
            setStatusMessage('Authentication verification failed');
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('❌ AuthCallback: Error refreshing session:', error);
          setStatusMessage('Authentication verification failed');
        } finally {
          setIsProcessing(false);
        }
        
        return;
      }
      
      // Only proceed if auth is not loading and we have a user
      if (!isLoading && user) {
        console.log('🎯 AuthCallback: User authenticated, processing enhanced conversation data transfer');
        
        setHasHandledCallback(true);
        setIsProcessing(true);
        
        try {
          // Add a small delay to ensure trigger has time to execute
          console.log('⏳ AuthCallback: Waiting for user_data trigger to complete...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Enhanced user_data record checking with retry logic
          console.log('🔍 AuthCallback: Checking user_data record with enhanced retry logic...');
          let userData = null;
          let retryCount = 0;
          const maxRetries = 5;
          
          while (!userData && retryCount < maxRetries) {
            const { data, error: fetchError } = await supabase
              .from('user_data')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            
            if (fetchError) {
              console.error('❌ AuthCallback: Error fetching user data:', fetchError);
              throw fetchError;
            }
            
            userData = data;
            
            if (!userData) {
              retryCount++;
              console.log(`⏳ AuthCallback: User data not found, retry ${retryCount}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
          
          // If no user_data record exists after retries, create one (fallback)
          if (!userData) {
            console.log('⚠️ AuthCallback: No user_data record found after retries, creating fallback record');
            setStatusMessage('Creating your profile...');
            
            const { data: newUserData, error: insertError } = await supabase
              .from('user_data')
              .insert({
                user_id: user.id,
                profile_data: {},
                sso_data: {
                  email: user.email,
                  name: user.user_metadata?.name || user.user_metadata?.full_name,
                  picture: user.user_metadata?.picture || user.user_metadata?.avatar_url,
                  provider: user.app_metadata?.provider || 'google'
                },
                onboarding_conversation: {},
                onboarding_mode: 'structured',
                has_completed_onboarding: false
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('❌ AuthCallback: Error creating user_data record:', insertError);
              throw insertError;
            } else {
              userData = newUserData;
              console.log('✅ AuthCallback: Created fallback user_data record');
            }
          } else {
            console.log('✅ AuthCallback: Found existing user_data record');
          }
          
          // Determine if this is a new user or returning user
          const userHasCompletedOnboarding = userData?.has_completed_onboarding;
          setIsNewUser(!userHasCompletedOnboarding);
          
          // Set appropriate status message based on user type
          if (userHasCompletedOnboarding) {
            setStatusMessage('Welcome back! Loading your profile...');
          } else {
            setStatusMessage('Setting up your account...');
          }
          
          // ENHANCED: onboarding data retrieval and transfer with improved conversation validation
          let onboardingDataTransferred = false;
          
          // Strategy 1: Check URL parameter for onboarding ID
          if (onboardingId && userData) {
            console.log('🔍 AuthCallback: Processing onboarding ID from URL with enhanced conversation validation:', onboardingId);
            setStatusMessage('Transferring your profile...');
            
            const onboardingData = await GoogleAuthService.retrieveOnboardingData(onboardingId);
            
            if (onboardingData) {
              console.log('✅ AuthCallback: Retrieved onboarding data from URL parameter');
              
              // ENHANCED: Validate conversation data before transfer
              const validatedConversation = extractConversationData(onboardingData.conversation);
              
              if (!validatedConversation) {
                console.warn('⚠️ AuthCallback: Invalid conversation data from URL, trying localStorage fallback');
                const fallbackConversation = getConversationFromLocalStorage();
                if (fallbackConversation) {
                  console.log('✅ AuthCallback: Using fallback conversation from localStorage');
                }
              }
              
              // Enhanced transfer with explicit field mapping and validation
              const updateData = {
                profile_data: onboardingData.profile || {},
                onboarding_conversation: validatedConversation || getConversationFromLocalStorage() || { messages: [], userAnswers: [] } as any,
                onboarding_mode: onboardingData.promptMode || 'structured',
                has_completed_onboarding: true,
                updated_at: new Date().toISOString()
              };
              
              console.log('🔄 AuthCallback: Transferring onboarding data with enhanced conversation validation...');
              
              // Safe conversation data extraction for logging
              const conversationData = extractConversationData(updateData.onboarding_conversation);
              console.log('📊 AuthCallback: Update data to transfer:', {
                hasProfileData: !!updateData.profile_data && Object.keys(updateData.profile_data).length > 0,
                hasConversationData: !!updateData.onboarding_conversation && Object.keys(updateData.onboarding_conversation).length > 0,
                onboardingMode: updateData.onboarding_mode,
                hasCompletedOnboarding: updateData.has_completed_onboarding,
                conversationMessageCount: conversationData?.messages?.length || 0,
                conversationUserAnswerCount: conversationData?.userAnswers?.length || 0,
                conversationIsValid: !!conversationData
              });
              
              const { error: updateError, data: updatedData } = await supabase
                .from('user_data')
                .update(updateData)
                .eq('user_id', user.id)
                .select();
              
              if (updateError) {
                console.error('❌ AuthCallback: Error transferring onboarding data:', updateError);
              } else {
                console.log('✅ AuthCallback: Successfully transferred onboarding data with conversation validation');
                onboardingDataTransferred = true;
                setIsNewUser(true); // Mark as new user since they completed onboarding
                
                toast({
                  title: "Account created successfully!",
                  description: "Welcome to Twyne! Your profile has been saved.",
                });
              }
              
              // Clean up the temporary onboarding data
              await GoogleAuthService.cleanupOnboardingData(onboardingId);
            } else {
              console.log('⚠️ AuthCallback: No onboarding data found for URL ID, checking localStorage');
            }
          }
          
          // Strategy 2: Check localStorage for onboarding data (fallback) with enhanced conversation validation
          if (!onboardingDataTransferred) {
            console.log('🔍 AuthCallback: Checking localStorage for onboarding data with enhanced conversation validation...');
            
            const tempOnboardingId = localStorage.getItem('temp_onboarding_id') || localStorage.getItem('oauth_temp_onboarding_id');
            const storedProfile = localStorage.getItem('onboarding_profile') || localStorage.getItem('oauth_onboardingProfile');
            const storedPromptMode = localStorage.getItem('onboarding_prompt_mode') || localStorage.getItem('oauth_onboardingPromptMode');
            
            // ENHANCED: Use the improved conversation retrieval function
            const conversationData = getConversationFromLocalStorage();
            
            console.log('📊 AuthCallback: localStorage onboarding data check:', {
              hasTempId: !!tempOnboardingId,
              tempId: tempOnboardingId,
              hasProfile: !!storedProfile,
              hasConversation: !!conversationData,
              hasPromptMode: !!storedPromptMode,
              promptModeValue: storedPromptMode,
              conversationMessageCount: conversationData?.messages?.length || 0,
              conversationUserAnswerCount: conversationData?.userAnswers?.length || 0
            });
            
            if (tempOnboardingId && storedProfile && conversationData) {
              try {
                const profileData = JSON.parse(storedProfile);
                const promptMode = storedPromptMode || 'structured';
                
                console.log('✅ AuthCallback: Retrieved comprehensive onboarding data from localStorage with conversation validation');
                
                // Enhanced transfer with validation
                const updateData = {
                  profile_data: profileData,
                  onboarding_conversation: conversationData as any,
                  onboarding_mode: promptMode,
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                };
                
                console.log('🔄 AuthCallback: Transferring localStorage data with enhanced conversation validation...');
                
                console.log('📊 AuthCallback: localStorage data to transfer:', {
                  hasProfileData: !!updateData.profile_data && Object.keys(updateData.profile_data).length > 0,
                  hasConversationData: !!updateData.onboarding_conversation && Object.keys(updateData.onboarding_conversation).length > 0,
                  onboardingMode: updateData.onboarding_mode,
                  conversationMessageCount: conversationData.messages.length,
                  conversationUserAnswerCount: conversationData.userAnswers.length,
                  conversationIsValid: !!conversationData
                });
                
                const { error: updateError, data: updatedData } = await supabase
                  .from('user_data')
                  .update(updateData)
                  .eq('user_id', user.id)
                  .select();
                
                if (updateError) {
                  console.error('❌ AuthCallback: Error transferring localStorage data:', updateError);
                } else {
                  console.log('✅ AuthCallback: Successfully transferred localStorage data with conversation validation');
                  onboardingDataTransferred = true;
                  setIsNewUser(true); // Mark as new user since they completed onboarding
                  
                  // Clean up localStorage after successful transfer
                  const keysToRemove = [
                    'temp_onboarding_id',
                    'onboarding_profile',
                    'onboarding_user_name',
                    'onboarding_conversation',
                    'onboarding_prompt_mode',
                    'onboarding_timestamp',
                    'oauth_onboardingProfile',
                    'oauth_onboardingUserName',
                    'oauth_onboardingConversation',
                    'oauth_onboardingPromptMode',
                    'oauth_temp_onboarding_id'
                  ];
                  
                  keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`🧹 AuthCallback: Removed localStorage key: ${key}`);
                  });
                  
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
          
          // Strategy 3: Check database for anonymous onboarding records with enhanced conversation validation
          if (!onboardingDataTransferred) {
            console.log('🔍 AuthCallback: Checking database for anonymous onboarding records with enhanced conversation validation...');
            
            const tempOnboardingId = localStorage.getItem('temp_onboarding_id') || localStorage.getItem('oauth_temp_onboarding_id');
            if (tempOnboardingId) {
              const { data: onboardingRecords, error: fetchError } = await supabase
                .from('onboarding_data')
                .select('*')
                .or(`id.eq.${tempOnboardingId}`)
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (fetchError) {
                console.error('❌ AuthCallback: Error fetching onboarding records:', fetchError);
              } else if (onboardingRecords && onboardingRecords.length > 0) {
                const record = onboardingRecords[0];
                console.log('✅ AuthCallback: Found anonymous onboarding record in database');
                
                // ENHANCED: Validate conversation data from database
                const validatedConversation = extractConversationData(record.onboarding_conversation);
                
                // Enhanced transfer with validation
                const updateData = {
                  profile_data: record.profile_data || {},
                  onboarding_conversation: validatedConversation || { messages: [], userAnswers: [] } as any,
                  onboarding_mode: record.onboarding_mode || 'structured',
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                };
                
                console.log('🔄 AuthCallback: Transferring database record with enhanced conversation validation...');
                
                // Safe conversation data extraction for logging
                const safeConversationData = extractConversationData(updateData.onboarding_conversation);
                console.log('📊 AuthCallback: Database record to transfer:', {
                  hasProfileData: !!updateData.profile_data && Object.keys(updateData.profile_data).length > 0,
                  hasConversationData: !!updateData.onboarding_conversation && Object.keys(updateData.onboarding_conversation).length > 0,
                  onboardingMode: updateData.onboarding_mode,
                  conversationMessageCount: safeConversationData?.messages?.length || 0,
                  conversationUserAnswerCount: safeConversationData?.userAnswers?.length || 0,
                  conversationIsValid: !!safeConversationData
                });
                
                const { error: updateError, data: updatedData } = await supabase
                  .from('user_data')
                  .update(updateData)
                  .eq('user_id', user.id)
                  .select();
                
                if (updateError) {
                  console.error('❌ AuthCallback: Error transferring database record:', updateError);
                } else {
                  console.log('✅ AuthCallback: Successfully transferred database record with conversation validation');
                  onboardingDataTransferred = true;
                  setIsNewUser(true); // Mark as new user since they completed onboarding
                  
                  // Clean up the anonymous record after successful transfer
                  await supabase
                    .from('onboarding_data')
                    .delete()
                    .eq('id', record.id);
                  
                  console.log('🧹 AuthCallback: Cleaned up anonymous onboarding record');
                  
                  toast({
                    title: "Account created successfully!",
                    description: "Welcome to Twyne! Your profile has been saved.",
                  });
                }
              }
            }
          }
          
          // Final routing decision based on transfer success and user type
          if (onboardingDataTransferred) {
            console.log('🎉 AuthCallback: Onboarding data successfully transferred with conversation validation, navigating to mirror');
            setStatusMessage(isNewUser ? 'Redirecting to your profile...' : 'Redirecting to your profile...');
            
            // Clear URL parameters before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            
            navigate('/mirror');
          } else if (userData && userData.has_completed_onboarding) {
            console.log('🎉 AuthCallback: User already has completed onboarding');
            setStatusMessage('Loading your profile...');
            
            // Clear URL parameters before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            
            navigate('/mirror');
          } else {
            console.log('🔄 AuthCallback: No onboarding data found, user needs to complete onboarding');
            setStatusMessage('Redirecting to onboarding...');
            
            // Clear URL parameters before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            
            navigate('/onboarding');
          }
          
        } catch (error) {
          console.error('❌ AuthCallback: Error in enhanced post-auth handling:', error);
          setStatusMessage('Setup failed - redirecting...');
          
          // Clean up onboarding data if we have it
          if (onboardingId) {
            await GoogleAuthService.cleanupOnboardingData(onboardingId);
          }
          
          // Show error to user and redirect to onboarding
          toast({
            title: "Setup Error",
            description: "There was an issue setting up your account. Please complete onboarding manually.",
            variant: "destructive",
          });
          
          navigate('/onboarding');
        } finally {
          setIsProcessing(false);
        }
      } else if (!isLoading && !user && !code) {
        console.log('🚪 AuthCallback: No user and no code, redirecting to home');
        setStatusMessage('Redirecting...');
        navigate('/');
      } else {
        console.log('⏳ AuthCallback: Still loading or waiting for auth completion');
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
