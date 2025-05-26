
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, TrendingUp, Heart, Disc, User } from 'lucide-react';
import { AIProfileService } from '@/services/aiProfileService';

interface SpotifyData {
  topArtists: Array<{
    name: string;
    images: Array<{ url: string }>;
    genres: string[];
  }>;
  topTracks: Array<{
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
    audio_features?: {
      danceability: number;
      energy: number;
      valence: number;
      tempo: number;
      acousticness: number;
      instrumentalness: number;
    };
  }>;
  topGenres: string[];
  topAlbums?: Array<{
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
  }>;
}

interface SpotifyDataCardProps {
  data: SpotifyData | null;
}

const SpotifyDataCard: React.FC<SpotifyDataCardProps> = ({ data }) => {
  const [isDataStored, setIsDataStored] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(data);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [spotifyInsights, setSpotifyInsights] = useState<any>(null);

  // Try to load data from localStorage if not provided
  useEffect(() => {
    if (!spotifyData) {
      const storedData = localStorage.getItem('spotify_data');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          console.log('Loaded Spotify data from localStorage:', parsed);
          setSpotifyData(parsed);
        } catch (error) {
          console.error('Error parsing stored Spotify data:', error);
        }
      }
    }
  }, [spotifyData]);

  // Generate and store Spotify insights when component mounts with data
  useEffect(() => {
    if (spotifyData && !isDataStored && !isGeneratingSummary && !spotifyInsights) {
      setIsGeneratingSummary(true);
      
      // Ensure all required arrays exist and are arrays before processing
      const safeSpotifyData = {
        topTracks: Array.isArray(spotifyData.topTracks) ? spotifyData.topTracks : [],
        topArtists: Array.isArray(spotifyData.topArtists) ? spotifyData.topArtists : [],
        topAlbums: Array.isArray(spotifyData.topAlbums) ? spotifyData.topAlbums : [],
        topGenres: Array.isArray(spotifyData.topGenres) ? spotifyData.topGenres : []
      };

      console.log('Processing Spotify data for AI analysis:', safeSpotifyData);

      // Generate AI insights
      AIProfileService.generateSpotifyProfile(safeSpotifyData)
        .then(insights => {
          console.log('Generated Spotify insights:', insights);
          setSpotifyInsights(insights);
          
          // Get raw Spotify data from localStorage
          const rawSpotifyData = localStorage.getItem('spotify_data');
          const parsedRawData = rawSpotifyData ? JSON.parse(rawSpotifyData) : null;

          // Store both synthesized and raw data
          import('../../services/mirrorDataService').then(({ MirrorDataService }) => {
            MirrorDataService.storeMirrorData(
              { spotify: insights },
              { spotify: parsedRawData }
            );
          });

          setIsDataStored(true);
        })
        .catch(error => {
          console.error('Error generating Spotify insights:', error);
        })
        .finally(() => {
          setIsGeneratingSummary(false);
        });
    }
  }, [spotifyData, isDataStored, isGeneratingSummary, spotifyInsights]);

  if (!spotifyData && !spotifyInsights) {
    return (
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Music Profile
          </CardTitle>
          <CardDescription>Connect your Spotify account to see your music insights</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Use insights if available, otherwise fall back to raw data
  const displayData = spotifyInsights || spotifyData;
  const safeTracks = Array.isArray(displayData.topTracks || displayData.topSongs) ? (displayData.topTracks || displayData.topSongs) : [];
  const safeArtists = Array.isArray(displayData.topArtists) ? displayData.topArtists : [];
  const safeGenres = Array.isArray(displayData.topGenres) ? displayData.topGenres : [];
  const safeAlbums = Array.isArray(displayData.topAlbums) ? displayData.topAlbums : [];

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Music className="h-5 w-5" />
          Spotify Music Profile
        </CardTitle>
        <CardDescription>Your musical personality based on listening habits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Vibe Summary */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Your Music Vibe
          </h3>
          {isGeneratingSummary ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Analyzing your music taste...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {spotifyInsights?.vibeSummary || "Your music taste reflects a unique personality that loves discovering new sounds."}
            </p>
          )}
        </div>

        {/* Trait Display */}
        {spotifyInsights?.traitDisplay && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Audio Profile
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>🎭 Valence:</span>
                <span>{spotifyInsights.traitDisplay.valence}%</span>
              </div>
              <div className="flex justify-between">
                <span>⚡️ Energy:</span>
                <span>{spotifyInsights.traitDisplay.energy}%</span>
              </div>
              <div className="flex justify-between">
                <span>🕺 Danceability:</span>
                <span>{spotifyInsights.traitDisplay.danceability}%</span>
              </div>
              <div className="flex justify-between">
                <span>🎚 Tempo:</span>
                <span>{spotifyInsights.traitDisplay.tempo} BPM</span>
              </div>
              <div className="flex justify-between">
                <span>🌿 Acousticness:</span>
                <span>{spotifyInsights.traitDisplay.acousticness}%</span>
              </div>
              <div className="flex justify-between">
                <span>🎹 Instrumentalness:</span>
                <span>{spotifyInsights.traitDisplay.instrumentalness}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Top Songs */}
        {safeTracks.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Disc className="h-4 w-4" />
              Top Songs
            </h3>
            <div className="space-y-2">
              {safeTracks.slice(0, 5).map((track, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  {track.album?.images?.[0]?.url && (
                    <img
                      src={track.album.images[0].url}
                      alt={track.album.name}
                      className="w-10 h-10 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{track.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {Array.isArray(track.artists) ? track.artists.map(a => a.name).join(', ') : 'Unknown Artist'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Artists */}
        {safeArtists.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Top Artists
            </h3>
            <div className="space-y-2">
              {safeArtists.slice(0, 5).map((artist, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  {artist.images?.[0]?.url && (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{artist.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Genres */}
        {safeGenres.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Top Genres</h3>
            <div className="flex flex-wrap gap-2">
              {safeGenres.slice(0, 5).map((genre, index) => (
                <Badge key={index} variant="outline" className="bg-secondary/5 text-secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
          <div className="flex justify-between">
            <span>Songs:</span>
            <span>{safeTracks.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Artists:</span>
            <span>{safeArtists.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Genres:</span>
            <span>{safeGenres.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Albums:</span>
            <span>{safeAlbums.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotifyDataCard;
