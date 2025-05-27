
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SpotifyService } from '@/services/spotifyService';
import { YouTubeService } from '@/services/youtubeService';
import { AIProfileService } from '@/services/aiProfileService';
import { MirrorDataService } from '@/services/mirrorDataService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing...');
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        setStatus('Authentication failed');
        toast.error('Authentication failed');
        setTimeout(() => navigate('/mirror'), 3000);
        return;
      }

      if (!code) {
        console.error('No authorization code received');
        setStatus('No authorization code received');
        setTimeout(() => navigate('/mirror'), 3000);
        return;
      }

      try {
        if (state === 'spotify_auth') {
          setStatus('Connecting to Spotify...');
          
          // Exchange code for tokens
          const tokenData = await SpotifyService.exchangeCodeForToken(code);
          
          setStatus('Fetching your Spotify data...');
          
          // Fetch user data using long_term for all-time data
          const [profile, topTracks, topArtists, recentlyPlayed, playlists, savedTracks, followedArtists] = await Promise.all([
            SpotifyService.getUserProfile(tokenData.access_token),
            SpotifyService.getTopTracks(tokenData.access_token, 'long_term'),
            SpotifyService.getTopArtists(tokenData.access_token, 'long_term'),
            SpotifyService.getRecentlyPlayed(tokenData.access_token),
            SpotifyService.getUserPlaylists(tokenData.access_token),
            SpotifyService.getSavedTracks(tokenData.access_token),
            SpotifyService.getFollowedArtists(tokenData.access_token)
          ]);

          // Get audio features for tracks
          const tracksWithFeatures = await Promise.all(
            topTracks.map(async (track) => {
              try {
                const response = await fetch(`https://api.spotify.com/v1/audio-features/${track.id}`, {
                  headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
                });
                if (response.ok) {
                  const audioFeatures = await response.json();
                  return { ...track, audio_features: audioFeatures };
                }
                return track;
              } catch (error) {
                console.error('Error fetching audio features for track:', track.id, error);
                return track;
              }
            })
          );

          const allGenres = topArtists.flatMap(artist => artist.genres);
          const genreCounts = allGenres.reduce((acc, genre) => {
            acc[genre] = (acc[genre] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          const topGenres = Object.entries(genreCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([genre]) => genre);

          const albumsMap = new Map();
          tracksWithFeatures.forEach(track => {
            if (!albumsMap.has(track.album.name)) {
              albumsMap.set(track.album.name, {
                name: track.album.name,
                artists: track.artists,
                images: track.album.images
              });
            }
          });
          const topAlbums = Array.from(albumsMap.values()).slice(0, 10);

          const simplifiedTopTracks = tracksWithFeatures.slice(0, 5).map((track, index) => ({
            rank: index + 1,
            title: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            imageUrl: track.album.images?.[0]?.url || ''
          }));

          const simplifiedTopArtists = topArtists.slice(0, 5).map((artist, index) => ({
            rank: index + 1,
            name: artist.name,
            imageUrl: artist.images?.[0]?.url || ''
          }));

          const spotifyData = {
            profile,
            topTracks: simplifiedTopTracks,
            topArtists: simplifiedTopArtists,
            topGenres,
            topAlbums,
            recentlyPlayed,
            playlists,
            savedTracks,
            followedArtists
          };

          console.log('Complete Spotify data fetched:', spotifyData);

          await MirrorDataService.storeConnectionData('spotify', spotifyData);

          setStatus('Generating your music insights...');
          
          const spotifyInsights = await AIProfileService.generateSpotifyProfile({
            topTracks: tracksWithFeatures.slice(0, 50),
            topArtists: topArtists.slice(0, 50),
            topGenres,
            topAlbums
          });

          const synthesizedSpotifyData = {
            vibeSummary: spotifyInsights.vibeSummary,
            traitDisplay: spotifyInsights.traitDisplay,
            topSongs: simplifiedTopTracks,
            topArtists: simplifiedTopArtists,
            topGenres: topGenres.slice(0, 5),
            topAlbums: topAlbums.slice(0, 5)
          };

          await MirrorDataService.storeMirrorData(
            { spotify: synthesizedSpotifyData },
            { spotify: spotifyData }
          );

          setStatus('Spotify connected successfully!');
          toast.success('Spotify connected successfully!');
          
        } else if (state === 'youtube_auth') {
          setStatus('Connecting to YouTube...');
          
          // Exchange code for tokens
          const tokenData = await YouTubeService.exchangeCodeForToken(code);
          
          setStatus('Fetching your YouTube data...');
          
          // Fetch YouTube channel info with proper error handling
          let channel;
          try {
            channel = await YouTubeService.getChannelInfo(tokenData.access_token);
            console.log('YouTube channel fetched successfully:', channel);
          } catch (error) {
            console.error('Error fetching YouTube channel:', error);
            throw new Error('Failed to fetch YouTube channel information');
          }
          
          // Fetch other YouTube data
          const [rawLikedVideos, rawSubscriptions, rawWatchHistory, videos, playlists] = await Promise.all([
            YouTubeService.getLikedVideos(tokenData.access_token).catch(e => { console.error('Error fetching liked videos:', e); return []; }),
            YouTubeService.getUserSubscriptions(tokenData.access_token).catch(e => { console.error('Error fetching subscriptions:', e); return []; }),
            YouTubeService.getWatchHistory(tokenData.access_token).catch(e => { console.error('Error fetching watch history:', e); return []; }),
            YouTubeService.getUserVideos(tokenData.access_token).catch(e => { console.error('Error fetching user videos:', e); return []; }),
            YouTubeService.getUserPlaylists(tokenData.access_token).catch(e => { console.error('Error fetching playlists:', e); return []; })
          ]);

          const youtubeData = {
            channel, // Store the complete channel object with profile pic and subscriber count
            videos,
            playlists,
            subscriptions: rawSubscriptions,
            likedVideos: rawLikedVideos,
            watchHistory: rawWatchHistory
          };

          console.log('Complete YouTube data fetched:', youtubeData);

          // Store connection data persistently
          await MirrorDataService.storeConnectionData('youtube', youtubeData);

          setStatus('Generating your content insights...');
          
          // Transform the data for AI analysis
          const likedVideos = rawLikedVideos.map(video => ({
            title: video.snippet.title,
            description: video.snippet.description || '',
            channelTitle: video.snippet.channelTitle,
            tags: [],
            categoryId: undefined
          }));

          const subscriptions = rawSubscriptions.map(sub => ({
            title: sub.snippet.title,
            description: sub.snippet.description || '',
            topicCategories: [],
            keywords: []
          }));

          const watchHistory = rawWatchHistory.map(video => ({
            title: video.snippet.title,
            description: video.snippet.description || '',
            tags: [],
            categoryId: undefined
          }));

          // Generate AI insights using transformed data
          const youtubeSummary = await AIProfileService.generateYouTubeProfile({
            likedVideos,
            subscriptions,
            watchHistory
          });

          // Store synthesized data
          await MirrorDataService.storeMirrorData(
            { youtube: { summary: youtubeSummary } },
            {}
          );

          setStatus('YouTube connected successfully!');
          toast.success('YouTube connected successfully!');
        }
        
        setTimeout(() => navigate('/mirror'), 2000);
        
      } catch (error) {
        console.error('Error in auth callback:', error);
        setStatus('Connection failed');
        toast.error('Connection failed. Please try again.');
        setTimeout(() => navigate('/mirror'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">{status}</p>
      </div>
    </div>
  );
};

export default AuthCallback;
