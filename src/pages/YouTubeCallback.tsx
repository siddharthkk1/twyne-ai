
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthService } from '@/services/googleAuthService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { AIProfileService } from '@/services/aiProfileService';
import { toast } from '@/components/ui/use-toast';

const YouTubeCallback = () => {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleYouTubeCallback = async () => {
      // Prevent duplicate processing
      if (hasProcessedRef.current) {
        console.log('YouTubeCallback: Already processed, skipping');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Handle OAuth errors
      if (error) {
        console.error('YouTube OAuth error:', error);
        toast({
          title: "YouTube Connection Failed",
          description: "There was an error connecting to YouTube. Please try again.",
          variant: "destructive",
        });
        // Clear URL and redirect
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        return;
      }

      // Verify this is a YouTube callback
      if (!code || state !== 'youtube_auth') {
        console.error('Invalid YouTube callback parameters');
        navigate('/mirror');
        return;
      }

      // Mark as processing to prevent duplicate runs
      hasProcessedRef.current = true;
      setIsProcessing(true);
      
      try {
        console.log('YouTubeCallback: Starting processing with code:', code.substring(0, 10) + '...');
        
        // Ensure we have a valid user session
        if (!user) {
          console.log('YouTubeCallback: No user session, refreshing...');
          await refreshSession();
          
          // Wait a bit for auth state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Exchange code for token
        console.log('YouTubeCallback: Exchanging code for token...');
        const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
        console.log('YouTubeCallback: Token exchange successful');
        
        // Store token locally for immediate use
        localStorage.setItem('google_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('google_refresh_token', tokenData.refresh_token);
        }
        
        // For YouTube, we'll implement the actual data fetching later
        // For now, just store the connection
        const youtubeConnectionData = {
          tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null
          }
        };

        // Store connection metadata in database (platform_connections)
        console.log('YouTubeCallback: Storing connection data...');
        await MirrorDataService.storeConnectionData('youtube', youtubeConnectionData);
        
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account.",
        });
        
        console.log('YouTubeCallback: Success! Redirecting to mirror...');
        
        // Clear URL parameters and redirect to mirror
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        
      } catch (error) {
        console.error('Error in YouTube callback:', error);
        hasProcessedRef.current = false; // Reset on error to allow retry
        toast({
          title: "YouTube Connection Failed",
          description: "Failed to connect your YouTube account. Please try again.",
          variant: "destructive",
        });
        // Clear URL and redirect
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
      } finally {
        setIsProcessing(false);
      }
    };

    handleYouTubeCallback();
  }, []); // Remove all dependencies to prevent re-runs

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-lg">
          {isProcessing ? 'Connecting YouTube...' : 'Processing YouTube connection...'}
        </p>
      </div>
    </div>
  );
};

export default YouTubeCallback;
