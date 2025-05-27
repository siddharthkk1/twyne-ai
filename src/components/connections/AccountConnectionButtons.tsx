import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SpotifyService } from "@/services/spotifyService";
import { GoogleAuthService } from "@/services/googleAuthService";
import { YouTubeService } from "@/services/youtubeService";
import { useAuth } from "@/contexts/AuthContext";
import { MirrorDataService } from "@/services/mirrorDataService";

const AccountConnectionButtons = () => {
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const [isConnectingYoutube, setIsConnectingYoutube] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);
  const [youtubeChannel, setYoutubeChannel] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
    loadConnectionData();
  }, [user]);

  const loadConnectionData = async () => {
    if (user) {
      // For authenticated users, load from database first
      try {
        const connectionData = await MirrorDataService.loadConnectionData();
        console.log('Loaded connection data from database:', connectionData);
        
        if (connectionData.spotify) {
          setSpotifyProfile(connectionData.spotify.profile || connectionData.spotify);
          setSpotifyToken('connected'); // Set token state to indicate connection
          console.log('Loaded Spotify profile from database:', connectionData.spotify.profile || connectionData.spotify);
        }
        
        if (connectionData.youtube) {
          setYoutubeChannel(connectionData.youtube.channel || connectionData.youtube);
          setGoogleToken('connected'); // Set token state to indicate connection
          console.log('Loaded YouTube channel from database:', connectionData.youtube.channel || connectionData.youtube);
        }
      } catch (error) {
        console.error('Error loading connection data from database:', error);
        // Fallback to localStorage
        loadFromLocalStorage();
      }
    } else {
      // For anonymous users, load from localStorage only
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    const savedSpotifyToken = localStorage.getItem('spotify_access_token');
    const savedSpotifyProfile = localStorage.getItem('spotify_profile');
    const savedGoogleToken = localStorage.getItem('google_access_token');
    const savedYouTubeChannel = localStorage.getItem('youtube_channel');
    
    if (savedSpotifyToken) {
      setSpotifyToken(savedSpotifyToken);
    }
    if (savedSpotifyProfile) {
      try {
        setSpotifyProfile(JSON.parse(savedSpotifyProfile));
      } catch (error) {
        console.error('Error parsing Spotify profile from localStorage:', error);
      }
    }
    if (savedGoogleToken) {
      setGoogleToken(savedGoogleToken);
    }
    if (savedYouTubeChannel) {
      try {
        setYoutubeChannel(JSON.parse(savedYouTubeChannel));
      } catch (error) {
        console.error('Error parsing YouTube channel from localStorage:', error);
      }
    }
  };

  const handleOAuthCallback = async (code: string, state: string | null) => {
    if (state === 'youtube_auth') {
      setIsConnectingYoutube(true);
    } else {
      setIsConnectingSpotify(true);
    }
    
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
      setIsConnectingSpotify(false);
      setIsConnectingYoutube(false);
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
      
      // If user is authenticated, also store in database
      if (user) {
        try {
          await MirrorDataService.storeMirrorData(
            { spotify: spotifyData },
            { spotify: spotifyData }
          );
          console.log('Spotify data stored in database successfully');
        } catch (error) {
          console.error('Error storing Spotify data in database:', error);
        }
      }
      
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
      
      // If user is authenticated, also store in database
      if (user) {
        try {
          await MirrorDataService.storeMirrorData(
            { youtube: youtubeData },
            { youtube: youtubeData }
          );
          console.log('YouTube data stored in database successfully');
        } catch (error) {
          console.error('Error storing YouTube data in database:', error);
        }
      }
      
      console.log('YouTube data fetched successfully:', youtubeData);
    } catch (error) {
      console.error('Error fetching YouTube data:', error);
    } finally {
      setIsFetchingData(false);
    }
  };

  const connectSpotify = async () => {
    try {
      setIsConnectingSpotify(true);
      console.log('Initiating Spotify connection...');
      
      // Use the exact redirect URI that should be registered in Spotify developer console
      const redirectUri = `https://9c0cff03-a326-49dd-8bfb-d6678231c2b3.lovableproject.com/auth/callback`;
      console.log('Spotify - Using redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('spotify-auth-url', {
        body: { redirect_uri: redirectUri }
      });
      
      if (error) {
        console.error('Error getting Spotify auth URL:', error);
        throw error;
      }
      
      // The edge function should return the auth URL or redirect directly
      if (data?.authUrl) {
        console.log('Redirecting to Spotify auth URL:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        // If no auth URL returned, try direct redirect as fallback
        const fallbackUrl = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/spotify-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log('Using fallback redirect to:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive",
      });
      setIsConnectingSpotify(false);
    }
  };

  const connectYouTube = async () => {
    try {
      setIsConnectingYoutube(true);
      console.log('Initiating YouTube connection...');
      
      // Use the exact redirect URI that should be registered in Google developer console
      const redirectUri = `https://9c0cff03-a326-49dd-8bfb-d6678231c2b3.lovableproject.com/auth/callback`;
      console.log('YouTube - Using redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { redirect_uri: redirectUri }
      });
      
      if (error) {
        console.error('Error getting Google auth URL:', error);
        throw error;
      }
      
      // The edge function should return the auth URL or redirect directly
      if (data?.authUrl) {
        console.log('Redirecting to Google auth URL:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        // If no auth URL returned, try direct redirect as fallback
        const fallbackUrl = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log('Using fallback redirect to:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    } catch (error) {
      console.error('Error connecting to YouTube:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      });
      setIsConnectingYoutube(false);
    }
  };

  const disconnectSpotify = async () => {
    setSpotifyToken(null);
    setSpotifyProfile(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_profile');
    localStorage.removeItem('spotify_data');
    
    // If user is authenticated, also remove from database
    if (user) {
      try {
        await MirrorDataService.storeMirrorData(
          {},
          { spotify: null }
        );
        console.log('Spotify data removed from database');
      } catch (error) {
        console.error('Error removing Spotify data from database:', error);
      }
    }
    
    toast({
      title: "Spotify Disconnected",
      description: "Your Spotify account has been disconnected.",
    });
  };

  const disconnectYouTube = async () => {
    setGoogleToken(null);
    setYoutubeChannel(null);
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('youtube_channel');
    localStorage.removeItem('youtube_data');
    
    // If user is authenticated, also remove from database
    if (user) {
      try {
        await MirrorDataService.storeMirrorData(
          {},
          { youtube: null }
        );
        console.log('YouTube data removed from database');
      } catch (error) {
        console.error('Error removing YouTube data from database:', error);
      }
    }
    
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
              disabled={isConnectingSpotify}
              className="bg-green-500 hover:bg-green-600 text-white h-16 flex flex-col items-center justify-center gap-2 w-full"
            >
              {isConnectingSpotify ? (
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
              disabled={isConnectingYoutube}
              className="bg-red-500 hover:bg-red-600 text-white h-16 flex flex-col items-center justify-center gap-2 w-full"
            >
              {isConnectingYoutube ? (
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
