
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
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

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
        setDebugInfo('Already processed or currently processing');
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
      setDebugInfo(`URL params - error: ${!!error}, code: ${!!code}, onboarding_id: ${!!onboardingId}`);

      // Handle OAuth errors
      if (error) {
        console.error('❌ AuthCallback: OAuth error detected:', error);
        setDebugInfo(`OAuth error: ${error}`);
        
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
        setDebugInfo('Refreshing session for OAuth code...');
        
        setIsProcessing(true);
        
        try {
          await refreshSession();
          // Give more time for the session to be established
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          if (!user) {
            console.warn('⚠️ AuthCallback: Session refresh completed but no user found');
            setDebugInfo('Session refresh completed but no user found');
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('❌ AuthCallback: Error refreshing session:', error);
          setDebugInfo(`Session refresh error: ${error.message}`);
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
        setDebugInfo('Processing authenticated user with enhanced conversation data transfer...');
        
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
              setDebugInfo(`Error fetching user data: ${fetchError.message}`);
              throw fetchError;
            }
            
            userData = data;
            
            if (!userData) {
              retryCount++;
              console.log(`⏳ AuthCallback: User data not found, retry ${retryCount}/${maxRetries}`);
              setDebugInfo(`Waiting for user data creation... retry ${retryCount}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          }
          
          // If no user_data record exists after retries, create one (fallback)
          if (!userData) {
            console.log('⚠️ AuthCallback: No user_data record found after retries, creating fallback record');
            setDebugInfo('Creating user data record as fallback...');
            
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
                conversation_data: {},
                prompt_mode: 'structured',
                has_completed_onboarding: false
              })
              .select()
              .single();
            
            if (insertError) {
              console.error('❌ AuthCallback: Error creating user_data record:', insertError);
              setDebugInfo(`Error creating user data: ${insertError.message}`);
              throw insertError;
            } else {
              userData = newUserData;
              console.log('✅ AuthCallback: Created fallback user_data record');
            }
          } else {
            console.log('✅ AuthCallback: Found existing user_data record');
          }
          
          // ENHANCED: onboarding data retrieval and transfer with improved conversation validation
          let onboardingDataTransferred = false;
          
          // Strategy 1: Check URL parameter for onboarding ID
          if (onboardingId && userData) {
            console.log('🔍 AuthCallback: Processing onboarding ID from URL with enhanced conversation validation:', onboardingId);
            setDebugInfo(`Processing onboarding data for ID: ${onboardingId}`);
            
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
                conversation_data: validatedConversation || getConversationFromLocalStorage() || { messages: [], userAnswers: [] } as any,
                prompt_mode: onboardingData.promptMode || 'structured',
                has_completed_onboarding: true,
                updated_at: new Date().toISOString()
              };
              
              console.log('🔄 AuthCallback: Transferring onboarding data with enhanced conversation validation...');
              
              // Safe conversation data extraction for logging
              const conversationData = extractConversationData(updateData.conversation_data);
              console.log('📊 AuthCallback: Update data to transfer:', {
                hasProfileData: !!updateData.profile_data && Object.keys(updateData.profile_data).length > 0,
                hasConversationData: !!updateData.conversation_data && Object.keys(updateData.conversation_data).length > 0,
                promptMode: updateData.prompt_mode,
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
                setDebugInfo(`Error transferring onboarding data: ${updateError.message}`);
              } else {
                console.log('✅ AuthCallback: Successfully transferred onboarding data with conversation validation');
                setDebugInfo('Onboarding data transferred successfully with conversation validation');
                onboardingDataTransferred = true;
                
                toast({
                  title: "Account created successfully!",
                  description: "Welcome to Twyne! Your profile has been saved.",
                });
              }
              
              // Clean up the temporary onboarding data
              await GoogleAuthService.cleanupOnboardingData(onboardingId);
            } else {
              console.log('⚠️ AuthCallback: No onboarding data found for URL ID, checking localStorage');
              setDebugInfo('No onboarding data found for URL ID, checking localStorage');
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
                  conversation_data: conversationData as any,
                  prompt_mode: promptMode,
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                };
                
                console.log('🔄 AuthCallback: Transferring localStorage data with enhanced conversation validation...');
                
                console.log('📊 AuthCallback: localStorage data to transfer:', {
                  hasProfileData: !!updateData.profile_data && Object.keys(updateData.profile_data).length > 0,
                  hasConversationData: !!updateData.conversation_data && Object.keys(updateData.conversation_data).length > 0,
                  promptMode: updateData.prompt_mode,
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
                  setDebugInfo(`Error transferring localStorage data: ${updateError.message}`);
                } else {
                  console.log('✅ AuthCallback: Successfully transferred localStorage data with conversation validation');
                  setDebugInfo('localStorage onboarding data transferred successfully with conversation validation');
                  onboardingDataTransferred = true;
                  
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
                setDebugInfo(`Error parsing localStorage data: ${parseError.message}`);
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
                .or(`id.eq.${tempOnboardingId},user_id.eq.${tempOnboardingId}`)
                .eq('is_anonymous', true)
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (fetchError) {
                console.error('❌ AuthCallback: Error fetching onboarding records:', fetchError);
              } else if (onboardingRecords && onboardingRecords.length > 0) {
                const record = onboardingRecords[0];
                console.log('✅ AuthCallback: Found anonymous onboarding record in database');
                
                // ENHANCED: Validate conversation data from database
                const validatedConversation = extractConversationData(record.conversation_data);
                
                // Enhanced transfer with validation
                const updateData = {
                  profile_data: record.profile_data || {},
                  conversation_data: validatedConversation || { messages: [], userAnswers: [] } as any,
                  prompt_mode: record.prompt_mode || 'structured',
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                };
                
                console.log('🔄 AuthCallback: Transferring database record with enhanced conversation validation...');
                
                // Safe conversation data extraction for logging
                const safeConversationData = extractConversationData(updateData.conversation_data);
                console.log('📊 AuthCallback: Database record to transfer:', {
                  hasProfileData: !!updateData.profile_data && Object.keys(updateData.profile_data).length > 0,
                  hasConversationData: !!updateData.conversation_data && Object.keys(updateData.conversation_data).length > 0,
                  promptMode: updateData.prompt_mode,
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
                  setDebugInfo(`Error transferring database record: ${updateError.message}`);
                } else {
                  console.log('✅ AuthCallback: Successfully transferred database record with conversation validation');
                  setDebugInfo('Database onboarding record transferred successfully with conversation validation');
                  onboardingDataTransferred = true;
                  
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
          
          // Final routing decision based on transfer success
          if (onboardingDataTransferred) {
            console.log('🎉 AuthCallback: Onboarding data successfully transferred with conversation validation, navigating to mirror');
            setDebugInfo('Onboarding data transferred with conversation validation, redirecting to mirror');
            
            // Clear URL parameters before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            
            navigate('/mirror');
          } else if (userData && userData.has_completed_onboarding) {
            console.log('🎉 AuthCallback: User already has completed onboarding');
            setDebugInfo('User already completed onboarding');
            
            // Clear URL parameters before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            
            navigate('/mirror');
          } else {
            console.log('🔄 AuthCallback: No onboarding data found, user needs to complete onboarding');
            setDebugInfo('No onboarding data found, redirecting to onboarding');
            
            // Clear URL parameters before redirecting
            window.history.replaceState({}, document.title, window.location.pathname);
            
            navigate('/onboarding');
          }
          
        } catch (error) {
          console.error('❌ AuthCallback: Error in enhanced post-auth handling:', error);
          setDebugInfo(`Enhanced post-auth error: ${error.message}`);
          
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
        setDebugInfo('No user and no code, redirecting to home');
        navigate('/');
      } else {
        console.log('⏳ AuthCallback: Still loading or waiting for auth completion');
        setDebugInfo(`Waiting - loading: ${isLoading}, user: ${!!user}, code: ${!!code}`);
      }
    };

    handleCallback();
  }, [isLoading, user, navigate, hasHandledCallback, isProcessing, refreshSession]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg mb-2">Completing authentication...</p>
        
        {/* Debug information */}
        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-medium mb-1">Status:</p>
          <p>{debugInfo}</p>
        </div>
        
        {isProcessing && (
          <p className="text-sm text-gray-500 mt-2">Processing your profile...</p>
        )}
        {!isLoading && user && (
          <p className="text-sm text-gray-500 mt-2">Setting up your account...</p>
        )}
        {!isLoading && !user && (
          <p className="text-sm text-gray-500 mt-2">Verifying credentials...</p>
        )}
        {isLoading && (
          <p className="text-sm text-gray-500 mt-2">Loading your account...</p>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
