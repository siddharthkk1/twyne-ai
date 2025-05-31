
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleAuthService } from '@/services/googleAuthService';
import { YouTubeService } from '@/services/youtubeService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { AIProfileService } from '@/services/aiProfileService';
import { toast } from '@/components/ui/use-toast';

const YouTubeCallback = () => {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleYouTubeCallback = async () => {
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
        navigate('/mirror');
        return;
      }

      // Verify this is a YouTube callback
      if (!code || state !== 'youtube_auth') {
        console.error('Invalid YouTube callback parameters');
        navigate('/mirror');
        return;
      }

      setIsProcessing(true);
      
      try {
        // Ensure we have a valid user session
        if (!user) {
          console.log('YouTubeCallback: No user session, refreshing...');
          await refreshSession();
          
          // Wait a bit for auth state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Exchange code for token
        const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
        
        // Store token locally for immediate use
        localStorage.setItem('google_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('google_refresh_token', tokenData.refresh_token);
        }
        
        // Fetch comprehensive YouTube data
        const channel = await YouTubeService.getChannelInfo(tokenData.access_token);
        
        const [
          videos,
          playlists,
          subscriptions,
          likedVideos,
          watchLater
        ] = await Promise.all([
          YouTubeService.getUserVideos(tokenData.access_token),
          YouTubeService.getUserPlaylists(tokenData.access_token),
          YouTubeService.getUserSubscriptions(tokenData.access_token),
          YouTubeService.getLikedVideos(tokenData.access_token),
          YouTubeService.getWatchLaterPlaylist(tokenData.access_token)
        ]);

        // Transform YouTube data for AI analysis - use safe property access
        const youtubeAnalysisData = {
          likedVideos: likedVideos.map(video => ({
            title: video.snippet.title,
            description: video.snippet.description,
            channelTitle: video.snippet.channelTitle,
            tags: (video.snippet as any).tags || [],
            categoryId: (video.snippet as any).categoryId || null
          })),
          subscriptions: subscriptions.map(sub => ({
            title: sub.snippet.title,
            description: sub.snippet.description,
            topicCategories: [],
            keywords: []
          })),
          watchHistory: videos.slice(0, 15).map(video => ({
            title: video.snippet.title,
            description: video.snippet.description,
            tags: (video.snippet as any).tags || [],
            categoryId: (video.snippet as any).categoryId || null
          }))
        };

        // Generate AI insights for YouTube
        console.log('Generating YouTube AI insights...');
        const youtubeInsights = await AIProfileService.generateYouTubeProfile(youtubeAnalysisData);

        // Store connection metadata only (channel + tokens) in platform_connections
        const youtubeConnectionData = {
          channel,
          tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null
          }
        };

        // Store data locally for immediate access
        localStorage.setItem('youtube_channel', JSON.stringify(channel));
        
        // Store connection metadata in database (platform_connections)
        await MirrorDataService.storeConnectionData('youtube', youtubeConnectionData);
        
        // Store AI insights in profile_data - youtubeInsights is already a string
        await MirrorDataService.storeMirrorData({
          youtube: { summary: youtubeInsights }
        });
        
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account and generated AI insights.",
        });
        
        // Clear URL parameters and redirect to mirror
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        
      } catch (error) {
        console.error('Error in YouTube callback:', error);
        toast({
          title: "YouTube Connection Failed",
          description: "Failed to connect your YouTube account. Please try again.",
          variant: "destructive",
        });
        navigate('/mirror');
      } finally {
        setIsProcessing(false);
      }
    };

    handleYouTubeCallback();
  }, [navigate, user, refreshSession]);

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
