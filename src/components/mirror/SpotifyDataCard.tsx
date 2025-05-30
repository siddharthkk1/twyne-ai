
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, TrendingUp, Heart, Disc, User } from 'lucide-react';
import { AIProfileService } from '@/services/aiProfileService';
import { MirrorDataService } from '@/services/mirrorDataService';

interface SimplifiedTrack {
  rank: number;
  title: string;
  artist: string;
  imageUrl: string;
}

interface SimplifiedArtist {
  rank: number;
  name: string;
  imageUrl: string;
}

interface SpotifyData {
  topArtists: SimplifiedArtist[];
  topTracks: SimplifiedTrack[];
  topGenres: string[];
  topAlbums?: Array<{
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
  }>;
  // For backwards compatibility and AI processing
  fullTopTracks?: Array<{
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
  }>;
  fullTopArtists?: Array<{
    name: string;
    images: Array<{ url: string }>;
    genres: string[];
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

  // Load data from MirrorDataService and localStorage
  useEffect(() => {
    const loadSpotifyData = async () => {
      if (!spotifyData) {
        console.log('🔄 Loading Spotify data for SpotifyDataCard...');
        
        try {
          // First try to load from MirrorDataService
          const connectionData = await MirrorDataService.loadConnectionData();
          
          if (connectionData.spotify) {
            console.log('✅ Loaded Spotify data from MirrorDataService for card');
            setSpotifyData(connectionData.spotify);
            return;
          }
        } catch (error) {
          console.error('❌ Error loading from MirrorDataService:', error);
        }
        
        // Fallback to localStorage
        const storedData = localStorage.getItem('spotify_data');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            console.log('✅ Loaded Spotify data from localStorage for card:', parsed);
            setSpotifyData(parsed);
          } catch (error) {
            console.error('❌ Error parsing stored Spotify data:', error);
          }
        }
      }
    };

    loadSpotifyData();
  }, [spotifyData]);

  // Generate and store Spotify insights when component mounts with data
  useEffect(() => {
    if (spotifyData && !isDataStored && !isGeneratingSummary && !spotifyInsights) {
      setIsGeneratingSummary(true);
      
      // Use full data if available, otherwise convert simplified data for AI analysis
      const dataForAI = spotifyData.fullTopTracks && spotifyData.fullTopArtists ? {
        topTracks: spotifyData.fullTopTracks,
        topArtists: spotifyData.fullTopArtists,
        topAlbums: Array.isArray(spotifyData.topAlbums) ? spotifyData.topAlbums : [],
        topGenres: Array.isArray(spotifyData.topGenres) ? spotifyData.topGenres : []
      } : {
        topTracks: Array.isArray(spotifyData.topTracks) ? spotifyData.topTracks.map(track => ({
          name: track.title,
          artists: [{ name: track.artist }],
          album: { name: '', images: [{ url: track.imageUrl }] }
        })) : [],
        topArtists: Array.isArray(spotifyData.topArtists) ? spotifyData.topArtists.map(artist => ({
          name: artist.name,
          images: [{ url: artist.imageUrl }],
          genres: []
        })) : [],
        topAlbums: Array.isArray(spotifyData.topAlbums) ? spotifyData.topAlbums : [],
        topGenres: Array.isArray(spotifyData.topGenres) ? spotifyData.topGenres : []
      };

      console.log('Processing Spotify data for AI analysis:', dataForAI);

      // Generate AI insights
      AIProfileService.generateSpotifyProfile(dataForAI)
        .then(insights => {
          console.log('Generated Spotify insights:', insights);
          
          // Convert the insights to match our display format
          const synthesizedInsights = {
            topSongs: Array.isArray(spotifyData.topTracks) ? spotifyData.topTracks.slice(0, 5) : [],
            topArtists: Array.isArray(spotifyData.topArtists) ? spotifyData.topArtists.slice(0, 5) : [],
            topGenres: Array.isArray(spotifyData.topGenres) ? spotifyData.topGenres.slice(0, 5) : [],
            topAlbums: Array.isArray(spotifyData.topAlbums) ? spotifyData.topAlbums.slice(0, 5) : [],
            vibeSummary: insights.vibeSummary,
            traitDisplay: insights.traitDisplay
          };
          
          setSpotifyInsights(synthesizedInsights);
          setIsDataStored(true);
        })
        .catch(error => {
          console.error('Error generating Spotify insights:', error);
          // Set fallback insights
          setSpotifyInsights({
            vibeSummary: "Your music taste reflects a unique personality that loves discovering new sounds.",
            traitDisplay: {
              valence: 50,
              energy: 50,
              danceability: 50,
              tempo: 120,
              acousticness: 30,
              instrumentalness: 10
            }
          });
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

  // Use the current data for displaying lists
  const displayData = spotifyData;
  const safeTracks = Array.isArray(displayData?.topTracks) ? displayData.topTracks : [];
  const safeArtists = Array.isArray(displayData?.topArtists) ? displayData.topArtists : [];
  const safeGenres = Array.isArray(displayData?.topGenres) ? displayData.topGenres : [];

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

        {/* Two-column layout for Top Artists and Top Songs */}
        {(safeArtists.length > 0 || safeTracks.length > 0) && (
          <div className="grid grid-cols-2 gap-6">
            {/* Top Artists - Left Column */}
            {safeArtists.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Top Artists
                </h3>
                <div className="space-y-2">
                  {safeArtists.slice(0, 5).map((artist, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium text-primary">
                        {artist.rank || (index + 1)}
                      </div>
                      {artist.imageUrl && (
                        <img
                          src={artist.imageUrl}
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

            {/* Top Songs - Right Column */}
            {safeTracks.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Disc className="h-4 w-4" />
                  Top Songs
                </h3>
                <div className="space-y-2">
                  {safeTracks.slice(0, 5).map((track, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium text-primary">
                        {track.rank || (index + 1)}
                      </div>
                      {track.imageUrl && (
                        <img
                          src={track.imageUrl}
                          alt={track.title}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{track.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Genres */}
        {safeGenres.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Top Genres</h3>
            <div className="flex flex-wrap gap-2">
              {safeGenres.slice(0, 8).map((genre, index) => (
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
