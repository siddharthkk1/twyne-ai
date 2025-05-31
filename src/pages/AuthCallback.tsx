
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
      console.log('🚀 AuthCallback: Starting OAuth callback handler with new trigger system');
      
      // Prevent duplicate processing
      if (hasHandledCallback || isProcessing) {
        console.log('⚠️ AuthCallback: Already handled callback or processing, skipping');
        setDebugInfo('Already processed or currently processing');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const code = urlParams.get('code');
      const onboardingId = urlParams.get('onboarding_id'); // Legacy support

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
        
        // Clean up any stored data if we have an onboarding ID (legacy)
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
        console.log('🎯 AuthCallback: User authenticated, checking trigger system results');
        console.log('🔍 AuthCallback: Authenticated user details:', {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          hasOnboardingData: !!user.user_metadata?.onboarding_profile
        });
        
        setHasHandledCallback(true);
        setIsProcessing(true);
        setDebugInfo('Processing authenticated user with new trigger system...');
        
        try {
          // Add a delay to ensure the trigger has completed
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if user data was created by the trigger and contains onboarding data
          console.log('🔍 AuthCallback: Checking user_data created by trigger...');
          const { data: userData } = await supabase
            .from('user_data')
            .select('has_completed_onboarding, profile_data, sso_data')
            .eq('user_id', user.id)
            .single();
          
          if (userData) {
            console.log('✅ AuthCallback: Found user_data record created by trigger');
            console.log('📊 AuthCallback: User data details:', {
              hasCompletedOnboarding: userData.has_completed_onboarding,
              hasProfileData: !!userData.profile_data && Object.keys(userData.profile_data as any || {}).length > 0,
              hasSsoData: !!userData.sso_data && Object.keys(userData.sso_data as any || {}).length > 0
            });
            
            if (userData.has_completed_onboarding) {
              console.log('🎉 AuthCallback: User has onboarding data from OAuth, showing success');
              setDebugInfo('Onboarding data transferred successfully via OAuth metadata');
              
              toast({
                title: "Account created successfully!",
                description: "Welcome to Twyne! Your profile has been saved.",
              });
              
              // Clear URL parameters before redirecting
              window.history.replaceState({}, document.title, window.location.pathname);
              
              console.log('🚀 AuthCallback: Redirecting to mirror with onboarding data');
              navigate('/mirror');
            } else {
              console.log('🔄 AuthCallback: User needs to complete onboarding');
              
              // Check for legacy onboarding ID support
              if (onboardingId) {
                console.log('🔍 AuthCallback: Processing legacy onboarding ID:', onboardingId);
                setDebugInfo(`Processing legacy onboarding data for ID: ${onboardingId}`);
                
                const onboardingData = await GoogleAuthService.retrieveOnboardingData(onboardingId);
                
                if (onboardingData) {
                  console.log('✅ AuthCallback: Retrieved legacy onboarding data, transferring to user profile');
                  
                  // Transfer the legacy onboarding data to the user's profile
                  const { error: upsertError } = await supabase
                    .from('user_data')
                    .update({
                      profile_data: onboardingData.profile || {},
                      conversation_data: onboardingData.conversation || {},
                      prompt_mode: onboardingData.promptMode || 'structured',
                      has_completed_onboarding: true,
                      updated_at: new Date().toISOString()
                    })
                    .eq('user_id', user.id);
                  
                  if (upsertError) {
                    console.error('❌ AuthCallback: Error transferring legacy onboarding data:', upsertError);
                    setDebugInfo(`Error transferring legacy data: ${upsertError.message}`);
                  } else {
                    console.log('✅ AuthCallback: Successfully transferred legacy onboarding data');
                    setDebugInfo('Legacy onboarding data transferred successfully');
                    
                    toast({
                      title: "Account created successfully!",
                      description: "Welcome to Twyne! Your profile has been saved.",
                    });
                  }
                  
                  // Clean up the temporary onboarding data record
                  await GoogleAuthService.cleanupOnboardingData(onboardingId);
                  
                  // Clear URL parameters before redirecting
                  window.history.replaceState({}, document.title, window.location.pathname);
                  
                  navigate('/mirror');
                  return;
                }
              }
              
              // Clear URL parameters before redirecting
              window.history.replaceState({}, document.title, window.location.pathname);
              
              console.log('🚀 AuthCallback: Redirecting to onboarding');
              navigate('/onboarding');
            }
          } else {
            console.error('❌ AuthCallback: No user_data record found - trigger may have failed');
            setDebugInfo('No user_data record found - trigger may have failed');
            navigate('/onboarding');
          }
          
        } catch (error) {
          console.error('❌ AuthCallback: Error in post-auth handling:', error);
          setDebugInfo(`Post-auth error: ${error.message}`);
          
          // Clean up onboarding data if we have it (legacy)
          if (onboardingId) {
            await GoogleAuthService.cleanupOnboardingData(onboardingId);
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
