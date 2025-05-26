
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, TrendingUp, Heart, Disc, User } from 'lucide-react';

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
  topAlbums: Array<{
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

  if (!spotifyData) {
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

  // Ensure data arrays exist and are arrays
  const safeTracks = Array.isArray(spotifyData.topTracks) ? spotifyData.topTracks : [];
  const safeArtists = Array.isArray(spotifyData.topArtists) ? spotifyData.topArtists : [];
  const safeGenres = Array.isArray(spotifyData.topGenres) ? spotifyData.topGenres : [];
  const safeAlbums = Array.isArray(spotifyData.topAlbums) ? spotifyData.topAlbums : [];

  // Calculate average audio features
  const tracksWithFeatures = safeTracks.filter(track => track.audio_features);
  const avgFeatures = tracksWithFeatures.length > 0 ? {
    danceability: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.danceability || 0), 0) / tracksWithFeatures.length * 100),
    energy: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.energy || 0), 0) / tracksWithFeatures.length * 100),
    valence: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.valence || 0), 0) / tracksWithFeatures.length * 100),
    tempo: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.tempo || 0), 0) / tracksWithFeatures.length),
    acousticness: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.acousticness || 0), 0) / tracksWithFeatures.length * 100),
    instrumentalness: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.instrumentalness || 0), 0) / tracksWithFeatures.length * 100)
  } : null;

  // Generate vibe summary based on audio features
  const generateVibeSummary = () => {
    if (!avgFeatures) return "Your music taste reflects a unique personality that loves discovering new sounds.";
    
    const { valence, energy, acousticness, danceability } = avgFeatures;
    
    if (valence > 70 && energy > 70) {
      return "You're into upbeat, high-energy tracks that radiate positivity. Your playlist is the soundtrack to good vibes and celebration.";
    } else if (valence < 40 && acousticness > 60) {
      return "You're drawn to soulful, introspective tracks with emotional depth. Your taste reflects a thoughtful, contemplative inner world.";
    } else if (danceability > 70) {
      return "You love rhythmic, groove-heavy music that gets you moving. Whether it's electronic beats or funky basslines, you're all about the rhythm.";
    } else if (acousticness > 70) {
      return "You appreciate organic, acoustic sounds with raw authenticity. Your taste leans toward intimate, unplugged performances.";
    } else {
      return "You have an eclectic taste that balances different moods and styles. Your music reflects a complex, multifaceted personality.";
    }
  };

  // Store synthesized data when component mounts with data
  useEffect(() => {
    if (spotifyData && !isDataStored) {
      const synthesizedData = {
        topArtists: safeArtists.slice(0, 5),
        topTracks: safeTracks.slice(0, 5),
        topGenres: safeGenres.slice(0, 5),
        topAlbums: safeAlbums.slice(0, 5),
        audioFeatures: avgFeatures,
        vibeSummary: generateVibeSummary()
      };

      // Get raw Spotify data from localStorage
      const rawSpotifyData = localStorage.getItem('spotify_data');
      const parsedRawData = rawSpotifyData ? JSON.parse(rawSpotifyData) : null;

      // Store both synthesized and raw data
      import('../../services/mirrorDataService').then(({ MirrorDataService }) => {
        MirrorDataService.storeMirrorData(
          { spotify: synthesizedData },
          { spotify: parsedRawData }
        );
      });

      setIsDataStored(true);
    }
  }, [spotifyData, isDataStored, avgFeatures]);

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
          <p className="text-sm text-muted-foreground">{generateVibeSummary()}</p>
        </div>

        {/* Audio Features */}
        {avgFeatures && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Audio Profile
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span>🎭 Positivity:</span>
                <span>{avgFeatures.valence}%</span>
              </div>
              <div className="flex justify-between">
                <span>⚡️ Energy:</span>
                <span>{avgFeatures.energy}%</span>
              </div>
              <div className="flex justify-between">
                <span>🕺 Danceability:</span>
                <span>{avgFeatures.danceability}%</span>
              </div>
              <div className="flex justify-between">
                <span>🎚 Tempo:</span>
                <span>{avgFeatures.tempo} BPM</span>
              </div>
              <div className="flex justify-between">
                <span>🌿 Acoustic:</span>
                <span>{avgFeatures.acousticness}%</span>
              </div>
              <div className="flex justify-between">
                <span>🎹 Instrumental:</span>
                <span>{avgFeatures.instrumentalness}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Basic Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span>Top Artists:</span>
            <span>{safeArtists.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Top Tracks:</span>
            <span>{safeTracks.length}</span>
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
      </CardContent>
    </Card>
  );
};

export default SpotifyDataCard;
