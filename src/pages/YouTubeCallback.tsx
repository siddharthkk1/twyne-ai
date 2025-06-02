
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { YouTubeService } from '@/services/youtubeService';
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
        
        // Ensure we have a valid session
        let currentUser = user;
        if (!currentUser) {
          console.log('YouTubeCallback: No user found, attempting session refresh...');
          await refreshSession();
          
          // Wait a moment for session to update
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !currentSession?.user) {
            console.error('YouTubeCallback: Session validation failed:', sessionError);
            toast({
              title: "Authentication Required",
              description: "Please sign in to connect your YouTube account.",
              variant: "destructive",
            });
            window.history.replaceState({}, document.title, window.location.pathname);
            navigate('/auth');
            return;
          }
          
          currentUser = currentSession.user;
        }

        console.log('YouTubeCallback: Authenticated user confirmed:', currentUser.id);
        
        // Exchange code for token
        console.log('YouTubeCallback: Exchanging code for token...');
        const tokenData = await YouTubeService.exchangeCodeForToken(code);
        console.log('YouTubeCallback: Token exchange successful');
        
        // Store token locally for immediate use
        localStorage.setItem('google_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('google_refresh_token', tokenData.refresh_token);
        }
        
        // Fetch YouTube channel data
        console.log('YouTubeCallback: Fetching YouTube channel data...');
        const channelData = await YouTubeService.getChannelInfo(tokenData.access_token);
        console.log('YouTubeCallback: Channel data fetched successfully:', channelData.snippet.title);
        
        // Fetch comprehensive YouTube data for AI analysis
        console.log('YouTubeCallback: Fetching comprehensive YouTube data...');
        const [
          likedVideos,
          subscriptions,
          watchLaterVideos
        ] = await Promise.all([
          YouTubeService.getEnhancedLikedVideos(tokenData.access_token),
          YouTubeService.getEnhancedSubscriptions(tokenData.access_token),
          YouTubeService.getWatchLaterPlaylist(tokenData.access_token)
        ]);

        console.log('YouTubeCallback: All YouTube data fetched successfully', {
          likedVideosCount: likedVideos.length,
          subscriptionsCount: subscriptions.length,
          watchLaterCount: watchLaterVideos.length
        });

        // Generate AI insights using the comprehensive data
        console.log('YouTubeCallback: Generating AI insights...');
        const youtubeProfileSummary = await AIProfileService.generateYouTubeProfile({
          likedVideos,
          subscriptions,
          watchHistory: watchLaterVideos.map(video => ({
            title: video.snippet.title,
            description: video.snippet.description,
            tags: video.snippet.tags || [],
            categoryId: video.snippet.categoryId || null
          }))
        });

        // Prepare connection data with both tokens and channel data
        const youtubeConnectionData = {
          channel: channelData,
          tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null
          }
        };

        console.log('YouTubeCallback: Storing connection data...');
        
        // Store connection data with improved error handling
        const storeConnectionData = async () => {
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            attempts++;
            console.log(`YouTubeCallback: Storing connection data (attempt ${attempts}/${maxAttempts})`);
            
            try {
              const connectionResult = await MirrorDataService.storeConnectionData('youtube', youtubeConnectionData);
              if (connectionResult.success) {
                console.log('YouTubeCallback: Connection data stored successfully');
                return true;
              } else {
                console.warn('YouTubeCallback: Connection storage returned false:', connectionResult.error);
                if (attempts === maxAttempts) {
                  throw new Error(`Connection storage failed: ${connectionResult.error}`);
                }
              }
            } catch (connectionError) {
              console.error(`YouTubeCallback: Connection storage attempt ${attempts} failed:`, connectionError);
              if (attempts === maxAttempts) {
                throw connectionError;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          return false;
        };
        
        await storeConnectionData();
        
        // Store AI insights in profile_data with improved error handling
        console.log('YouTubeCallback: Storing AI insights...');
        
        const storeMirrorData = async () => {
          let attempts = 0;
          const maxAttempts = 3;
          
          while (attempts < maxAttempts) {
            attempts++;
            console.log(`YouTubeCallback: Storing mirror data (attempt ${attempts}/${maxAttempts})`);
            
            try {
              const mirrorResult = await MirrorDataService.storeMirrorData({
                youtube: { summary: youtubeProfileSummary }
              });
              if (mirrorResult.success) {
                console.log('YouTubeCallback: Mirror data stored successfully');
                return true;
              } else {
                console.warn('YouTubeCallback: Mirror storage returned false:', mirrorResult.error);
                if (attempts === maxAttempts) {
                  throw new Error(`Mirror storage failed: ${mirrorResult.error}`);
                }
              }
            } catch (mirrorError) {
              console.error(`YouTubeCallback: Mirror storage attempt ${attempts} failed:`, mirrorError);
              if (attempts === maxAttempts) {
                throw mirrorError;
              }
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
          return false;
        };
        
        await storeMirrorData();
        
        // Show success notification
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account and generated AI insights.",
        });
        
        console.log('YouTubeCallback: Success! Redirecting to mirror...');
        
        // Clear URL parameters and redirect to mirror
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        
      } catch (error) {
        console.error('YouTubeCallback: Error in processing:', error);
        hasProcessedRef.current = false; // Reset on error to allow retry
        
        // Provide more specific error messages
        let errorMessage = "Failed to connect your YouTube account. Please try again.";
        if (error instanceof Error) {
          if (error.message.includes('token')) {
            errorMessage = "Failed to authenticate with YouTube. Please try reconnecting.";
          } else if (error.message.includes('storage') || error.message.includes('Connection storage')) {
            errorMessage = "Connected to YouTube but failed to save data. Please check your connection and try again.";
          } else if (error.message.includes('Mirror storage')) {
            errorMessage = "Connected to YouTube but failed to generate insights. Please try again.";
          }
        }
        
        toast({
          title: "YouTube Connection Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
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
          {isProcessing ? 'Connecting YouTube and generating insights...' : 'Processing YouTube connection...'}
        </p>
      </div>
    </div>
  );
};

export default YouTubeCallback;
