
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading, refreshSession } = useAuth();
  const [hasHandledCallback, setHasHandledCallback] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent duplicate processing
      if (hasHandledCallback) return;
      
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

      setHasHandledCallback(true);

      // This callback is now only for user authentication (Google SSO, etc.)
      // Platform integrations (Spotify/YouTube) have their own dedicated callback routes
      
      // Wait for auth to settle and redirect appropriately
      const timer = setTimeout(() => {
        if (!isLoading) {
          if (user) {
            navigate('/mirror');
          } else {
            navigate('/');
          }
        }
      }, 1000);

      return () => clearTimeout(timer);
    };

    handleCallback();
  }, [navigate, user, isLoading, refreshSession, hasHandledCallback]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
