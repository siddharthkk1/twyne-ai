
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OAuthSuccessHandler } from '@/services/oauthSuccessHandler';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshSession } = useAuth();
  const [hasHandledCallback, setHasHandledCallback] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🚀 AuthCallback: Starting simplified callback handler');
      console.log('🔍 AuthCallback: Initial state:', {
        hasHandledCallback,
        isProcessing,
        isLoading,
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email
      });
      
      // Check OAuth context to understand where we came from
      const oauthContext = localStorage.getItem('oauth_context');
      console.log('🔍 AuthCallback: OAuth context:', oauthContext);
      
      // Prevent duplicate processing
      if (hasHandledCallback || isProcessing) {
        console.log('⚠️ AuthCallback: Already handled callback or processing, skipping');
        setDebugInfo('Already processed or currently processing');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const code = urlParams.get('code');

      console.log('🔍 AuthCallback: URL parameters:', { 
        hasError: !!error, 
        errorValue: error,
        hasCode: !!code, 
        codeLength: code?.length || 0,
        fullUrl: window.location.href,
        oauthContext
      });
      setDebugInfo(`URL params - error: ${!!error}, code: ${!!code}, context: ${oauthContext}`);

      // Handle OAuth errors
      if (error) {
        console.error('❌ AuthCallback: OAuth error detected:', error);
        setDebugInfo(`OAuth error: ${error}`);
        toast({
          title: "Authentication Failed",
          description: "There was an error during authentication. Please try again.",
          variant: "destructive",
        });
        
        // Clean up OAuth context
        localStorage.removeItem('oauth_context');
        
        // If we came from onboarding results, go back there
        if (oauthContext === 'onboarding_results') {
          navigate('/onboarding-results');
        } else {
          navigate('/');
        }
        return;
      }

      // If we have a code but no user yet, we might be in the middle of OAuth flow
      if (code && !user && !isLoading) {
        console.log('🔄 AuthCallback: Code present but no user, refreshing session...');
        setDebugInfo('Refreshing session for OAuth code...');
        
        setIsProcessing(true);
        
        try {
          // Try to refresh session to get the authenticated user
          await refreshSession();
          
          // Wait for session to potentially update
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if we now have a user
          if (!user) {
            console.warn('⚠️ AuthCallback: Session refresh completed but no user found');
            setDebugInfo('Session refresh completed but no user found');
            
            // Clean up OAuth context
            localStorage.removeItem('oauth_context');
            
            if (oauthContext === 'onboarding_results') {
              navigate('/onboarding-results');
            } else {
              navigate('/');
            }
            return;
          }
          
        } catch (error) {
          console.error('❌ AuthCallback: Error refreshing session:', error);
          setDebugInfo(`Session refresh error: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
        
        return; // Exit and let the next effect run handle the authenticated user
      }
      
      // Only proceed if auth is not loading and we have a user
      if (!isLoading && user) {
        console.log('🎯 AuthCallback: User authenticated, starting post-auth processing');
        console.log('🔍 AuthCallback: Authenticated user details:', {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          providers: user.app_metadata?.providers,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at,
          userMetadata: user.user_metadata,
          appMetadata: user.app_metadata,
          oauthContext
        });
        
        setHasHandledCallback(true);
        setIsProcessing(true);
        setDebugInfo('Processing authenticated user...');
        
        try {
          console.log('🔄 AuthCallback: Starting post-auth redirection handler');
          
          setDebugInfo(`Authenticated user: ${user.email}, processing redirection...`);
          
          // Add a delay to ensure all auth state is settled
          console.log('⏳ AuthCallback: Waiting for auth state to settle...');
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Use the OAuth success handler
          console.log('🔄 AuthCallback: Calling OAuthSuccessHandler.handlePostAuthRedirection');
          const redirectPath = await OAuthSuccessHandler.handlePostAuthRedirection(user.id);
          
          console.log('🎯 AuthCallback: Redirecting to:', redirectPath);
          setDebugInfo(`Redirecting to: ${redirectPath}`);
          
          // Clear URL parameters before redirecting
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Clean up OAuth context
          localStorage.removeItem('oauth_context');
          
          // Add a small delay before navigation
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log('🚀 AuthCallback: Navigating to final destination');
          
          // Special handling for onboarding results context
          if (oauthContext === 'onboarding_results' && redirectPath === '/mirror') {
            // If we came from onboarding results and successfully transferred data, go to mirror
            console.log('✅ AuthCallback: Onboarding context - redirecting to mirror with success message');
            toast({
              title: "Account created successfully!",
              description: "Welcome to Twyne! Your profile has been saved.",
            });
          }
          
          navigate(redirectPath);
          
        } catch (error) {
          console.error('❌ AuthCallback: Error in post-auth handling:', error);
          setDebugInfo(`Post-auth error: ${error.message}`);
          
          // Clean up OAuth context
          localStorage.removeItem('oauth_context');
          
          // Fallback based on context
          console.log('🔄 AuthCallback: Falling back due to error, context:', oauthContext);
          if (oauthContext === 'onboarding_results') {
            navigate('/onboarding-results');
          } else {
            navigate('/onboarding');
          }
        } finally {
          setIsProcessing(false);
        }
      } else if (!isLoading && !user && !code) {
        console.log('🚪 AuthCallback: No user and no code, redirecting based on context');
        setDebugInfo('No user and no code, redirecting based on context');
        
        // Clean up OAuth context
        localStorage.removeItem('oauth_context');
        
        if (oauthContext === 'onboarding_results') {
          navigate('/onboarding-results');
        } else {
          navigate('/');
        }
      } else {
        console.log('⏳ AuthCallback: Still loading or waiting for auth completion');
        console.log('🔍 AuthCallback: Current state:', { 
          isLoading, 
          hasUser: !!user, 
          hasCode: !!code,
          userId: user?.id,
          oauthContext
        });
        setDebugInfo(`Waiting - loading: ${isLoading}, user: ${!!user}, code: ${!!code}, context: ${oauthContext}`);
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
