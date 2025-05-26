
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyService } from "@/services/spotifyService";
import { GoogleAuthService } from "@/services/googleAuthService";
import { YouTubeService } from "@/services/youtubeService";

const AccountConnectionButtons = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);
  const [youtubeChannel, setYoutubeChannel] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for OAuth callback codes in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);

  // Load saved tokens on component mount
  useEffect(() => {
    const savedSpotifyToken = localStorage.getItem('spotify_access_token');
    const savedSpotifyProfile = localStorage.getItem('spotify_profile');
    const savedGoogleToken = localStorage.getItem('google_access_token');
    const savedYouTubeChannel = localStorage.getItem('youtube_channel');
    
    if (savedSpotifyToken) {
      setSpotifyToken(savedSpotifyToken);
    }
    if (savedSpotifyProfile) {
      setSpotifyProfile(JSON.parse(savedSpotifyProfile));
    }
    if (savedGoogleToken) {
      setGoogleToken(savedGoogleToken);
    }
    if (savedYouTubeChannel) {
      setYoutubeChannel(JSON.parse(savedYouTubeChannel));
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string | null) => {
    setIsConnecting(true);
    
    try {
      if (state === 'youtube_auth') {
        // Handle YouTube OAuth callback
        console.log('Processing YouTube OAuth callback...');
        const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
        setGoogleToken(tokenData.access_token);
        localStorage.setItem('google_access_token', tokenData.access_token);
        
        // Fetch comprehensive YouTube data
        await fetchYouTubeData(tokenData.access_token);
        
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account and fetched your data.",
        });
      } else {
        // Handle Spotify OAuth callback
        console.log('Processing Spotify OAuth callback...');
        const tokenData = await SpotifyService.exchangeCodeForToken(code);
        setSpotifyToken(tokenData.access_token);
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        
        // Fetch comprehensive Spotify data
        await fetchSpotifyData(tokenData.access_token);
        
        toast({
          title: "Spotify Connected!",
          description: "Successfully connected your Spotify account and fetched your data.",
        });
      }
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchSpotifyData = async (accessToken: string) => {
    try {
      setIsFetchingData(true);
      console.log('Fetching comprehensive Spotify data...');
      
      // Fetch all available Spotify data
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
        SpotifyService.getUserProfile(accessToken),
        SpotifyService.getTopTracks(accessToken, 'short_term'),
        SpotifyService.getTopTracks(accessToken, 'medium_term'),
        SpotifyService.getTopTracks(accessToken, 'long_term'),
        SpotifyService.getTopArtists(accessToken, 'short_term'),
        SpotifyService.getTopArtists(accessToken, 'medium_term'),
        SpotifyService.getTopArtists(accessToken, 'long_term'),
        SpotifyService.getRecentlyPlayed(accessToken),
        SpotifyService.getUserPlaylists(accessToken),
        SpotifyService.getSavedTracks(accessToken),
        SpotifyService.getFollowedArtists(accessToken)
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

      setSpotifyProfile(profile);
      localStorage.setItem('spotify_profile', JSON.stringify(profile));
      localStorage.setItem('spotify_data', JSON.stringify(spotifyData));
      
      console.log('Spotify data fetched successfully:', spotifyData);
    } catch (error) {
      console.error('Error fetching Spotify data:', error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchYouTubeData = async (accessToken: string) => {
    try {
      setIsFetchingData(true);
      console.log('Fetching comprehensive YouTube data...');
      
      // Fetch all available YouTube data
      const [
        channel,
        videos,
        playlists,
        subscriptions,
        likedVideos,
        watchLater
      ] = await Promise.all([
        YouTubeService.getChannelInfo(accessToken),
        YouTubeService.getUserVideos(accessToken),
        YouTubeService.getUserPlaylists(accessToken),
        YouTubeService.getUserSubscriptions(accessToken),
        YouTubeService.getLikedVideos(accessToken),
        YouTubeService.getWatchLaterPlaylist(accessToken)
      ]);

      const youtubeData = {
        channel,
        videos,
        playlists,
        subscriptions,
        likedVideos,
        watchLater
      };

      setYoutubeChannel(channel);
      localStorage.setItem('youtube_channel', JSON.stringify(channel));
      localStorage.setItem('youtube_data', JSON.stringify(youtubeData));
      
      console.log('YouTube data fetched successfully:', youtubeData);
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const connectSpotify = async () => {
    try {
      setIsConnecting(true);
      console.log('Initiating Spotify connection...');
      
      // Use Supabase client to call the edge function
      const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
      const { data, error } = await supabase.functions.invoke('spotify-auth-url', {
        body: { redirect_uri: decodeURIComponent(redirectUri) }
      });
      
      if (error) {
        console.error('Error getting Spotify auth URL:', error);
        throw error;
      }
      
      // The edge function should return the auth URL or redirect directly
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        // If no auth URL returned, try direct redirect as fallback
        window.location.href = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/spotify-auth-url?redirect_uri=${redirectUri}`;
      }
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const connectYouTube = async () => {
    try {
      setIsConnecting(true);
      console.log('Initiating YouTube connection...');
      
      // Use Supabase client to call the edge function
      const redirectUri = encodeURIComponent(window.location.origin + window.location.pathname);
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { redirect_uri: decodeURIComponent(redirectUri) }
      });
      
      if (error) {
        console.error('Error getting Google auth URL:', error);
        throw error;
      }
      
      // The edge function should return the auth URL or redirect directly
      if (data?.authUrl) {
        window.location.href = data.authUrl;
      } else {
        // If no auth URL returned, try direct redirect as fallback
        window.location.href = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url?redirect_uri=${redirectUri}`;
      }
    } catch (error) {
      console.error('Error connecting to YouTube:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const disconnectSpotify = () => {
    setSpotifyToken(null);
    setSpotifyProfile(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_profile');
    localStorage.removeItem('spotify_data');
    toast({
      title: "Spotify Disconnected",
      description: "Your Spotify account has been disconnected.",
    });
  };

  const disconnectYouTube = () => {
    setGoogleToken(null);
    setYoutubeChannel(null);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('youtube_channel');
    localStorage.removeItem('youtube_data');
    toast({
      title: "YouTube Disconnected",
      description: "Your YouTube account has been disconnected.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spotify Button */}
        <div className="space-y-2">
          {spotifyProfile ? (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {spotifyProfile.images?.[0] && (
                  <img 
                    src={spotifyProfile.images[0].url} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{spotifyProfile.display_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {spotifyProfile.followers?.total} followers
                  </p>
                </div>
              </div>
              {isFetchingData && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing your music data...
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={disconnectSpotify}
                className="w-full"
              >
                Disconnect Spotify
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectSpotify}
              disabled={isConnecting}
              className="bg-green-500 hover:bg-green-600 text-white h-16 flex flex-col items-center justify-center gap-2 w-full"
            >
              {isConnecting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Music className="h-6 w-6" />
                  <span>Connect Spotify</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* YouTube Button */}
        <div className="space-y-2">
          {youtubeChannel ? (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {youtubeChannel.snippet?.thumbnails?.default && (
                  <img 
                    src={youtubeChannel.snippet.thumbnails.default.url} 
                    alt="Channel" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{youtubeChannel.snippet?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {parseInt(youtubeChannel.statistics?.subscriberCount || '0').toLocaleString()} subscribers
                  </p>
                </div>
              </div>
              {isFetchingData && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Syncing your video data...
                </div>
              )}
              <Button 
                variant="outline" 
                onClick={disconnectYouTube}
                className="w-full"
              >
                Disconnect YouTube
              </Button>
            </div>
          ) : (
            <Button 
              onClick={connectYouTube}
              disabled={isConnecting}
              className="bg-red-500 hover:bg-red-600 text-white h-16 flex flex-col items-center justify-center gap-2 w-full"
            >
              {isConnecting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Video className="h-6 w-6" />
                  <span>Connect YouTube</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountConnectionButtons;
