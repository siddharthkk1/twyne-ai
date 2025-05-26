
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Music, Video, CheckCircle, AlertCircle } from "lucide-react";
import { SpotifyService } from "@/services/spotifyService";
import { GoogleAuthService } from "@/services/googleAuthService";
import { YouTubeService } from "@/services/youtubeService";
import { useToast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [service, setService] = useState<'spotify' | 'youtube' | null>(null);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setError(`Authorization failed: ${error}`);
        setIsProcessing(false);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setIsProcessing(false);
        return;
      }

      try {
        if (state === 'youtube_auth') {
          setService('youtube');
          await handleYouTubeCallback(code);
        } else {
          setService('spotify');
          await handleSpotifyCallback(code);
        }
      } catch (err) {
        console.error('Callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams]);

  const handleSpotifyCallback = async (code: string) => {
    try {
      // Exchange code for token
      const tokenData = await SpotifyService.exchangeCodeForToken(code);
      const accessToken = tokenData.access_token;
      
      // Store token
      localStorage.setItem('spotify_access_token', accessToken);
      
      // Fetch user data
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

      // Store all data
      localStorage.setItem('spotify_profile', JSON.stringify(profile));
      localStorage.setItem('spotify_data', JSON.stringify(spotifyData));
      
      setData(spotifyData);
      
      toast({
        title: "Spotify Connected!",
        description: "Successfully fetched your Spotify data.",
      });
    } catch (error) {
      throw new Error(`Failed to process Spotify data: ${error.message}`);
    }
  };

  const handleYouTubeCallback = async (code: string) => {
    try {
      // Exchange code for token
      const tokenData = await GoogleAuthService.exchangeCodeForToken(code);
      const accessToken = tokenData.access_token;
      
      // Store token
      localStorage.setItem('google_access_token', accessToken);
      
      // Fetch user data
      const [
        channel,
        videos,
        playlists,
        subscriptions,
        likedVideos
      ] = await Promise.all([
        YouTubeService.getChannelInfo(accessToken),
        YouTubeService.getUserVideos(accessToken),
        YouTubeService.getUserPlaylists(accessToken),
        YouTubeService.getUserSubscriptions(accessToken),
        YouTubeService.getLikedVideos(accessToken)
      ]);

      const youtubeData = {
        channel,
        videos,
        playlists,
        subscriptions,
        likedVideos
      };

      // Store all data
      localStorage.setItem('youtube_channel', JSON.stringify(channel));
      localStorage.setItem('youtube_data', JSON.stringify(youtubeData));
      
      setData(youtubeData);
      
      toast({
        title: "YouTube Connected!",
        description: "Successfully fetched your YouTube data.",
      });
    } catch (error) {
      throw new Error(`Failed to process YouTube data: ${error.message}`);
    }
  };

  const goToMirror = () => {
    navigate('/mirror');
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Authorization
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Connecting your account and fetching your data...
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Connection Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={goToMirror} className="w-full">
              Go to Mirror
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl font-bold">
              {service === 'spotify' ? 'Spotify' : 'YouTube'} Connected!
            </h1>
          </div>
          <p className="text-muted-foreground">
            Your data has been successfully imported and is now part of your mirror.
          </p>
        </div>

        {service === 'spotify' && data && (
          <div className="space-y-6">
            {/* Profile Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Your Spotify Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {data.profile.images?.[0] && (
                    <img 
                      src={data.profile.images[0].url} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{data.profile.display_name}</h3>
                    <p className="text-muted-foreground">
                      {data.profile.followers?.total.toLocaleString()} followers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Artists */}
            <Card>
              <CardHeader>
                <CardTitle>Your Top Artists (All Time)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.topArtists.long_term?.slice(0, 10).map((artist: any, index: number) => (
                    <div key={artist.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <span className="font-semibold text-primary">#{index + 1}</span>
                      {artist.images?.[0] && (
                        <img 
                          src={artist.images[0].url} 
                          alt={artist.name}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {artist.followers?.total.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Songs */}
            <Card>
              <CardHeader>
                <CardTitle>Your Top Songs (All Time)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.topTracks.long_term?.slice(0, 15).map((track: any, index: number) => (
                    <div key={track.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <span className="font-semibold text-primary">#{index + 1}</span>
                      {track.album?.images?.[0] && (
                        <img 
                          src={track.album.images[0].url} 
                          alt={track.name}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{track.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {track.artists.map((artist: any) => artist.name).join(', ')} • {track.album.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {service === 'youtube' && data && (
          <div className="space-y-6">
            {/* Channel Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Your YouTube Channel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {data.channel.snippet?.thumbnails?.default && (
                    <img 
                      src={data.channel.snippet.thumbnails.default.url} 
                      alt="Channel" 
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{data.channel.snippet?.title}</h3>
                    <p className="text-muted-foreground">
                      {parseInt(data.channel.statistics?.subscriberCount || '0').toLocaleString()} subscribers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.subscriptions?.slice(0, 20).map((sub: any) => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {sub.snippet?.thumbnails?.default && (
                        <img 
                          src={sub.snippet.thumbnails.default.url} 
                          alt={sub.snippet.title}
                          className="w-12 h-12 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-medium">{sub.snippet?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {sub.snippet?.description?.slice(0, 50)}...
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Playlists */}
            <Card>
              <CardHeader>
                <CardTitle>Your Playlists</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.playlists?.slice(0, 10).map((playlist: any) => (
                    <div key={playlist.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      {playlist.snippet?.thumbnails?.default && (
                        <img 
                          src={playlist.snippet.thumbnails.default.url} 
                          alt={playlist.snippet.title}
                          className="w-12 h-12 rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{playlist.snippet?.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {playlist.contentDetails?.itemCount} videos
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Liked Videos */}
            {data.likedVideos && data.likedVideos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recently Liked Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.likedVideos.slice(0, 10).map((video: any) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        {video.snippet?.thumbnails?.default && (
                          <img 
                            src={video.snippet.thumbnails.default.url} 
                            alt={video.snippet.title}
                            className="w-16 h-12 rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{video.snippet?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {video.snippet?.channelTitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Button onClick={goToMirror} size="lg" className="px-8">
            Go to Your Mirror
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
