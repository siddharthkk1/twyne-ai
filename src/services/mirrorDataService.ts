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

interface SynthesizedYouTubeData {
  topVideos: Array<{
    rank: number;
    title: string;
    channelTitle: string;
    imageUrl: string;
  }>;
  topChannels: Array<{
    rank: number;
    name: string;
    imageUrl: string;
  }>;
  topCategories: string[];
  summary: string;
}

export class MirrorDataService {
  static async storeMirrorData(
    synthesizedData: {
      spotify?: SynthesizedSpotifyData;
      youtube?: SynthesizedYouTubeData;
    },
    rawData: {
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

      // Prepare raw data storage
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

      // Store raw YouTube data if provided
      if (rawData.youtube) {
        rawDataToStore.youtube = rawData.youtube;
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

      // Get user's stored platform data
      const { data: userData } = await supabase
        .from('user_data')
        .select('raw_platform_data, profile_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!userData) {
        console.log('No user data found');
        return {};
      }

      const connectionData: { spotify?: any; youtube?: any } = {};

      // Load raw platform data if available
      if (userData.raw_platform_data && typeof userData.raw_platform_data === 'object') {
        const rawData = userData.raw_platform_data as Record<string, any>;
        
        if (rawData.spotify) {
          connectionData.spotify = rawData.spotify;
          console.log('Loaded Spotify connection data from database');
        }
        
        if (rawData.youtube) {
          connectionData.youtube = rawData.youtube;
          console.log('Loaded YouTube connection data from database');
        }
      }

      // Also check localStorage as fallback and sync it to database if found
      const localSpotifyData = localStorage.getItem('spotify_data');
      const localYouTubeData = localStorage.getItem('youtube_data');
      
      if (localSpotifyData && !connectionData.spotify) {
        try {
          connectionData.spotify = JSON.parse(localSpotifyData);
          console.log('Found Spotify data in localStorage, will sync to database');
        } catch (error) {
          console.error('Error parsing Spotify data from localStorage:', error);
        }
      }
      
      if (localYouTubeData && !connectionData.youtube) {
        try {
          connectionData.youtube = JSON.parse(localYouTubeData);
          console.log('Found YouTube data in localStorage, will sync to database');
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
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('User not authenticated');
        // Still store in localStorage for anonymous users
        localStorage.setItem(`${platform}_data`, JSON.stringify(data));
        return;
      }

      // Store in localStorage for immediate access
      localStorage.setItem(`${platform}_data`, JSON.stringify(data));

      // Get current user data
      const { data: userData } = await supabase
        .from('user_data')
        .select('raw_platform_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!userData) {
        console.error('No user data found');
        return;
      }

      // Update raw_platform_data
      const currentRawData = userData.raw_platform_data && typeof userData.raw_platform_data === 'object'
        ? userData.raw_platform_data as Record<string, any>
        : {};

      const updatedRawData = {
        ...currentRawData,
        [platform]: data
      };

      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          raw_platform_data: updatedRawData as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error(`Error storing ${platform} connection data:`, updateError);
        return;
      }

      console.log(`${platform} connection data stored successfully`);
    } catch (error) {
      console.error(`Error storing ${platform} connection data:`, error);
    }
  }
}
