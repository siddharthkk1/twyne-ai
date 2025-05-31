
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OAuthSuccessHandler } from '@/services/oauthSuccessHandler';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
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

      // Handle OAuth errors
      if (error) {
        console.error('OAuth error:', error);
        toast({
          title: "Authentication Failed",
          description: "There was an error during authentication. Please try again.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }

      console.log('AuthCallback: Processing callback - isLoading:', isLoading, 'user:', !!user);
      
      // Only proceed if auth is not loading and we have a user
      if (!isLoading && user) {
        setHasHandledCallback(true);
        setIsProcessing(true);
        
        try {
          console.log('AuthCallback: User authenticated, handling post-auth redirection');
          
          // Use the OAuth success handler to determine where to redirect
          const redirectPath = await OAuthSuccessHandler.handlePostAuthRedirection(user.id);
          
          console.log('AuthCallback: Redirecting to:', redirectPath);
          navigate(redirectPath);
          
        } catch (error) {
          console.error('AuthCallback: Error in post-auth handling:', error);
          // Fallback to onboarding on error
          navigate('/onboarding');
        } finally {
          setIsProcessing(false);
        }
      } else if (!isLoading && !user) {
        console.log('AuthCallback: No user found after auth completion, redirecting to home');
        navigate('/');
      } else {
        console.log('AuthCallback: Still loading, waiting for auth to complete');
      }
    };

    handleCallback();
  }, [isLoading, user, navigate, hasHandledCallback, isProcessing]);

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
