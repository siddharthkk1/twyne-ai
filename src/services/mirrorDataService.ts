
import { supabase } from "@/integrations/supabase/client";

interface SynthesizedSpotifyData {
  topArtists: Array<{
    name: string;
    images: Array<{ url: string }>;
    genres: string[];
  }>;
  topTracks: Array<{
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
  }>;
  topGenres: string[];
  topAlbums: Array<{
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
  }>;
  audioFeatures?: {
    danceability: number;
    energy: number;
    valence: number;
    tempo: number;
    acousticness: number;
    instrumentalness: number;
  };
  vibeSummary: string;
}

interface SynthesizedYouTubeData {
  subscriptions: Array<{
    snippet: {
      title: string;
      thumbnails: { default: { url: string } };
    };
  }>;
  likedVideos: Array<{
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: { default: { url: string } };
    };
  }>;
  playlists: Array<{
    snippet: {
      title: string;
      thumbnails: { default: { url: string } };
    };
    contentDetails: { itemCount: number };
  }>;
  videos: Array<{
    snippet: {
      title: string;
      thumbnails: { default: { url: string } };
    };
    statistics: {
      viewCount: string;
      likeCount: string;
    };
  }>;
  vibeSummary: string;
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
        ...(synthesizedData.spotify && { music_insights: synthesizedData.spotify }),
        ...(synthesizedData.youtube && { video_insights: synthesizedData.youtube })
      };

      // Prepare raw data storage (check size)
      const rawDataToStore: any = {};
      
      // Store raw Spotify data if not too large (limit to ~1MB per service)
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

      // Store raw YouTube data if not too large
      if (rawData.youtube) {
        const youtubeSize = JSON.stringify(rawData.youtube).length;
        if (youtubeSize < 1000000) { // 1MB limit
          rawDataToStore.youtube = rawData.youtube;
        } else {
          console.warn('YouTube data too large, storing summary only');
          rawDataToStore.youtube = {
            channel: rawData.youtube.channel,
            subscriptions: rawData.youtube.subscriptions?.slice(0, 50),
            likedVideos: rawData.youtube.likedVideos?.slice(0, 50),
            playlists: rawData.youtube.playlists?.slice(0, 20),
            videos: rawData.youtube.videos?.slice(0, 20),
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
