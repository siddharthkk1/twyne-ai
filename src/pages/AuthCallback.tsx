
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthService } from '@/services/googleAuthService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshSession } = useAuth();
  const [hasHandledCallback, setHasHandledCallback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🚀 AuthCallback: Starting OAuth callback handler with redirect URL method');
      
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
        console.log('🎯 AuthCallback: User authenticated, processing redirect URL method');
        console.log('🔍 AuthCallback: Authenticated user details:', {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          createdAt: user.created_at
        });
        
        setHasHandledCallback(true);
        setIsProcessing(true);
        setDebugInfo('Processing authenticated user with redirect URL method...');
        
        try {
          // Add a small delay to ensure trigger has time to execute
          console.log('⏳ AuthCallback: Waiting for user_data trigger to complete...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if the user_data record exists with retry logic
          console.log('🔍 AuthCallback: Checking user_data record...');
          let userData = null;
          let retryCount = 0;
          const maxRetries = 3;
          
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
              await new Promise(resolve => setTimeout(resolve, 1000));
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
          
          // Check if we have onboarding data to transfer
          if (onboardingId && userData) {
            console.log('🔍 AuthCallback: Processing onboarding ID from URL:', onboardingId);
            setDebugInfo(`Processing onboarding data for ID: ${onboardingId}`);
            
            const onboardingData = await GoogleAuthService.retrieveOnboardingData(onboardingId);
            
            if (onboardingData) {
              console.log('✅ AuthCallback: Retrieved onboarding data, transferring to user profile');
              
              // Transfer the onboarding data to the user's profile
              const { error: updateError } = await supabase
                .from('user_data')
                .update({
                  profile_data: onboardingData.profile || {},
                  conversation_data: onboardingData.conversation || {},
                  prompt_mode: onboardingData.promptMode || 'structured',
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);
              
              if (updateError) {
                console.error('❌ AuthCallback: Error transferring onboarding data:', updateError);
                setDebugInfo(`Error transferring onboarding data: ${updateError.message}`);
              } else {
                console.log('✅ AuthCallback: Successfully transferred onboarding data');
                setDebugInfo('Onboarding data transferred successfully');
                
                toast({
                  title: "Account created successfully!",
                  description: "Welcome to Twyne! Your profile has been saved.",
                });
              }
              
              // Clean up the temporary onboarding data
              await GoogleAuthService.cleanupOnboardingData(onboardingId);
              
              // Clear URL parameters before redirecting
              window.history.replaceState({}, document.title, window.location.pathname);
              
              navigate('/mirror');
              return;
            } else {
              console.log('⚠️ AuthCallback: No onboarding data found for ID, checking user state');
              setDebugInfo('No onboarding data found, checking user state');
            }
          }
          
          // If no onboarding data or couldn't retrieve it, check user's current state
          if (userData) {
            console.log('🔍 AuthCallback: Checking user onboarding status...');
            
            if (userData.has_completed_onboarding) {
              console.log('🎉 AuthCallback: User already has completed onboarding');
              setDebugInfo('User already completed onboarding');
              
              // Clear URL parameters before redirecting
              window.history.replaceState({}, document.title, window.location.pathname);
              
              navigate('/mirror');
            } else {
              console.log('🔄 AuthCallback: User needs to complete onboarding');
              setDebugInfo('User needs to complete onboarding');
              
              // Clear URL parameters before redirecting
              window.history.replaceState({}, document.title, window.location.pathname);
              
              navigate('/onboarding');
            }
          } else {
            console.log('⚠️ AuthCallback: No user data available, redirecting to onboarding');
            setDebugInfo('No user data available');
            navigate('/onboarding');
          }
          
        } catch (error) {
          console.error('❌ AuthCallback: Error in post-auth handling:', error);
          setDebugInfo(`Post-auth error: ${error.message}`);
          
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
