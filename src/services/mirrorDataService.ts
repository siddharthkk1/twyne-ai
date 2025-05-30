
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

interface PlatformTokens {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

interface PlatformConnections {
  spotify?: {
    profile: any;
    tokens?: PlatformTokens;
    connected_at: string;
  };
  youtube?: {
    channel: any;
    tokens?: PlatformTokens;
    connected_at: string;
  };
}

export class MirrorDataService {
  static async storeMirrorData(
    synthesizedData: {
      spotify?: SynthesizedSpotifyData;
      youtube?: { summary: string };
    }
  ) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
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
        return;
      }

      // Safely handle profile_data
      const currentProfileData = userData.profile_data && typeof userData.profile_data === 'object' 
        ? userData.profile_data as Record<string, any>
        : {};

      // Update profile_data with synthesized insights
      const updatedProfileData = {
        ...currentProfileData,
        ...(synthesizedData.spotify && { spotify_insights: synthesizedData.spotify }),
        ...(synthesizedData.youtube && { youtube_summary: synthesizedData.youtube.summary })
      };

      // Update user_data with synthesized insights only
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
      }
    } catch (error) {
      console.error('Error in storeMirrorData:', error);
    }
  }

  static async storeConnectionData(platform: 'spotify' | 'youtube', connectionInfo: any) {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: 'Not authenticated' };
      }

      // Get current user data
      let { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: fetchError.message };
      }

      if (!userData) {
        const { data: newUserData, error: createError } = await supabase
          .from('user_data')
          .insert({
            user_id: user.id,
            profile_data: {},
            platform_connections: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          return { success: false, error: createError.message };
        }

        userData = newUserData;
      }

      // Safely parse existing platform connections
      let currentConnections: PlatformConnections = {};
      
      if (userData.platform_connections) {
        try {
          if (typeof userData.platform_connections === 'object' && userData.platform_connections !== null) {
            currentConnections = userData.platform_connections as PlatformConnections;
          }
        } catch (error) {
          currentConnections = {};
        }
      }

      // Prepare the connection data structure - only metadata (profile + tokens)
      let connectionData: any = {
        connected_at: new Date().toISOString()
      };

      // Handle platform-specific data structure
      if (platform === 'spotify') {
        const profile = connectionInfo.profile || connectionInfo;
        
        if (!profile || !profile.id) {
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          return { success: false, error: 'Invalid Spotify profile data' };
        }
        
        connectionData.profile = profile;
        if (connectionInfo.tokens) {
          connectionData.tokens = connectionInfo.tokens;
        }
      } else if (platform === 'youtube') {
        const channel = connectionInfo.channel || connectionInfo;
        
        if (!channel || !channel.id) {
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          return { success: false, error: 'Invalid YouTube channel data' };
        }
        
        connectionData.channel = channel;
        if (connectionInfo.tokens) {
          connectionData.tokens = connectionInfo.tokens;
        }
      }

      // Update connections with new platform data
      const updatedConnections: PlatformConnections = {
        ...currentConnections,
        [platform]: connectionData
      };

      // Perform database update
      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          platform_connections: updatedConnections as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', userData.id);

      if (updateError) {
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async loadConnectionData(): Promise<{
    spotify?: any;
    youtube?: any;
  }> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return this.loadFromLocalStorage();
      }

      // Get user data from database
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('platform_connections')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        return this.loadFromLocalStorage();
      }

      const connectionData: { spotify?: any; youtube?: any } = {};

      // Load from database if available
      if (userData?.platform_connections && typeof userData.platform_connections === 'object') {
        const connections = userData.platform_connections as PlatformConnections;
        
        if (connections.spotify?.profile) {
          const spotifyProfile = connections.spotify.profile;
          if (spotifyProfile.id && spotifyProfile.display_name) {
            connectionData.spotify = {
              profile: spotifyProfile,
              tokens: connections.spotify.tokens
            };
          }
        }
        
        if (connections.youtube?.channel) {
          const youtubeChannel = connections.youtube.channel;
          if (youtubeChannel.id && youtubeChannel.snippet) {
            connectionData.youtube = {
              channel: youtubeChannel,
              tokens: connections.youtube.tokens
            };
          }
        }
      }

      // Fallback to localStorage if database data is incomplete
      const localStorageData = this.loadFromLocalStorage();
      
      return {
        spotify: connectionData.spotify || localStorageData.spotify,
        youtube: connectionData.youtube || localStorageData.youtube
      };
    } catch (error) {
      return this.loadFromLocalStorage();
    }
  }

  static async removeConnectionData(platform: 'spotify' | 'youtube') {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        localStorage.removeItem(`${platform}_data`);
        localStorage.removeItem(`${platform}_profile`);
        localStorage.removeItem(`${platform}_access_token`);
        localStorage.removeItem(`${platform}_refresh_token`);
        return { success: true };
      }

      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        localStorage.removeItem(`${platform}_data`);
        localStorage.removeItem(`${platform}_profile`);
        localStorage.removeItem(`${platform}_access_token`);
        localStorage.removeItem(`${platform}_refresh_token`);
        return { success: false, error: fetchError.message };
      }

      if (!userData) {
        localStorage.removeItem(`${platform}_data`);
        localStorage.removeItem(`${platform}_profile`);
        localStorage.removeItem(`${platform}_access_token`);
        localStorage.removeItem(`${platform}_refresh_token`);
        return { success: true };
      }

      // Get current platform connections
      const currentConnections = userData.platform_connections && typeof userData.platform_connections === 'object'
        ? userData.platform_connections as PlatformConnections
        : {};

      // Remove the specific platform
      const updatedConnections = { ...currentConnections };
      delete updatedConnections[platform];

      // Also remove from profile_data
      const currentProfileData = userData.profile_data && typeof userData.profile_data === 'object'
        ? userData.profile_data as Record<string, any>
        : {};
      
      const updatedProfileData = { ...currentProfileData };
      if (platform === 'spotify') {
        delete updatedProfileData.spotify_insights;
      } else if (platform === 'youtube') {
        delete updatedProfileData.youtube_summary;
      }

      // Update the database
      const { error: updateError } = await supabase
        .from('user_data')
        .update({
          platform_connections: updatedConnections as any,
          profile_data: updatedProfileData as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', userData.id);

      if (updateError) {
        localStorage.removeItem(`${platform}_data`);
        localStorage.removeItem(`${platform}_profile`);
        localStorage.removeItem(`${platform}_access_token`);
        localStorage.removeItem(`${platform}_refresh_token`);
        return { success: false, error: updateError.message };
      }

      // Also remove from localStorage
      localStorage.removeItem(`${platform}_data`);
      localStorage.removeItem(`${platform}_profile`);
      localStorage.removeItem(`${platform}_access_token`);
      localStorage.removeItem(`${platform}_refresh_token`);
      
      return { success: true };
    } catch (error) {
      localStorage.removeItem(`${platform}_data`);
      localStorage.removeItem(`${platform}_profile`);
      localStorage.removeItem(`${platform}_access_token`);
      localStorage.removeItem(`${platform}_refresh_token`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private static loadFromLocalStorage(): { spotify?: any; youtube?: any } {
    const connectionData: { spotify?: any; youtube?: any } = {};
    
    try {
      const localYouTubeData = localStorage.getItem('youtube_data');
      
      if (localYouTubeData) {
        try {
          const parsedYouTubeData = JSON.parse(localYouTubeData);
          connectionData.youtube = parsedYouTubeData;
        } catch (error) {
          console.error('Error parsing YouTube data from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    return connectionData;
  }
}
