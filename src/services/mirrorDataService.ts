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
      console.log(`=== STORING ${platform.toUpperCase()} CONNECTION DATA ===`);
      console.log('Raw connection info received:', JSON.stringify(connectionInfo, null, 2));

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, storing in localStorage only');
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return;
      }

      console.log('User authenticated:', user.id);

      // Get current user data
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return;
      }

      if (!userData) {
        console.error('No user data found for user:', user.id);
        return;
      }

      console.log('Current user data found:', userData.id);

      // Get current platform connections
      const currentConnections = userData.platform_connections && typeof userData.platform_connections === 'object'
        ? userData.platform_connections as PlatformConnections
        : {};

      console.log('Current connections before update:', JSON.stringify(currentConnections, null, 2));

      // Prepare the connection data structure
      let connectionData: any = {
        connected_at: new Date().toISOString()
      };

      // Handle platform-specific data structure
      if (platform === 'spotify') {
        // Extract profile from connectionInfo - it could be at connectionInfo.profile or just connectionInfo
        const profile = connectionInfo.profile || connectionInfo;
        console.log('Extracted Spotify profile:', JSON.stringify(profile, null, 2));
        connectionData.profile = profile;
      } else if (platform === 'youtube') {
        // Extract channel from connectionInfo
        const channel = connectionInfo.channel || connectionInfo;
        console.log('Extracted YouTube channel:', JSON.stringify(channel, null, 2));
        connectionData.channel = channel;
      }

      // Update connections with new platform data
      const updatedConnections: PlatformConnections = {
        ...currentConnections,
        [platform]: connectionData
      };

      console.log('Updated connections to store:', JSON.stringify(updatedConnections, null, 2));

      // Update the database
      const { error: updateError, data: updateResult } = await supabase
        .from('user_data')
        .update({
          platform_connections: updatedConnections as any,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('id', userData.id)
        .select();

      if (updateError) {
        console.error(`Error storing ${platform} connection data:`, updateError);
        return;
      }

      console.log(`${platform} connection data stored successfully in database`);
      console.log('Update result:', updateResult);

      // Verify the data was stored correctly
      const { data: verifyData } = await supabase
        .from('user_data')
        .select('platform_connections')
        .eq('user_id', user.id)
        .eq('id', userData.id)
        .single();

      console.log('Verification - data in database:', JSON.stringify(verifyData, null, 2));

      // Also store in localStorage for immediate access
      localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
      console.log(`${platform} data also stored in localStorage`);
    } catch (error) {
      console.error(`Error storing ${platform} connection data:`, error);
    }
  }

  static async loadConnectionData(): Promise<{
    spotify?: any;
    youtube?: any;
  }> {
    try {
      console.log('=== LOADING CONNECTION DATA ===');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, loading from localStorage only');
        return this.loadFromLocalStorage();
      }

      console.log('User authenticated, loading from database for user:', user.id);

      // Get user data from database
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('platform_connections')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        return this.loadFromLocalStorage();
      }

      console.log('Raw user data from database:', JSON.stringify(userData, null, 2));

      const connectionData: { spotify?: any; youtube?: any } = {};

      // Load from database if available
      if (userData?.platform_connections && typeof userData.platform_connections === 'object') {
        const connections = userData.platform_connections as PlatformConnections;
        console.log('Parsed platform connections:', JSON.stringify(connections, null, 2));
        
        if (connections.spotify?.profile) {
          connectionData.spotify = { profile: connections.spotify.profile };
          console.log('Loaded Spotify connection from database:', JSON.stringify(connectionData.spotify, null, 2));
        }
        
        if (connections.youtube?.channel) {
          connectionData.youtube = { channel: connections.youtube.channel };
          console.log('Loaded YouTube connection from database:', JSON.stringify(connectionData.youtube, null, 2));
        }
      }

      // Fallback to localStorage if nothing in database
      if (!connectionData.spotify && !connectionData.youtube) {
        console.log('No database connections found, falling back to localStorage');
        return this.loadFromLocalStorage();
      }

      // Also check localStorage and merge if needed for immediate access
      const localStorageData = this.loadFromLocalStorage();
      console.log('Local storage data for comparison:', JSON.stringify(localStorageData, null, 2));
      
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
