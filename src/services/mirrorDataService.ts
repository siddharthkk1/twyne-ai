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

interface PlatformConnections {
  spotify?: {
    profile: any;
    connected_at: string;
  };
  youtube?: {
    channel: any;
    connected_at: string;
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

  static async storeConnectionData(platform: 'spotify' | 'youtube', connectionInfo: any) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, storing in localStorage only');
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return;
      }

      console.log(`Storing ${platform} connection data:`, connectionInfo);

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

      // Get current platform connections
      const currentConnections = userData.platform_connections && typeof userData.platform_connections === 'object'
        ? userData.platform_connections as PlatformConnections
        : {};

      console.log('Current connections before update:', currentConnections);

      // Update connections with new platform data - fix the data structure issue
      const updatedConnections: PlatformConnections = {
        ...currentConnections,
        [platform]: {
          profile: platform === 'spotify' ? connectionInfo.profile : undefined,
          channel: platform === 'youtube' ? connectionInfo.channel : undefined,
          connected_at: new Date().toISOString()
        }
      };

      // Remove undefined properties to keep the data clean
      if (platform === 'spotify') {
        delete (updatedConnections[platform] as any).channel;
      } else if (platform === 'youtube') {
        delete (updatedConnections[platform] as any).profile;
      }

      console.log('Updated connections to store:', updatedConnections);

      // Update the database
      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          platform_connections: updatedConnections as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', userData.id);

      if (updateError) {
        console.error(`Error storing ${platform} connection data:`, updateError);
        return;
      }

      console.log(`${platform} connection data stored successfully in database`);

      // Also store in localStorage for immediate access
      localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
    } catch (error) {
      console.error(`Error storing ${platform} connection data:`, error);
    }
  }

  static async loadConnectionData(): Promise<{
    spotify?: any;
    youtube?: any;
  }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, loading from localStorage only');
        return this.loadFromLocalStorage();
      }

      // Get user data from database
      const { data: userData } = await supabase
        .from('user_data')
        .select('platform_connections')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      console.log('Raw user data from database:', userData);

      const connectionData: { spotify?: any; youtube?: any } = {};

      // Load from database if available
      if (userData?.platform_connections && typeof userData.platform_connections === 'object') {
        const connections = userData.platform_connections as PlatformConnections;
        console.log('Parsed platform connections:', connections);
        
        if (connections.spotify?.profile) {
          connectionData.spotify = { profile: connections.spotify.profile };
          console.log('Loaded Spotify connection from database:', connectionData.spotify);
        }
        
        if (connections.youtube?.channel) {
          connectionData.youtube = { channel: connections.youtube.channel };
          console.log('Loaded YouTube connection from database:', connectionData.youtube);
        }
      }

      // Fallback to localStorage if nothing in database
      if (!connectionData.spotify && !connectionData.youtube) {
        console.log('No database connections found, falling back to localStorage');
        return this.loadFromLocalStorage();
      }

      // Also check localStorage and merge if needed for immediate access
      const localStorageData = this.loadFromLocalStorage();
      console.log('Local storage data:', localStorageData);
      
      return {
        spotify: connectionData.spotify || localStorageData.spotify,
        youtube: connectionData.youtube || localStorageData.youtube
      };
    } catch (error) {
      console.error('Error loading connection data from database:', error);
      return this.loadFromLocalStorage();
    }
  }

  static async removeConnectionData(platform: 'spotify' | 'youtube') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, removing from localStorage only');
        localStorage.removeItem(`${platform}_data`);
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

      // Get current platform connections
      const currentConnections = userData.platform_connections && typeof userData.platform_connections === 'object'
        ? userData.platform_connections as PlatformConnections
        : {};

      // Remove the specific platform
      const updatedConnections = { ...currentConnections };
      delete updatedConnections[platform];

      // Update the database
      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          platform_connections: updatedConnections as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', userData.id);

      if (updateError) {
        console.error(`Error removing ${platform} connection data:`, updateError);
        return;
      }

      console.log(`${platform} connection data removed successfully`);

      // Also remove from localStorage
      localStorage.removeItem(`${platform}_data`);
    } catch (error) {
      console.error(`Error removing ${platform} connection data:`, error);
    }
  }

  private static loadFromLocalStorage(): { spotify?: any; youtube?: any } {
    const connectionData: { spotify?: any; youtube?: any } = {};
    
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
  }
}
