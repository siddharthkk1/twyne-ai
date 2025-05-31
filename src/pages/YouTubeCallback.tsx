
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthService } from '@/services/googleAuthService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { AIProfileService } from '@/services/aiProfileService';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
        console.error('YouTubeCallback: OAuth error detected:', error);
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
        console.error('YouTubeCallback: Invalid callback parameters', { code: !!code, state });
        navigate('/mirror');
        return;
      }

      // Mark as processing to prevent duplicate runs
      hasProcessedRef.current = true;
      setIsProcessing(true);
      
      try {
        console.log('YouTubeCallback: Starting processing');
        console.log('YouTubeCallback: Code length:', code.length);
        console.log('YouTubeCallback: Current user:', !!user);
        
        // Ensure we have a valid user session with retry logic
        let currentUser = user;
        let sessionAttempts = 0;
        const maxSessionAttempts = 3;
        
        while (!currentUser && sessionAttempts < maxSessionAttempts) {
          sessionAttempts++;
          console.log(`YouTubeCallback: No user session, refreshing... (attempt ${sessionAttempts}/${maxSessionAttempts})`);
          
          try {
            await refreshSession();
            
            // Wait for session to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if we now have a user
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            currentUser = refreshedUser;
            
            if (currentUser) {
              console.log('YouTubeCallback: Session refresh successful');
              break;
            }
          } catch (refreshError) {
            console.error(`YouTubeCallback: Session refresh attempt ${sessionAttempts} failed:`, refreshError);
          }
        }
        
        if (!currentUser) {
          console.error('YouTubeCallback: No authenticated user after retries');
          toast({
            title: "Authentication Required",
            description: "Please sign in to connect your YouTube account.",
            variant: "destructive",
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/auth');
          return;
        }
        
        console.log('YouTubeCallback: Authenticated user confirmed:', currentUser.id);
        
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

        console.log('YouTubeCallback: Storing connection data...');
        
        // Use retry logic for database operations
        let connectionStored = false;
        let connectionAttempts = 0;
        const maxConnectionAttempts = 3;
        
        while (!connectionStored && connectionAttempts < maxConnectionAttempts) {
          connectionAttempts++;
          console.log(`YouTubeCallback: Storing connection data (attempt ${connectionAttempts}/${maxConnectionAttempts})`);
          
          try {
            const connectionResult = await MirrorDataService.storeConnectionData('youtube', youtubeConnectionData);
            if (connectionResult.success) {
              connectionStored = true;
              console.log('YouTubeCallback: Connection data stored successfully');
            } else {
              console.warn('YouTubeCallback: Connection storage returned false:', connectionResult.error);
            }
          } catch (connectionError) {
            console.error(`YouTubeCallback: Connection storage attempt ${connectionAttempts} failed:`, connectionError);
            if (connectionAttempts === maxConnectionAttempts) {
              // Continue anyway as we have the data locally
              console.warn('YouTubeCallback: Continuing despite connection storage failure');
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account.",
        });
        
        console.log('YouTubeCallback: Success! Redirecting to mirror...');
        
        // Clear URL parameters and redirect to mirror
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        
      } catch (error) {
        console.error('YouTubeCallback: Error in processing:', error);
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
