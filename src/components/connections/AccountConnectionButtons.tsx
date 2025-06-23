
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Music, Video, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SpotifyService } from "@/services/spotifyService";
import { GoogleAuthService } from "@/services/googleAuthService";
import { useAuth } from "@/contexts/AuthContext";
import { MirrorDataService } from "@/services/mirrorDataService";

const AccountConnectionButtons = () => {
  const [isConnectingSpotify, setIsConnectingSpotify] = useState(false);
  const [isConnectingYoutube, setIsConnectingYoutube] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState<any>(null);
  const [youtubeChannel, setYoutubeChannel] = useState<any>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load connection data on component mount
  useEffect(() => {
    loadConnectionData();
  }, [user]);

  const loadConnectionData = async () => {
    try {
      const connectionData = await MirrorDataService.loadConnectionData();
      
      // Handle Spotify connection
      if (connectionData.spotify) {
        const profile = connectionData.spotify.profile || connectionData.spotify;
        if (profile && profile.id && (profile.display_name || profile.name)) {
          setSpotifyProfile(profile);
        }
      }
      
      // Handle YouTube connection
      if (connectionData.youtube) {
        const channel = connectionData.youtube.channel || connectionData.youtube;
        if (channel && channel.id && channel.snippet) {
          setYoutubeChannel(channel);
        }
      }
    } catch (error) {
      console.error('Error loading connection data:', error);
    }
  };

  const connectSpotify = async () => {
    try {
      setIsConnectingSpotify(true);
      
      // Use the corrected SpotifyService method
      const authUrl = SpotifyService.getAuthUrl();
      console.log('Redirecting to Spotify auth URL:', authUrl);
      window.location.href = authUrl;
      
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
      
      // Use the corrected GoogleAuthService method
      const authUrl = GoogleAuthService.getYouTubeAuthUrl();
      console.log('Redirecting to YouTube auth URL:', authUrl);
      window.location.href = authUrl;
      
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
    setSpotifyProfile(null);
    
    const removeResult = await MirrorDataService.removeConnectionData('spotify');
    
    if (removeResult?.success) {
      toast({
        title: "Spotify Disconnected",
        description: "Your Spotify account has been disconnected.",
      });
    } else {
      toast({
        title: "Disconnect Warning",
        description: "Spotify disconnected from UI but may still be stored. Please check settings.",
        variant: "destructive",
      });
    }
  };

  const disconnectYouTube = async () => {
    setYoutubeChannel(null);
    
    const removeResult = await MirrorDataService.removeConnectionData('youtube');
    
    if (removeResult?.success) {
      toast({
        title: "YouTube Disconnected",
        description: "Your YouTube account has been disconnected.",
      });
    } else {
      toast({
        title: "Disconnect Warning",
        description: "YouTube disconnected from UI but may still be stored. Please check settings.",
        variant: "destructive",
      });
    }
  };

  const comingSoonIntegrations = [
    { name: "X (Twitter)", icon: "📱", description: "Connect your X account to share your social insights" },
    { name: "Apple Notes", icon: "📝", description: "Sync your thoughts and notes from Apple Notes" },
    { name: "Goodreads", icon: "📚", description: "Share your reading preferences and book recommendations" },
    { name: "StoryGraph", icon: "📖", description: "Connect your book tracking and reading stats" },
    { name: "Letterboxd", icon: "🎬", description: "Share your movie taste and film diary" },
    { name: "Reddit", icon: "🤖", description: "Connect your Reddit activity and interests" },
    { name: "Notion", icon: "📋", description: "Sync your Notion workspace and personal database" }
  ];

  return (
    <div className="space-y-8">
      {/* Active Integrations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Connect Your Accounts</h3>
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

      {/* Coming Soon Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-muted-foreground">Coming Soon</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {comingSoonIntegrations.map((integration, index) => (
            <div key={index} className="opacity-60 cursor-not-allowed">
              <Button
                disabled
                className="bg-gray-100 hover:bg-gray-100 text-gray-500 h-16 flex flex-col items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300"
              >
                <span className="text-2xl">{integration.icon}</span>
                <span className="text-sm font-medium">{integration.name}</span>
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {integration.description}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            More integrations are on the way! These will help us understand you better and make more meaningful connections.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountConnectionButtons;
