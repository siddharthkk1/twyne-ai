
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
      console.log('🚀 AuthCallback: Starting state parameter callback handler');
      
      // Prevent duplicate processing
      if (hasHandledCallback || isProcessing) {
        console.log('⚠️ AuthCallback: Already handled callback or processing, skipping');
        setDebugInfo('Already processed or currently processing');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      console.log('🔍 AuthCallback: URL parameters:', { 
        hasError: !!error, 
        errorValue: error,
        hasCode: !!code, 
        codeLength: code?.length || 0,
        hasState: !!state,
        stateValue: state,
        fullUrl: window.location.href
      });
      setDebugInfo(`URL params - error: ${!!error}, code: ${!!code}, state: ${!!state}`);

      // Handle OAuth errors
      if (error) {
        console.error('❌ AuthCallback: OAuth error detected:', error);
        setDebugInfo(`OAuth error: ${error}`);
        
        // Clean up any stored data if we have a state parameter
        if (state) {
          await GoogleAuthService.cleanupOnboardingData(state);
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
          await new Promise(resolve => setTimeout(resolve, 2000));
          
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
        console.log('🎯 AuthCallback: User authenticated, processing onboarding data');
        console.log('🔍 AuthCallback: Authenticated user details:', {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          hasState: !!state
        });
        
        setHasHandledCallback(true);
        setIsProcessing(true);
        setDebugInfo('Processing authenticated user with state parameter...');
        
        try {
          let onboardingDataTransferred = false;
          
          // If we have a state parameter, try to retrieve and transfer onboarding data
          if (state) {
            console.log('🔍 AuthCallback: Processing state parameter:', state);
            setDebugInfo(`Processing onboarding data for state: ${state}`);
            
            const onboardingData = await GoogleAuthService.retrieveOnboardingData(state);
            
            if (onboardingData) {
              console.log('✅ AuthCallback: Retrieved onboarding data, transferring to user profile');
              console.log('📊 AuthCallback: Onboarding data details:', {
                hasProfile: !!onboardingData.profile && Object.keys(onboardingData.profile).length > 0,
                hasConversation: !!onboardingData.conversation && Object.keys(onboardingData.conversation).length > 0,
                promptMode: onboardingData.promptMode
              });
              
              // Transfer the onboarding data to the authenticated user's profile
              const { error: upsertError } = await supabase
                .from('user_data')
                .upsert({
                  user_id: user.id,
                  profile_data: onboardingData.profile || {},
                  conversation_data: onboardingData.conversation || {},
                  prompt_mode: onboardingData.promptMode || 'structured',
                  has_completed_onboarding: true,
                  updated_at: new Date().toISOString()
                }, { 
                  onConflict: 'user_id',
                  ignoreDuplicates: false 
                });
              
              if (upsertError) {
                console.error('❌ AuthCallback: Error transferring onboarding data:', upsertError);
                setDebugInfo(`Error transferring data: ${upsertError.message}`);
              } else {
                console.log('✅ AuthCallback: Successfully transferred onboarding data to user profile');
                onboardingDataTransferred = true;
                setDebugInfo('Onboarding data transferred successfully');
                
                toast({
                  title: "Account created successfully!",
                  description: "Welcome to Twyne! Your profile has been saved.",
                });
              }
              
              // Clean up the temporary onboarding data record
              await GoogleAuthService.cleanupOnboardingData(state);
            } else {
              console.log('⚠️ AuthCallback: No onboarding data found for state parameter');
              setDebugInfo('No onboarding data found for state parameter');
            }
          } else {
            console.log('⚠️ AuthCallback: No state parameter found in callback');
            setDebugInfo('No state parameter found');
          }
          
          // Add a delay to ensure all database operations are complete
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Clear URL parameters before redirecting
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Determine where to redirect based on whether we transferred data
          if (onboardingDataTransferred) {
            console.log('🚀 AuthCallback: Redirecting to mirror with transferred data');
            navigate('/mirror');
          } else {
            // Check if user already has completed onboarding
            console.log('🔍 AuthCallback: Checking existing user data...');
            const { data: userData } = await supabase
              .from('user_data')
              .select('has_completed_onboarding, profile_data')
              .eq('user_id', user.id)
              .maybeSingle();
            
            const hasValidProfile = userData?.has_completed_onboarding && 
                                    userData?.profile_data && 
                                    Object.keys(userData.profile_data as any || {}).length > 0;
            
            if (hasValidProfile) {
              console.log('🚀 AuthCallback: User has existing valid profile, redirecting to mirror');
              navigate('/mirror');
            } else {
              console.log('🚀 AuthCallback: User needs to complete onboarding');
              navigate('/onboarding');
            }
          }
          
        } catch (error) {
          console.error('❌ AuthCallback: Error in post-auth handling:', error);
          setDebugInfo(`Post-auth error: ${error.message}`);
          
          // Clean up state data if we have it
          if (state) {
            await GoogleAuthService.cleanupOnboardingData(state);
          }
          
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
