
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

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (hasHandledCallback || isProcessing) {
        console.log('AuthCallback: Already handled callback or processing, skipping');
        return;
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      const code = urlParams.get('code');

      // Handle OAuth errors
      if (error) {
        console.error('AuthCallback: OAuth error detected:', error);
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
      
      // If we have a code but no user yet, we might be in the middle of OAuth flow
      // Wait a bit for the auth process to complete
      if (code && !user && !isLoading) {
        console.log('AuthCallback: Code present but no user, refreshing session...');
        
        setIsProcessing(true);
        
        try {
          // Attempt to refresh the session to pick up the new authentication
          await refreshSession();
          
          // Give a moment for the session to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error('AuthCallback: Error refreshing session:', error);
        } finally {
          setIsProcessing(false);
        }
        
        return; // Exit and let the next effect run handle the authenticated user
      }
      
      // Only proceed if auth is not loading and we have a user
      if (!isLoading && user) {
        setHasHandledCallback(true);
        setIsProcessing(true);
        
        try {
          console.log('AuthCallback: User authenticated, handling post-auth redirection');
          console.log('AuthCallback: User ID:', user.id);
          console.log('AuthCallback: User email:', user.email);
          console.log('AuthCallback: User metadata:', user.user_metadata);
          
          // Use the OAuth success handler to determine where to redirect
          const redirectPath = await OAuthSuccessHandler.handlePostAuthRedirection(user.id);
          
          console.log('AuthCallback: Redirecting to:', redirectPath);
          
          // Clear URL parameters before redirecting
          window.history.replaceState({}, document.title, window.location.pathname);
          
          navigate(redirectPath);
          
        } catch (error) {
          console.error('AuthCallback: Error in post-auth handling:', error);
          // Fallback to onboarding on error
          navigate('/onboarding');
        } finally {
          setIsProcessing(false);
        }
      } else if (!isLoading && !user && !code) {
        console.log('AuthCallback: No user and no code, redirecting to home');
        navigate('/');
      } else {
        console.log('AuthCallback: Still loading or waiting for auth completion');
        console.log('AuthCallback: isLoading:', isLoading, 'user:', !!user, 'code:', !!code);
      }
    };

    handleCallback();
  }, [isLoading, user, navigate, hasHandledCallback, isProcessing, refreshSession]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Completing authentication...</p>
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
