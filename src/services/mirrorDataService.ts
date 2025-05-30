
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
        console.error('Authentication error:', authError);
        console.log('User not authenticated, storing in localStorage only');
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: 'Not authenticated' };
      }

      console.log('User authenticated:', user.id);

      // Get current user data with robust error handling
      let { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user data:', fetchError);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: fetchError.message };
      }

      if (!userData) {
        console.log('No user data found, creating new entry...');
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
          console.error('Error creating user data:', createError);
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          return { success: false, error: createError.message };
        }

        userData = newUserData;
      }

      console.log('Current user data found:', userData.id);

      // Safely parse existing platform connections
      let currentConnections: PlatformConnections = {};
      
      if (userData.platform_connections) {
        try {
          if (typeof userData.platform_connections === 'object' && userData.platform_connections !== null) {
            currentConnections = userData.platform_connections as PlatformConnections;
          }
        } catch (error) {
          console.warn('Error parsing platform_connections, resetting:', error);
          currentConnections = {};
        }
      }

      console.log('Current connections before update:', JSON.stringify(currentConnections, null, 2));

      // Prepare the connection data structure with proper validation
      let connectionData: any = {
        connected_at: new Date().toISOString()
      };

      // Handle platform-specific data structure and validate required fields
      if (platform === 'spotify') {
        const profile = connectionInfo.profile || connectionInfo;
        
        // Validate required Spotify profile fields
        if (!profile || !profile.id) {
          console.error('Invalid Spotify profile data - missing required fields');
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          return { success: false, error: 'Invalid Spotify profile data' };
        }
        
        console.log('Extracted Spotify profile for storage:', JSON.stringify(profile, null, 2));
        connectionData.profile = profile;
      } else if (platform === 'youtube') {
        const channel = connectionInfo.channel || connectionInfo;
        
        // Validate required YouTube channel fields
        if (!channel || !channel.id) {
          console.error('Invalid YouTube channel data - missing required fields');
          localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
          return { success: false, error: 'Invalid YouTube channel data' };
        }
        
        console.log('Extracted YouTube channel for storage:', JSON.stringify(channel, null, 2));
        connectionData.channel = channel;
      }

      // Update connections with new platform data
      const updatedConnections: PlatformConnections = {
        ...currentConnections,
        [platform]: connectionData
      };

      console.log('Updated connections to store:', JSON.stringify(updatedConnections, null, 2));

      // Perform database update with enhanced error handling
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
        console.error('Database update failed:', updateError);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: updateError.message };
      }

      console.log('Database update successful:', updateResult);

      // Verify the data was stored correctly
      const { data: verifyData, error: verifyError } = await supabase
        .from('user_data')
        .select('platform_connections')
        .eq('user_id', user.id)
        .eq('id', userData.id)
        .single();

      if (verifyError) {
        console.error('Verification query failed:', verifyError);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: 'Data verification failed' };
      }

      console.log('Verification - data in database:', JSON.stringify(verifyData, null, 2));

      // Check if our data is actually there
      const storedConnections = verifyData.platform_connections as PlatformConnections;
      if (storedConnections && storedConnections[platform]) {
        console.log(`✅ ${platform} connection data verified in database`);
        
        // Store in localStorage for immediate access
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        console.log(`${platform} data also stored in localStorage for immediate access`);
        
        return { success: true };
      } else {
        console.error(`❌ ${platform} connection data NOT found in database after update`);
        localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
        return { success: false, error: 'Data verification failed - not found after update' };
      }
    } catch (error) {
      console.error(`Critical error storing ${platform} connection data:`, error);
      localStorage.setItem(`${platform}_data`, JSON.stringify(connectionInfo));
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
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

      // Get user data from database with error handling
      const { data: userData, error: fetchError } = await supabase
        .from('user_data')
        .select('platform_connections')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching user data from database:', fetchError);
        return this.loadFromLocalStorage();
      }

      console.log('Raw user data from database:', JSON.stringify(userData, null, 2));

      const connectionData: { spotify?: any; youtube?: any } = {};

      // Load from database if available with enhanced validation
      if (userData?.platform_connections && typeof userData.platform_connections === 'object') {
        const connections = userData.platform_connections as PlatformConnections;
        console.log('Parsed platform connections from database:', JSON.stringify(connections, null, 2));
        
        if (connections.spotify?.profile) {
          // Validate Spotify profile data
          const spotifyProfile = connections.spotify.profile;
          if (spotifyProfile.id && spotifyProfile.display_name) {
            connectionData.spotify = { profile: spotifyProfile };
            console.log('✅ Loaded valid Spotify connection from database');
          } else {
            console.warn('⚠️ Invalid Spotify profile data in database, skipping');
          }
        }
        
        if (connections.youtube?.channel) {
          // Validate YouTube channel data
          const youtubeChannel = connections.youtube.channel;
          if (youtubeChannel.id && youtubeChannel.snippet) {
            connectionData.youtube = { channel: youtubeChannel };
            console.log('✅ Loaded valid YouTube connection from database');
          } else {
            console.warn('⚠️ Invalid YouTube channel data in database, skipping');
          }
        }
      }

      // Fallback to localStorage if database data is incomplete
      const localStorageData = this.loadFromLocalStorage();
      console.log('Local storage data for comparison:', JSON.stringify(localStorageData, null, 2));
      
      const finalData = {
        spotify: connectionData.spotify || localStorageData.spotify,
        youtube: connectionData.youtube || localStorageData.youtube
      };

      console.log('Final connection data to return:', JSON.stringify(finalData, null, 2));
      return finalData;
    } catch (error) {
      console.error('Critical error loading connection data from database:', error);
      return this.loadFromLocalStorage();
    }
  }

  static async removeConnectionData(platform: 'spotify' | 'youtube') {
    try {
      console.log(`=== REMOVING ${platform.toUpperCase()} CONNECTION DATA ===`);
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.log('User not authenticated, removing from localStorage only');
        localStorage.removeItem(`${platform}_data`);
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
        console.error('Error fetching user data for removal:', fetchError);
        localStorage.removeItem(`${platform}_data`);
        return { success: false, error: fetchError.message };
      }

      if (!userData) {
        console.error('No user data found for removal');
        localStorage.removeItem(`${platform}_data`);
        return { success: true };
      }

      // Get current platform connections
      const currentConnections = userData.platform_connections && typeof userData.platform_connections === 'object'
        ? userData.platform_connections as PlatformConnections
        : {};

      // Remove the specific platform
      const updatedConnections = { ...currentConnections };
      delete updatedConnections[platform];

      console.log('Removing platform connection, updated connections:', JSON.stringify(updatedConnections, null, 2));

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
        console.error(`Error removing ${platform} connection data from database:`, updateError);
        localStorage.removeItem(`${platform}_data`);
        return { success: false, error: updateError.message };
      }

      console.log(`✅ ${platform} connection data removed successfully from database`);

      // Also remove from localStorage
      localStorage.removeItem(`${platform}_data`);
      console.log(`✅ ${platform} connection data removed from localStorage`);
      
      return { success: true };
    } catch (error) {
      console.error(`Critical error removing ${platform} connection data:`, error);
      localStorage.removeItem(`${platform}_data`);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private static loadFromLocalStorage(): { spotify?: any; youtube?: any } {
    const connectionData: { spotify?: any; youtube?: any } = {};
    
    try {
      const localSpotifyData = localStorage.getItem('spotify_data');
      const localYouTubeData = localStorage.getItem('youtube_data');
      
      if (localSpotifyData) {
        try {
          const parsedSpotifyData = JSON.parse(localSpotifyData);
          connectionData.spotify = parsedSpotifyData;
          console.log('✅ Loaded Spotify data from localStorage');
        } catch (error) {
          console.error('Error parsing Spotify data from localStorage:', error);
        }
      }
      
      if (localYouTubeData) {
        try {
          const parsedYouTubeData = JSON.parse(localYouTubeData);
          connectionData.youtube = parsedYouTubeData;
          console.log('✅ Loaded YouTube data from localStorage');
        } catch (error) {
          console.error('Error parsing YouTube data from localStorage:', error);
        }
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }

    console.log('Final localStorage data:', JSON.stringify(connectionData, null, 2));
    return connectionData;
  }
}
