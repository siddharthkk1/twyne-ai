
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SpotifyService } from '@/services/spotifyService';
import { GoogleAuthService } from '@/services/googleAuthService';
import { YouTubeService } from '@/services/youtubeService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { AIProfileService } from '@/services/aiProfileService';
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
            await handleSpotifyCallback(code);
          } else if (state === 'youtube_auth') {
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
      
      // Store token locally for immediate use
      localStorage.setItem('spotify_access_token', tokenData.access_token);
      if (tokenData.refresh_token) {
        localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
      }
      
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

      // Combine all tracks and artists for processing
      const allTracks = [
        ...topTracksShort,
        ...topTracksMedium, 
        ...topTracksLong,
        ...recentlyPlayed,
        ...savedTracks
      ];

      const allArtists = [
        ...topArtistsShort,
        ...topArtistsMedium,
        ...topArtistsLong,
        ...followedArtists
      ];

      // Extract genres from artists
      const genreCount: Record<string, number> = {};
      allArtists.forEach(artist => {
        if (artist.genres) {
          artist.genres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });

      const topGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([genre]) => genre);

      // Create synthesized data structure using LONG-TERM data for main display
      const synthesizedData = {
        topTracks: topTracksLong.slice(0, 20).map((track, index) => ({
          rank: index + 1,
          title: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          imageUrl: track.album.images[0]?.url || ''
        })),
        topArtists: topArtistsLong.slice(0, 20).map((artist, index) => ({
          rank: index + 1,
          name: artist.name,
          imageUrl: artist.images[0]?.url || ''
        })),
        topGenres,
        topAlbums: allTracks
          .map(track => track.album)
          .filter((album, index, arr) => 
            arr.findIndex(a => a.id === album.id) === index
          )
          .slice(0, 10)
          .map(album => ({
            name: album.name,
            artists: album.artists || [{ name: 'Unknown Artist' }],
            images: album.images || []
          })),
        // Store full long-term data for AI processing
        fullTopTracks: topTracksLong,
        fullTopArtists: topArtistsLong
      };

      // Generate AI insights using the comprehensive data
      console.log('Generating Spotify AI insights...');
      const spotifyInsights = await AIProfileService.generateSpotifyProfile({
        topTracks: topTracksLong,
        topArtists: topArtistsLong,
        topAlbums: allTracks
          .map(track => track.album)
          .filter((album, index, arr) => 
            arr.findIndex(a => a.id === album.id) === index
          )
          .slice(0, 10),
        topGenres
      });

      // Store connection data in platform_connections (WITHOUT rawData)
      const spotifyConnectionData = {
        profile,
        tokens: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null
        },
        synthesizedData
      };

      // Store data locally for immediate access
      localStorage.setItem('spotify_profile', JSON.stringify(profile));
      localStorage.setItem('spotify_data', JSON.stringify(synthesizedData));
      
      // Store connection data in database (platform_connections)
      await MirrorDataService.storeConnectionData('spotify', spotifyConnectionData);
      
      // Store AI insights in profile_data
      await MirrorDataService.storeMirrorData({
        spotify: spotifyInsights
      });
      
      toast({
        title: "Spotify Connected!",
        description: "Successfully connected your Spotify account and generated AI insights.",
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

      const youtubeData = {
        videos,
        playlists,
        subscriptions,
        likedVideos,
        watchLater
      };

      // Transform YouTube data for AI analysis
      const youtubeAnalysisData = {
        likedVideos: likedVideos.map(video => ({
          title: video.snippet.title,
          description: video.snippet.description,
          channelTitle: video.snippet.channelTitle,
          tags: video.snippet.tags || [],
          categoryId: video.snippet.categoryId
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
          tags: video.snippet.tags || [],
          categoryId: video.snippet.categoryId
        }))
      };

      // Generate AI insights for YouTube
      console.log('Generating YouTube AI insights...');
      const youtubeInsights = await AIProfileService.generateYouTubeProfile(youtubeAnalysisData);

      // Store connection data in platform_connections (WITHOUT rawData)
      const youtubeConnectionData = {
        channel,
        tokens: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null
        },
        data: youtubeData
      };

      // Store data locally for immediate access
      localStorage.setItem('youtube_channel', JSON.stringify(channel));
      localStorage.setItem('youtube_data', JSON.stringify(youtubeData));
      
      // Store connection data in database (platform_connections)
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
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">
          {isProcessing ? 'Processing connection and generating insights...' : 'Completing authentication...'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
