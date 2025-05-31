
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
      // Prevent duplicate processing
      if (hasHandledCallback || isProcessing) {
        console.log('AuthCallback: Already handled callback or processing, skipping');
        setDebugInfo('Already processed or currently processing');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      console.log('AuthCallback: URL parameters:', { error: !!error, code: !!code, state });
      setDebugInfo(`URL params - error: ${!!error}, code: ${!!code}, state: ${state}`);

      // Handle OAuth errors
      if (error) {
        console.error('AuthCallback: OAuth error detected:', error);
        setDebugInfo(`OAuth error: ${error}`);
        toast({
          title: "Authentication Failed",
          description: "There was an error during authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      console.log('AuthCallback: Processing callback');
      console.log('AuthCallback: Has code parameter:', !!code);
      console.log('AuthCallback: Auth loading state:', isLoading);
      console.log('AuthCallback: User authenticated:', !!user);
      
      setDebugInfo(`Processing - code: ${!!code}, loading: ${isLoading}, user: ${!!user}`);
      
      // If we have a code but no user yet, we might be in the middle of OAuth flow
      if (code && !user && !isLoading) {
        console.log('AuthCallback: Code present but no user, refreshing session...');
        setDebugInfo('Refreshing session for OAuth code...');
        
        setIsProcessing(true);
        
        try {
          // Enhanced session refresh with multiple attempts
          let sessionRefreshed = false;
          const maxSessionAttempts = 5; // Increased attempts
          
          for (let attempt = 1; attempt <= maxSessionAttempts; attempt++) {
            console.log(`AuthCallback: Session refresh attempt ${attempt}/${maxSessionAttempts}`);
            setDebugInfo(`Session refresh attempt ${attempt}/${maxSessionAttempts}`);
            
            try {
              await refreshSession();
              
              // Wait longer for session to potentially update
              await new Promise(resolve => setTimeout(resolve, 2000)); // Increased wait time
              
              // Check if we now have a user
              if (user) {
                console.log('AuthCallback: Session refresh successful, user found');
                sessionRefreshed = true;
                break;
              }
            } catch (refreshError) {
              console.error(`AuthCallback: Session refresh attempt ${attempt} failed:`, refreshError);
              setDebugInfo(`Session refresh attempt ${attempt} failed: ${refreshError.message}`);
            }
            
            if (attempt < maxSessionAttempts) {
              // Exponential backoff
              const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            }
          }
          
          if (!sessionRefreshed && !user) {
            console.warn('AuthCallback: Session refresh failed after all attempts');
            setDebugInfo('Session refresh failed, redirecting to home');
            navigate('/');
            return;
          }
          
        } catch (error) {
          console.error('AuthCallback: Error refreshing session:', error);
          setDebugInfo(`Session refresh error: ${error.message}`);
        } finally {
          setIsProcessing(false);
        }
        
        return; // Exit and let the next effect run handle the authenticated user
      }
      
      // Only proceed if auth is not loading and we have a user
      if (!isLoading && user) {
        setHasHandledCallback(true);
        setIsProcessing(true);
        setDebugInfo('Processing authenticated user...');
        
        try {
          console.log('AuthCallback: User authenticated, handling post-auth redirection');
          console.log('AuthCallback: User ID:', user.id);
          console.log('AuthCallback: User email:', user.email);
          console.log('AuthCallback: User metadata:', user.user_metadata);
          
          setDebugInfo(`Authenticated user: ${user.email}, processing redirection...`);
          
          // Add a longer delay to ensure all auth state is settled and allow time for data recovery
          await new Promise(resolve => setTimeout(resolve, 1500)); // Increased delay
          
          // Use the enhanced OAuth success handler
          const redirectPath = await OAuthSuccessHandler.handlePostAuthRedirection(user.id);
          
          console.log('AuthCallback: Redirecting to:', redirectPath);
          setDebugInfo(`Redirecting to: ${redirectPath}`);
          
          // Clear URL parameters before redirecting
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Add a small delay before navigation
          await new Promise(resolve => setTimeout(resolve, 500));
          
          navigate(redirectPath);
          
        } catch (error) {
          console.error('AuthCallback: Error in post-auth handling:', error);
          setDebugInfo(`Post-auth error: ${error.message}`);
          // Fallback to onboarding on error
          navigate('/onboarding');
        } finally {
          setIsProcessing(false);
        }
      } else if (!isLoading && !user && !code) {
        console.log('AuthCallback: No user and no code, redirecting to home');
        setDebugInfo('No user and no code, redirecting home');
        navigate('/');
      } else {
        console.log('AuthCallback: Still loading or waiting for auth completion');
        console.log('AuthCallback: isLoading:', isLoading, 'user:', !!user, 'code:', !!code);
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
