
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

// Retry utility function
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Operation failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
};

// Enhanced auth validation
const validateAuth = async (): Promise<{ user: any; error?: any }> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('MirrorDataService: Auth validation failed:', authError);
      return { user: null, error: authError || 'No authenticated user' };
    }
    
    return { user };
  } catch (error) {
    console.error('MirrorDataService: Auth validation exception:', error);
    return { user: null, error };
  }
};

export class MirrorDataService {
  static async storeMirrorData(
    synthesizedData: {
      spotify?: SynthesizedSpotifyData;
      youtube?: { summary: string };
    }
  ) {
    return retryOperation(async () => {
      const { user, error: authError } = await validateAuth();
      if (authError || !user) {
        console.warn('MirrorDataService: No authenticated user for storeMirrorData');
        return { success: false, error: 'Authentication required' };
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
        console.error('MirrorDataService: Error fetching user data:', fetchError);
        throw fetchError;
      }

      if (!userData) {
        console.warn('MirrorDataService: No user data found for storeMirrorData');
        return { success: false, error: 'User data not found' };
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
        console.error('MirrorDataService: Error storing mirror data:', updateError);
        throw updateError;
      }
      
      return { success: true };
    });
  }

  static async storeConnectionData(platform: 'spotify' | 'youtube', connectionInfo: any) {
    return retryOperation(async () => {
      const { user, error: authError } = await validateAuth();
      if (authError || !user) {
        console.warn(`MirrorDataService: No authenticated user for ${platform} connection`);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: 'Authentication required' };
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
        console.error('MirrorDataService: Error fetching user data for connection:', fetchError);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        throw fetchError;
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
          console.error('MirrorDataService: Error creating user data:', createError);
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          throw createError;
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
          console.warn('MirrorDataService: Invalid platform connections data, resetting');
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
          const error = 'Invalid Spotify profile data';
          console.error('MirrorDataService:', error);
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          throw new Error(error);
        }
        
        connectionData.profile = profile;
        if (connectionInfo.tokens) {
          connectionData.tokens = connectionInfo.tokens;
        }
      } else if (platform === 'youtube') {
        const channel = connectionInfo.channel || connectionInfo;
        
        if (!channel || !channel.id) {
          const error = 'Invalid YouTube channel data';
          console.error('MirrorDataService:', error);
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          throw new Error(error);
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
        console.error('MirrorDataService: Error updating platform connections:', updateError);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        throw updateError;
      }

      return { success: true };
    });
  }

  static async loadConnectionData(): Promise<{
    spotify?: any;
    youtube?: any;
  }> {
    try {
      const { user, error: authError } = await validateAuth();
      if (authError || !user) {
        console.warn('MirrorDataService: No authenticated user for loadConnectionData');
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
        console.error('MirrorDataService: Error loading connection data:', fetchError);
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
      console.error('MirrorDataService: Exception in loadConnectionData:', error);
      return this.loadFromLocalStorage();
    }
  }

  static async removeConnectionData(platform: 'spotify' | 'youtube') {
    return retryOperation(async () => {
      const { user, error: authError } = await validateAuth();
      if (authError || !user) {
        console.warn(`MirrorDataService: No authenticated user for removing ${platform} connection`);
        this.clearLocalStorageForPlatform(platform);
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
        console.error('MirrorDataService: Error fetching user data for removal:', fetchError);
        this.clearLocalStorageForPlatform(platform);
        throw fetchError;
      }

      if (!userData) {
        console.warn('MirrorDataService: No user data found for removal');
        this.clearLocalStorageForPlatform(platform);
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
        console.error('MirrorDataService: Error removing platform connection:', updateError);
        this.clearLocalStorageForPlatform(platform);
        throw updateError;
      }

      // Also remove from localStorage
      this.clearLocalStorageForPlatform(platform);
      
      return { success: true };
    });
  }

  private static clearLocalStorageForPlatform(platform: 'spotify' | 'youtube') {
    const keys = [
      `${platform}_data`,
      `${platform}_profile`,
      `${platform}_access_token`,
      `${platform}_refresh_token`
    ];
    
    if (platform === 'spotify') {
      keys.push('spotify_raw_data');
    } else if (platform === 'youtube') {
      keys.push('youtube_channel', 'google_access_token', 'google_refresh_token');
    }
    
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
      }
    });
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
