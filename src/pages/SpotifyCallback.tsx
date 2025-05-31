
import React, { useEffect, useState, useRef } from 'react';
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
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    const handleSpotifyCallback = async () => {
      // Prevent duplicate processing
      if (hasProcessedRef.current) {
        console.log('SpotifyCallback: Already processed, skipping');
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Handle OAuth errors
      if (error) {
        console.error('SpotifyCallback: OAuth error detected:', error);
        toast({
          title: "Spotify Connection Failed",
          description: "There was an error connecting to Spotify. Please try again.",
          variant: "destructive",
        });
        // Clear URL and redirect
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        return;
      }

      // Verify this is a Spotify callback
      if (!code || state !== 'spotify_auth') {
        console.error('SpotifyCallback: Invalid callback parameters', { code: !!code, state });
        navigate('/mirror');
        return;
      }

      // Mark as processing to prevent duplicate runs
      hasProcessedRef.current = true;
      setIsProcessing(true);
      
      try {
        console.log('SpotifyCallback: Starting processing');
        console.log('SpotifyCallback: Code length:', code.length);
        console.log('SpotifyCallback: Current user:', !!user);
        
        // Ensure we have a valid user session with retry logic
        let currentUser = user;
        let sessionAttempts = 0;
        const maxSessionAttempts = 3;
        
        while (!currentUser && sessionAttempts < maxSessionAttempts) {
          sessionAttempts++;
          console.log(`SpotifyCallback: No user session, refreshing... (attempt ${sessionAttempts}/${maxSessionAttempts})`);
          
          try {
            await refreshSession();
            
            // Wait for session to update
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Check if we now have a user
            const { data: { user: refreshedUser } } = await supabase.auth.getUser();
            currentUser = refreshedUser;
            
            if (currentUser) {
              console.log('SpotifyCallback: Session refresh successful');
              break;
            }
          } catch (refreshError) {
            console.error(`SpotifyCallback: Session refresh attempt ${sessionAttempts} failed:`, refreshError);
          }
        }
        
        if (!currentUser) {
          console.error('SpotifyCallback: No authenticated user after retries');
          toast({
            title: "Authentication Required",
            description: "Please sign in to connect your Spotify account.",
            variant: "destructive",
          });
          window.history.replaceState({}, document.title, window.location.pathname);
          navigate('/auth');
          return;
        }
        
        console.log('SpotifyCallback: Authenticated user confirmed:', currentUser.id);
        
        // Exchange code for token
        console.log('SpotifyCallback: Exchanging code for token...');
        const tokenData = await SpotifyService.exchangeCodeForToken(code);
        console.log('SpotifyCallback: Token exchange successful');
        
        // Store token locally for immediate use
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        if (tokenData.refresh_token) {
          localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
        }
        
        // Fetch comprehensive Spotify data
        console.log('SpotifyCallback: Fetching Spotify data...');
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

        console.log('SpotifyCallback: All Spotify data fetched successfully');

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
        console.log('SpotifyCallback: Generating AI insights...');
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
        
        console.log('SpotifyCallback: Storing connection data...');
        
        // Use retry logic for database operations
        let connectionStored = false;
        let connectionAttempts = 0;
        const maxConnectionAttempts = 3;
        
        while (!connectionStored && connectionAttempts < maxConnectionAttempts) {
          connectionAttempts++;
          console.log(`SpotifyCallback: Storing connection data (attempt ${connectionAttempts}/${maxConnectionAttempts})`);
          
          try {
            const connectionResult = await MirrorDataService.storeConnectionData('spotify', spotifyConnectionData);
            if (connectionResult.success) {
              connectionStored = true;
              console.log('SpotifyCallback: Connection data stored successfully');
            } else {
              console.warn('SpotifyCallback: Connection storage returned false:', connectionResult.error);
            }
          } catch (connectionError) {
            console.error(`SpotifyCallback: Connection storage attempt ${connectionAttempts} failed:`, connectionError);
            if (connectionAttempts === maxConnectionAttempts) {
              // Continue anyway as we have the data locally
              console.warn('SpotifyCallback: Continuing despite connection storage failure');
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
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
        
        console.log('SpotifyCallback: Storing mirror data...');
        
        // Use retry logic for mirror data storage
        let mirrorStored = false;
        let mirrorAttempts = 0;
        const maxMirrorAttempts = 3;
        
        while (!mirrorStored && mirrorAttempts < maxMirrorAttempts) {
          mirrorAttempts++;
          console.log(`SpotifyCallback: Storing mirror data (attempt ${mirrorAttempts}/${maxMirrorAttempts})`);
          
          try {
            const mirrorResult = await MirrorDataService.storeMirrorData({
              spotify: formattedInsights
            });
            if (mirrorResult.success) {
              mirrorStored = true;
              console.log('SpotifyCallback: Mirror data stored successfully');
            } else {
              console.warn('SpotifyCallback: Mirror storage returned false:', mirrorResult.error);
            }
          } catch (mirrorError) {
            console.error(`SpotifyCallback: Mirror storage attempt ${mirrorAttempts} failed:`, mirrorError);
            if (mirrorAttempts < maxMirrorAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
        
        toast({
          title: "Spotify Connected!",
          description: "Successfully connected your Spotify account and generated AI insights.",
        });
        
        console.log('SpotifyCallback: Success! Redirecting to mirror...');
        
        // Clear URL parameters and redirect to mirror
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
        
      } catch (error) {
        console.error('SpotifyCallback: Error in processing:', error);
        hasProcessedRef.current = false; // Reset on error to allow retry
        toast({
          title: "Spotify Connection Failed",
          description: "Failed to connect your Spotify account. Please try again.",
          variant: "destructive",
        });
        // Clear URL and redirect
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/mirror');
      } finally {
        setIsProcessing(false);
      }
    };

    handleSpotifyCallback();
  }, []); // Remove all dependencies to prevent re-runs

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
