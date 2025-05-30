
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
    try {
      console.log('=== LOADING CONNECTION DATA IN COMPONENT ===');
      console.log('Current user state:', user ? user.id : 'not authenticated');
      
      const connectionData = await MirrorDataService.loadConnectionData();
      console.log('✅ Loaded connection data in component:', JSON.stringify(connectionData, null, 2));
      
      // Handle Spotify connection with enhanced validation
      if (connectionData.spotify) {
        const profile = connectionData.spotify.profile || connectionData.spotify;
        console.log('Processing Spotify profile in component:', JSON.stringify(profile, null, 2));
        
        // Validate Spotify profile has required fields
        if (profile && profile.id && (profile.display_name || profile.name)) {
          setSpotifyProfile(profile);
          setSpotifyToken('connected');
          console.log('✅ Valid Spotify profile set in UI state');
        } else {
          console.warn('⚠️ Invalid Spotify profile data, clearing UI state');
          setSpotifyProfile(null);
          setSpotifyToken(null);
        }
      } else {
        console.log('❌ No Spotify connection found, clearing UI state');
        setSpotifyProfile(null);
        setSpotifyToken(null);
      }
      
      // Handle YouTube connection with enhanced validation
      if (connectionData.youtube) {
        const channel = connectionData.youtube.channel || connectionData.youtube;
        console.log('Processing YouTube channel in component:', JSON.stringify(channel, null, 2));
        
        // Validate YouTube channel has required fields
        if (channel && channel.id && channel.snippet) {
          setYoutubeChannel(channel);
          setGoogleToken('connected');
          console.log('✅ Valid YouTube channel set in UI state');
        } else {
          console.warn('⚠️ Invalid YouTube channel data, clearing UI state');
          setYoutubeChannel(null);
          setGoogleToken(null);
        }
      } else {
        console.log('❌ No YouTube connection found, clearing UI state');
        setYoutubeChannel(null);
        setGoogleToken(null);
      }
    } catch (error) {
      console.error('❌ Error loading connection data in component:', error);
      // Fallback to localStorage
      loadFromLocalStorage();
    }
  };

  const loadFromLocalStorage = () => {
    console.log('📁 Loading from localStorage as fallback in component...');
    try {
      const savedSpotifyToken = localStorage.getItem('spotify_access_token');
      const savedSpotifyProfile = localStorage.getItem('spotify_profile');
      const savedSpotifyData = localStorage.getItem('spotify_data');
      const savedGoogleToken = localStorage.getItem('google_access_token');
      const savedYouTubeData = localStorage.getItem('youtube_data');
      
      // Handle Spotify data with priority: spotify_data > spotify_profile
      if (savedSpotifyData) {
        try {
          const spotifyData = JSON.parse(savedSpotifyData);
          const profile = spotifyData.profile || spotifyData;
          if (profile && profile.id) {
            setSpotifyProfile(profile);
            setSpotifyToken(savedSpotifyToken || 'connected');
            console.log('✅ Spotify data loaded from spotify_data localStorage');
          }
        } catch (error) {
          console.error('❌ Error parsing spotify_data from localStorage:', error);
        }
      } else if (savedSpotifyProfile) {
        try {
          const profile = JSON.parse(savedSpotifyProfile);
          if (profile && profile.id) {
            setSpotifyProfile(profile);
            setSpotifyToken(savedSpotifyToken || 'connected');
            console.log('✅ Spotify profile loaded from spotify_profile localStorage');
          }
        } catch (error) {
          console.error('❌ Error parsing spotify_profile from localStorage:', error);
        }
      }
      
      if (savedGoogleToken) {
        setGoogleToken(savedGoogleToken);
        console.log('✅ Google token loaded from localStorage');
      }
      
      if (savedYouTubeData) {
        try {
          const youtubeData = JSON.parse(savedYouTubeData);
          const channel = youtubeData.channel || youtubeData;
          if (channel && channel.id) {
            setYoutubeChannel(channel);
            console.log('✅ YouTube channel loaded from localStorage');
          }
        } catch (error) {
          console.error('❌ Error parsing YouTube data from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('❌ Error accessing localStorage:', error);
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
        console.log('🔄 Processing YouTube OAuth callback...');
        const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
        setGoogleToken(tokenData.access_token);
        localStorage.setItem('google_access_token', tokenData.access_token);
        
        await fetchYouTubeData(tokenData.access_token);
        
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account and fetched your data.",
        });
      } else {
        console.log('🔄 Processing Spotify OAuth callback...');
        const tokenData = await SpotifyService.exchangeCodeForToken(code);
        setSpotifyToken(tokenData.access_token);
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        
        await fetchSpotifyData(tokenData.access_token);
        
        toast({
          title: "Spotify Connected!",
          description: "Successfully connected your Spotify account and fetched your data.",
        });
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
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
      console.log('=== FETCHING COMPREHENSIVE SPOTIFY DATA ===');
      
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

      console.log('✅ Fetched Spotify profile for storage:', JSON.stringify(profile, null, 2));

      // Validate profile data
      if (!profile || !profile.id) {
        throw new Error('Invalid Spotify profile data received');
      }

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

      // Update UI state immediately with validated profile
      setSpotifyProfile(profile);
      console.log('✅ Spotify profile set in component state immediately');
      
      // Store in localStorage for immediate access
      localStorage.setItem('spotify_profile', JSON.stringify(profile));
      localStorage.setItem('spotify_data', JSON.stringify(spotifyData));
      console.log('✅ Spotify data stored in localStorage');
      
      // Store connection info in database
      console.log('🔄 Storing Spotify connection data in database...');
      const storeResult = await MirrorDataService.storeConnectionData('spotify', spotifyData);
      
      if (storeResult?.success) {
        console.log('✅ Spotify connection data stored successfully in database');
        
        // Verify the data persistence
        setTimeout(async () => {
          console.log('🔄 Verifying Spotify data persistence...');
          const verificationData = await MirrorDataService.loadConnectionData();
          if (verificationData.spotify && verificationData.spotify.profile) {
            console.log('✅ Spotify data persistence verified');
          } else {
            console.error('❌ Spotify data persistence verification failed');
            toast({
              title: "Data Persistence Warning",
              description: "Spotify connected but data may not persist across sessions.",
              variant: "destructive",
            });
          }
        }, 2000);
      } else {
        console.error('❌ Failed to store Spotify connection data in database:', storeResult?.error);
        toast({
          title: "Database Storage Warning",
          description: "Spotify connected but may not persist. Data saved locally only.",
          variant: "destructive",
        });
      }
      
      console.log('✅ Spotify data fetch and storage process completed');
    } catch (error) {
      console.error('❌ Error fetching Spotify data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Spotify data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchYouTubeData = async (accessToken: string) => {
    try {
      setIsFetchingData(true);
      console.log('🔄 Fetching comprehensive YouTube data...');
      
      // Fetch channel info first to get profile picture and subscriber count
      const channel = await YouTubeService.getChannelInfo(accessToken);
      console.log('✅ YouTube channel info fetched:', channel);
      
      const [
        videos,
        playlists,
        subscriptions,
        likedVideos,
        watchLater
      ] = await Promise.all([
        YouTubeService.getUserVideos(accessToken),
        YouTubeService.getUserPlaylists(accessToken),
        YouTubeService.getUserSubscriptions(accessToken),
        YouTubeService.getLikedVideos(accessToken),
        YouTubeService.getWatchLaterPlaylist(accessToken)
      ]);

      const youtubeData = {
        channel, // Store the complete channel object
        videos,
        playlists,
        subscriptions,
        likedVideos,
        watchLater
      };

      setYoutubeChannel(channel); // Set the channel state for UI display
      localStorage.setItem('youtube_channel', JSON.stringify(channel));
      localStorage.setItem('youtube_data', JSON.stringify(youtubeData));
      
      // Store connection info in database
      const storeResult = await MirrorDataService.storeConnectionData('youtube', youtubeData);
      
      if (storeResult?.success) {
        console.log('✅ YouTube connection data stored successfully in database');
      } else {
        console.error('❌ Failed to store YouTube connection data:', storeResult?.error);
      }
      
      console.log('✅ YouTube data fetched successfully:', youtubeData);
    } catch (error) {
      console.error('❌ Error fetching YouTube data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch YouTube data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingData(false);
    }
  };

  const connectSpotify = async () => {
    try {
      setIsConnectingSpotify(true);
      console.log('🔄 Initiating Spotify connection...');
      
      const redirectUri = `${window.location.origin}/auth/callback`;
      console.log('🔗 Spotify - Using redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('spotify-auth-url', {
        body: { redirect_uri: redirectUri }
      });
      
      if (error) {
        console.error('❌ Error getting Spotify auth URL:', error);
        throw error;
      }
      
      if (data?.authUrl) {
        console.log('🔗 Redirecting to Spotify auth URL:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        const fallbackUrl = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/spotify-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log('🔗 Using fallback redirect to:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    } catch (error) {
      console.error('❌ Error connecting to Spotify:', error);
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
      console.log('🔄 Initiating YouTube connection...');
      
      const redirectUri = `${window.location.origin}/auth/callback`;
      console.log('🔗 YouTube - Using redirect URI:', redirectUri);
      
      const { data, error } = await supabase.functions.invoke('google-auth-url', {
        body: { redirect_uri: redirectUri }
      });
      
      if (error) {
        console.error('❌ Error getting Google auth URL:', error);
        throw error;
      }
      
      if (data?.authUrl) {
        console.log('🔗 Redirecting to Google auth URL:', data.authUrl);
        window.location.href = data.authUrl;
      } else {
        const fallbackUrl = `https://lzwkccarbwokfxrzffjd.supabase.co/functions/v1/google-auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log('🔗 Using fallback redirect to:', fallbackUrl);
        window.location.href = fallbackUrl;
      }
    } catch (error) {
      console.error('❌ Error connecting to YouTube:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to YouTube. Please try again.",
        variant: "destructive",
      });
      setIsConnectingYoutube(false);
    }
  };

  const disconnectSpotify = async () => {
    console.log('🔄 Disconnecting Spotify...');
    
    // Clear UI state
    setSpotifyToken(null);
    setSpotifyProfile(null);
    
    // Clear localStorage
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_profile');
    localStorage.removeItem('spotify_data');
    localStorage.removeItem('spotify_raw_data');
    
    // Remove from database
    const removeResult = await MirrorDataService.removeConnectionData('spotify');
    
    if (removeResult?.success) {
      console.log('✅ Spotify disconnected successfully');
      toast({
        title: "Spotify Disconnected",
        description: "Your Spotify account has been disconnected.",
      });
    } else {
      console.error('❌ Error disconnecting Spotify:', removeResult?.error);
      toast({
        title: "Disconnect Warning",
        description: "Spotify disconnected from UI but may still be stored. Please check settings.",
        variant: "destructive",
      });
    }
  };

  const disconnectYouTube = async () => {
    console.log('🔄 Disconnecting YouTube...');
    
    // Clear UI state
    setGoogleToken(null);
    setYoutubeChannel(null);
    
    // Clear localStorage
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('youtube_channel');
    localStorage.removeItem('youtube_data');
    
    // Remove from database
    const removeResult = await MirrorDataService.removeConnectionData('youtube');
    
    if (removeResult?.success) {
      console.log('✅ YouTube disconnected successfully');
      toast({
        title: "YouTube Disconnected",
        description: "Your YouTube account has been disconnected.",
      });
    } else {
      console.error('❌ Error disconnecting YouTube:', removeResult?.error);
      toast({
        title: "Disconnect Warning",
        description: "YouTube disconnected from UI but may still be stored. Please check settings.",
        variant: "destructive",
      });
    }
  };

  // Enhanced debug logging for UI state
  console.log('=== COMPONENT UI STATE DEBUG ===');
  console.log('spotifyProfile state:', spotifyProfile ? 'SET' : 'NULL', spotifyProfile);
  console.log('youtubeChannel state:', youtubeChannel ? 'SET' : 'NULL', youtubeChannel);
  console.log('spotifyToken state:', spotifyToken);
  console.log('googleToken state:', googleToken);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spotify Button */}
        <div className="space-y-2">
          {spotifyProfile ? (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {spotifyProfile.images?.[0]?.url && (
                  <img 
                    src={spotifyProfile.images[0].url} 
                    alt="Spotify Profile" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">
                    {spotifyProfile.display_name || spotifyProfile.name || 'Spotify User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {spotifyProfile.followers?.total ? 
                      `${spotifyProfile.followers.total.toLocaleString()} followers` : 
                      'Spotify connected'
                    }
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
                {youtubeChannel.snippet?.thumbnails?.default?.url && (
                  <img 
                    src={youtubeChannel.snippet.thumbnails.default.url} 
                    alt="YouTube Channel" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium">{youtubeChannel.snippet?.title || 'Connected Channel'}</p>
                  <p className="text-sm text-muted-foreground">
                    {youtubeChannel.statistics?.subscriberCount ? 
                      parseInt(youtubeChannel.statistics.subscriberCount).toLocaleString() + ' subscribers' :
                      'YouTube connected'
                    }
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
