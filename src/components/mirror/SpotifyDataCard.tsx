
import React from 'react';
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
  if (!data) {
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

  // Calculate average audio features
  const tracksWithFeatures = data.topTracks.filter(track => track.audio_features);
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

        {/* Top Artists */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Top Artists
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {data.topArtists.slice(0, 5).map((artist, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                {artist.images[0] ? (
                  <img 
                    src={artist.images[0].url} 
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{artist.name}</p>
                  {artist.genres.length > 0 && (
                    <p className="text-xs text-muted-foreground">{artist.genres.slice(0, 2).join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Songs */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Music className="h-4 w-4" />
            Top Songs
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {data.topTracks.slice(0, 5).map((track, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                {track.album.images[0] ? (
                  <img 
                    src={track.album.images[0].url} 
                    alt={track.album.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <Music className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{track.name}</p>
                  <p className="text-xs text-muted-foreground">{track.artists[0]?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Genres */}
        <div>
          <h3 className="font-medium mb-3">Top Genres</h3>
          <div className="flex flex-wrap gap-2">
            {data.topGenres.slice(0, 5).map((genre, index) => (
              <Badge key={index} variant="outline" className="bg-secondary/5 text-secondary">
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        {/* Top Albums */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Disc className="h-4 w-4" />
            Top Albums
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {data.topAlbums.slice(0, 5).map((album, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                {album.images[0] ? (
                  <img 
                    src={album.images[0].url} 
                    alt={album.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <Disc className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{album.name}</p>
                  <p className="text-xs text-muted-foreground">{album.artists[0]?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotifyDataCard;
