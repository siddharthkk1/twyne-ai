
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, TrendingUp, Heart, Disc, User } from 'lucide-react';
import { MirrorDataService } from '@/services/mirrorDataService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(data);
  const [spotifyInsights, setSpotifyInsights] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Load data from MirrorDataService and localStorage
  useEffect(() => {
    const loadSpotifyData = async () => {
      if (!spotifyData) {
        try {
          const connectionData = await MirrorDataService.loadConnectionData();
          
          if (connectionData.spotify) {
            // Prioritize synthesized data from database
            if (connectionData.spotify.synthesizedData) {
              setSpotifyData(connectionData.spotify.synthesizedData);
              return;
            }
            
            // Fallback to direct spotify data
            setSpotifyData(connectionData.spotify);
            return;
          }
        } catch (error) {
          console.error('Error loading from MirrorDataService:', error);
        }
        
        // Fallback to localStorage
        const storedData = localStorage.getItem('spotify_data');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            setSpotifyData(parsed);
          } catch (error) {
            console.error('Error parsing stored Spotify data:', error);
          }
        }
      }
    };

    loadSpotifyData();
  }, [spotifyData]);

  // Load AI insights from profile_data
  useEffect(() => {
    const loadSpotifyInsights = async () => {
      if (!user || spotifyInsights) return;
      
      setIsLoadingInsights(true);
      
      try {
        const { data: userData, error } = await supabase
          .from('user_data')
          .select('profile_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && userData?.profile_data) {
          const profileData = userData.profile_data as any;
          if (profileData.spotify_insights) {
            console.log('Loaded Spotify insights from profile_data:', profileData.spotify_insights);
            setSpotifyInsights(profileData.spotify_insights);
          }
        }
      } catch (error) {
        console.error('Error loading Spotify insights:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadSpotifyInsights();
  }, [user, spotifyInsights]);

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
          {isLoadingInsights ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Loading your music insights...</p>
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
