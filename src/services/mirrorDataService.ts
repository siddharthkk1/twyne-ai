
import { supabase } from "@/integrations/supabase/client";

interface SynthesizedSpotifyData {
  topSongs: Array<{
    rank: number;
    title: string;
    artist: string;
    imageUrl: string;
  }>;
  topArtists: Array<{
    rank: number;
    name: string;
    imageUrl: string;
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
    rawData?: {
      spotify?: any;
      youtube?: any;
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

      // Update user_data with synthesized insights only (no raw data storage)
      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          profile_data: updatedProfileData as any,
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

  static async loadConnectionData(): Promise<{
    spotify?: any;
    youtube?: any;
  }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, cannot load connection data');
        return {};
      }

      const connectionData: { spotify?: any; youtube?: any } = {};

      // Load from localStorage only (no longer storing in database)
      const localSpotifyData = localStorage.getItem('spotify_data');
      const localYouTubeData = localStorage.getItem('youtube_data');
      
      if (localSpotifyData) {
        try {
          connectionData.spotify = JSON.parse(localSpotifyData);
          console.log('Loaded Spotify data from localStorage');
        } catch (error) {
          console.error('Error parsing Spotify data from localStorage:', error);
        }
      }
      
      if (localYouTubeData) {
        try {
          connectionData.youtube = JSON.parse(localYouTubeData);
          console.log('Loaded YouTube data from localStorage');
        } catch (error) {
          console.error('Error parsing YouTube data from localStorage:', error);
        }
      }

      return connectionData;
    } catch (error) {
      console.error('Error loading connection data:', error);
      return {};
    }
  }

  static async storeConnectionData(platform: 'spotify' | 'youtube', data: any) {
    try {
      // Only store in localStorage for immediate access (no database storage)
      localStorage.setItem(`${platform}_data`, JSON.stringify(data));
      console.log(`${platform} connection data stored in localStorage`);
    } catch (error) {
      console.error(`Error storing ${platform} connection data:`, error);
    }
  }
}
