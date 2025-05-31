
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SpotifyService } from '@/services/spotifyService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { AIProfileService } from '@/services/aiProfileService';
import { toast } from '@/components/ui/use-toast';

const SpotifyCallback = () => {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleSpotifyCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Handle OAuth errors
      if (error) {
        console.error('Spotify OAuth error:', error);
        toast({
          title: "Spotify Connection Failed",
          description: "There was an error connecting to Spotify. Please try again.",
          variant: "destructive",
        });
        navigate('/mirror');
        return;
      }

      // Verify this is a Spotify callback
      if (!code || state !== 'spotify_auth') {
        console.error('Invalid Spotify callback parameters');
        navigate('/mirror');
        return;
      }

      setIsProcessing(true);
      
      try {
        // Ensure we have a valid user session
        if (!user) {
          console.log('SpotifyCallback: No user session, refreshing...');
          await refreshSession();
          
          // Wait a bit for auth state to update
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
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

        // Generate AI insights using the comprehensive data
        console.log('Generating Spotify AI insights...');
        const spotifyInsights = await AIProfileService.generateSpotifyProfile({
          topTracks: topTracksLong,
          topArtists: topArtistsLong,
          topAlbums: allTracks
            .map(track => ({
              name: track.album.name,
              artists: track.artists || [{ name: 'Unknown Artist' }],
              images: track.album.images || []
            }))
            .filter((album, index, arr) => 
              arr.findIndex(a => a.name === album.name) === index
            )
            .slice(0, 10),
          topGenres
        });

        // Store connection metadata only (profile + tokens) in platform_connections
        const spotifyConnectionData = {
          profile,
          tokens: {
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: tokenData.expires_in ? Date.now() + (tokenData.expires_in * 1000) : null
          }
        };

        // Store data locally for immediate access - only profile
        localStorage.setItem('spotify_profile', JSON.stringify(profile));
        
        // Store connection metadata in database (platform_connections)
        await MirrorDataService.storeConnectionData('spotify', spotifyConnectionData);
        
        // Store AI insights in profile_data - convert AI insights to match SynthesizedSpotifyData format
        const formattedInsights = {
          topSongs: spotifyInsights.topSongs?.map((song, index) => ({
            rank: index + 1,
            title: song.name,
            artist: song.artists.map(a => a.name).join(', '),
            imageUrl: song.album.images[0]?.url || ''
          })) || [],
          topArtists: spotifyInsights.topArtists?.map((artist, index) => ({
            rank: index + 1,
            name: artist.name,
            imageUrl: artist.images[0]?.url || ''
          })) || [],
          topAlbums: spotifyInsights.topAlbums || [],
          topGenres: spotifyInsights.topGenres || topGenres.slice(0, 5),
          vibeSummary: spotifyInsights.vibeSummary,
          traitDisplay: spotifyInsights.traitDisplay
        };
        
        await MirrorDataService.storeMirrorData({
          spotify: formattedInsights
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
        toast({
          title: "Spotify Connection Failed",
          description: "Failed to connect your Spotify account. Please try again.",
          variant: "destructive",
        });
        navigate('/mirror');
      } finally {
        setIsProcessing(false);
      }
    };

    handleSpotifyCallback();
  }, [navigate, user, refreshSession]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-lg">
          {isProcessing ? 'Connecting Spotify and generating insights...' : 'Processing Spotify connection...'}
        </p>
      </div>
    </div>
  );
};

export default SpotifyCallback;
