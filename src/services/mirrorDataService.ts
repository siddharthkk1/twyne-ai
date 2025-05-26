
import { supabase } from "@/integrations/supabase/client";

interface SynthesizedSpotifyData {
  topSongs: Array<{
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
  }>;
  topArtists: Array<{
    name: string;
    images: Array<{ url: string }>;
  }>;
  topAlbums: Array<{
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
  }>;
  topGenres: string[];
  vibeSummary: string;
  traitDisplay: {
    valence: number;
    energy: number;
    danceability: number;
    tempo: number;
    acousticness: number;
    instrumentalness: number;
  };
}

export class MirrorDataService {
  static async storeMirrorData(
    synthesizedData: {
      spotify?: SynthesizedSpotifyData;
      youtube?: { summary: string };
    },
    rawData: {
      spotify?: any;
    }
  ) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('User not authenticated');
        return;
      }

      // Get current user data
      const { data: userData } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!userData) {
        console.error('No user data found');
        return;
      }

      // Safely handle profile_data - ensure it's an object
      const currentProfileData = userData.profile_data && typeof userData.profile_data === 'object' 
        ? userData.profile_data as Record<string, any>
        : {};

      // Update profile_data with synthesized insights
      const updatedProfileData = {
        ...currentProfileData,
        ...(synthesizedData.spotify && { spotify_insights: synthesizedData.spotify }),
        ...(synthesizedData.youtube && { youtube_summary: synthesizedData.youtube.summary })
      };

      // Prepare raw data storage (only Spotify data)
      const rawDataToStore: any = {};
      
      // Store raw Spotify data if not too large (limit to ~1MB)
      if (rawData.spotify) {
        const spotifySize = JSON.stringify(rawData.spotify).length;
        if (spotifySize < 1000000) { // 1MB limit
          rawDataToStore.spotify = rawData.spotify;
        } else {
          console.warn('Spotify data too large, storing summary only');
          rawDataToStore.spotify = {
            profile: rawData.spotify.profile,
            topTracks: rawData.spotify.topTracks?.short_term?.slice(0, 50),
            topArtists: rawData.spotify.topArtists?.short_term?.slice(0, 50),
            summary: 'Full data truncated due to size'
          };
        }
      }

      // Update user_data with both synthesized insights and raw data
      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          profile_data: updatedProfileData as any,
          raw_platform_data: rawDataToStore as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error storing mirror data:', updateError);
        return;
      }

      console.log('Mirror data stored successfully');
    } catch (error) {
      console.error('Error in storeMirrorData:', error);
    }
  }
}
