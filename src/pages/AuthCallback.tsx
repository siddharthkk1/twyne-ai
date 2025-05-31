
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading, isNewUser } = useAuth();
  const [hasHandledCallback, setHasHandledCallback] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (hasHandledCallback) {
        console.log('AuthCallback: Already handled callback, skipping');
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

      console.log('AuthCallback: Processing callback - isLoading:', isLoading, 'user:', !!user, 'isNewUser:', isNewUser);
      
      // Only proceed if auth is not loading
      if (!isLoading) {
        setHasHandledCallback(true);
        
        if (user) {
          console.log('AuthCallback: User authenticated - isNewUser:', isNewUser);
          if (isNewUser) {
            console.log('AuthCallback: Redirecting new user to onboarding');
            navigate('/onboarding');
          } else {
            console.log('AuthCallback: Redirecting existing user to mirror');
            navigate('/mirror');
          }
        } else {
          console.log('AuthCallback: No user found, redirecting to home');
          navigate('/');
        }
      } else {
        console.log('AuthCallback: Still loading, waiting for auth to complete');
      }
    };

    handleCallback();
  }, [isLoading, user, isNewUser, navigate, hasHandledCallback]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Completing authentication...</p>
        {!isLoading && user && (
          <p className="text-sm text-gray-500 mt-2">
            {isNewUser ? 'Setting up your profile...' : 'Taking you to your mirror...'}
          </p>
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
