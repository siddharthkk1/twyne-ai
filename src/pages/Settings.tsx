
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, User, Music, Video, ExternalLink } from "lucide-react";
import HumanAvatar3D from "@/components/HumanAvatar3D";
import { SpotifyService } from "@/services/spotifyService";
import { GoogleAuthService } from "@/services/googleAuthService";
import { YouTubeService } from "@/services/youtubeService";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);
  const [youtubeChannel, setYoutubeChannel] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check for OAuth callback codes in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code: string, state: string | null) => {
    setIsConnecting(true);
    
    try {
      if (state === 'youtube_auth') {
        // Handle YouTube OAuth callback
        const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
        setGoogleToken(tokenData.access_token);
        localStorage.setItem('google_access_token', tokenData.access_token);
        
        // Fetch YouTube channel info
        const channel = await YouTubeService.getChannelInfo(tokenData.access_token);
        setYoutubeChannel(channel);
        localStorage.setItem('youtube_channel', JSON.stringify(channel));
        
        toast({
          title: "YouTube Connected!",
          description: "Successfully connected your YouTube account.",
        });
      } else {
        // Handle Spotify OAuth callback
        const tokenData = await SpotifyService.exchangeCodeForToken(code);
        setSpotifyToken(tokenData.access_token);
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        
        // Fetch Spotify profile
        const profile = await SpotifyService.getUserProfile(tokenData.access_token);
        setSpotifyProfile(profile);
        localStorage.setItem('spotify_profile', JSON.stringify(profile));
        
        toast({
          title: "Spotify Connected!",
          description: "Successfully connected your Spotify account.",
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

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const connectSpotify = () => {
    const authUrl = SpotifyService.getAuthUrl();
    window.location.href = authUrl;
  };

  const connectYouTube = () => {
    const authUrl = GoogleAuthService.getYouTubeAuthUrl();
    window.location.href = authUrl;
  };

  const disconnectSpotify = () => {
    setSpotifyToken(null);
    setSpotifyProfile(null);
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_profile');
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
    toast({
      title: "YouTube Disconnected",
      description: "Your YouTube account has been disconnected.",
    });
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Settings</h1>
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Avatar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HumanAvatar3D className="bg-gradient-to-b from-blue-50 to-indigo-50" />
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Your personalized 3D avatar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Spotify Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {spotifyProfile ? (
              <div className="space-y-3">
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
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Music className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect Spotify"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              YouTube Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {youtubeChannel ? (
              <div className="space-y-3">
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
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <Video className="mr-2 h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect YouTube"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="destructive" 
              className="w-full flex items-center justify-center gap-2" 
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
