
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SpotifyService } from '@/services/spotifyService';
import { GoogleAuthService } from '@/services/googleAuthService';
import { YouTubeService } from '@/services/youtubeService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
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

      // If we have a code and state, this is an OAuth callback
      if (code && state) {
        setIsProcessing(true);
        
        try {
          if (state === 'spotify_auth') {
            console.log('Processing Spotify OAuth callback...');
            await handleSpotifyCallback(code);
          } else if (state === 'youtube_auth') {
            console.log('Processing YouTube OAuth callback...');
            await handleYouTubeCallback(code);
          } else {
            console.log('Unknown OAuth state:', state);
            navigate('/');
            return;
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to connect your account. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      } else {
        // Regular auth callback - let auth settle and redirect
        const timer = setTimeout(() => {
          console.log('Regular auth callback complete, redirecting to home');
          navigate('/');
        }, 1000);

        return () => clearTimeout(timer);
      }
    };

    handleCallback();
  }, [navigate]);

  const handleSpotifyCallback = async (code: string) => {
    try {
      // Exchange code for token
      const tokenData = await SpotifyService.exchangeCodeForToken(code);
      console.log('Spotify token exchange successful');
      
      // Store token
      localStorage.setItem('spotify_access_token', tokenData.access_token);
      
      // Fetch comprehensive Spotify data
      const [
        profile,
        topTracksShort,
        topTracksMedium,
        topTracksLong,
        topArtistsShort,
        topArtistsMedium,
        topArtistsLong,
        recentlyPlayed,
        playlists,
        savedTracks,
        followedArtists
      ] = await Promise.all([
        SpotifyService.getUserProfile(tokenData.access_token),
        SpotifyService.getTopTracks(tokenData.access_token, 'short_term'),
        SpotifyService.getTopTracks(tokenData.access_token, 'medium_term'),
        SpotifyService.getTopTracks(tokenData.access_token, 'long_term'),
        SpotifyService.getTopArtists(tokenData.access_token, 'short_term'),
        SpotifyService.getTopArtists(tokenData.access_token, 'medium_term'),
        SpotifyService.getTopArtists(tokenData.access_token, 'long_term'),
        SpotifyService.getRecentlyPlayed(tokenData.access_token),
        SpotifyService.getUserPlaylists(tokenData.access_token),
        SpotifyService.getSavedTracks(tokenData.access_token),
        SpotifyService.getFollowedArtists(tokenData.access_token)
      ]);

      const spotifyData = {
        profile,
        topTracks: {
          short_term: topTracksShort,
          medium_term: topTracksMedium,
          long_term: topTracksLong
        },
        topArtists: {
          short_term: topArtistsShort,
          medium_term: topArtistsMedium,
          long_term: topArtistsLong
        },
        recentlyPlayed,
        playlists,
        savedTracks,
        followedArtists
      };

      // Store data locally
      localStorage.setItem('spotify_profile', JSON.stringify(profile));
      localStorage.setItem('spotify_data', JSON.stringify(spotifyData));
      
      // Store in database if user is authenticated
      if (user) {
        await MirrorDataService.storeMirrorData({}, { spotify: spotifyData });
        console.log('Spotify data stored in database successfully');
      }
      
      toast({
        title: "Spotify Connected!",
        description: "Successfully connected your Spotify account and fetched your data.",
      });
      
      // Clear URL parameters and redirect to mirror
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/mirror');
      
    } catch (error) {
      console.error('Error in Spotify callback:', error);
      throw error;
    }
  };

  const handleYouTubeCallback = async (code: string) => {
    try {
      // Exchange code for token
      const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
      console.log('YouTube token exchange successful');
      
      // Store token
      localStorage.setItem('google_access_token', tokenData.access_token);
      
      // Fetch comprehensive YouTube data
      const channel = await YouTubeService.getChannelInfo(tokenData.access_token);
      console.log('YouTube channel info:', channel);
      
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

      const youtubeData = {
        channel,
        videos,
        playlists,
        subscriptions,
        likedVideos,
        watchLater
      };

      // Store data locally
      localStorage.setItem('youtube_channel', JSON.stringify(channel));
      localStorage.setItem('youtube_data', JSON.stringify(youtubeData));
      
      // Store in database if user is authenticated
      if (user) {
        await MirrorDataService.storeMirrorData({}, { youtube: youtubeData });
        console.log('YouTube data stored in database successfully');
      }
      
      toast({
        title: "YouTube Connected!",
        description: "Successfully connected your YouTube account and fetched your data.",
      });
      
      // Clear URL parameters and redirect to mirror
      window.history.replaceState({}, document.title, window.location.pathname);
      navigate('/mirror');
      
    } catch (error) {
      console.error('Error in YouTube callback:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">
          {isProcessing ? 'Processing connection...' : 'Completing authentication...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
