
import { supabase } from "@/integrations/supabase/client";

interface YouTubeAnalysisData {
  likedVideos: Array<{
    title: string;
    description?: string;
    tags?: string[];
    categoryId?: string;
    channelTitle: string;
  }>;
  subscriptions: Array<{
    title: string;
    description?: string;
    topicCategories?: string[];
    keywords?: string[];
  }>;
  watchHistory?: Array<{
    title: string;
    description?: string;
    tags?: string[];
    categoryId?: string;
  }>;
}

interface SpotifyAnalysisData {
  topTracks: Array<{
    name: string;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
    audio_features?: {
      danceability: number;
      energy: number;
      valence: number;
      tempo: number;
      acousticness: number;
      instrumentalness: number;
    };
  }>;
  topArtists: Array<{
    name: string;
    images: Array<{ url: string }>;
    genres: string[];
  }>;
  topAlbums?: Array<{
    name: string;
    artists: Array<{ name: string }>;
    images: Array<{ url: string }>;
  }>;
  topGenres: string[];
}

export class AIProfileService {
  static async generateYouTubeProfile(data: YouTubeAnalysisData): Promise<string> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('No active session for AI profile generation');
        return "Your YouTube viewing habits reflect a curious mind that enjoys discovering diverse content across the platform.";
      }

      // Prepare the data summary for AI analysis
      const contentSummary = {
        likedVideos: data.likedVideos.slice(0, 20).map(video => ({
          title: video.title,
          channel: video.channelTitle,
          description: video.description?.substring(0, 200)
        })),
        subscriptions: data.subscriptions.slice(0, 15).map(sub => ({
          title: sub.title,
          description: sub.description?.substring(0, 200),
          topics: sub.topicCategories || []
        })),
        watchHistory: data.watchHistory?.slice(0, 15).map(video => ({
          title: video.title,
          description: video.description?.substring(0, 200)
        })) || []
      };

      const prompt = `Based on this YouTube viewing data, create a personalized 2-3 sentence summary of this person's viewing personality and interests. Focus on their content preferences, learning style, and what this reveals about their character. Be warm, insightful, and specific.

Liked Videos: ${JSON.stringify(contentSummary.likedVideos)}
Subscriptions: ${JSON.stringify(contentSummary.subscriptions)}
Watch History: ${JSON.stringify(contentSummary.watchHistory)}

Write in second person ("You...") and make it feel personal and insightful.`;

      const { data: aiResponse, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          endpoint: "chat",
          data: {
            messages: [
              {
                role: "system",
                content: "You are an insightful AI that analyzes viewing habits to create warm, personal summaries. Be specific and avoid generic statements."
              },
              {
                role: "user", 
                content: prompt
              }
            ]
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error generating YouTube profile:', error);
        return "Your YouTube viewing habits reflect a curious mind that enjoys discovering diverse content across the platform.";
      }

      return aiResponse.content || "Your YouTube viewing habits reflect a curious mind that enjoys discovering diverse content across the platform.";
    } catch (error) {
      console.error('Error in AI profile generation:', error);
      return "Your YouTube viewing habits reflect a curious mind that enjoys discovering diverse content across the platform.";
    }
  }

  static async generateSpotifyProfile(data: SpotifyAnalysisData): Promise<{
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
  }> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        console.error('No active session for AI profile generation');
        return this.getDefaultSpotifyProfile(data);
      }

      // Calculate average audio features
      const tracksWithFeatures = data.topTracks.filter(track => track.audio_features);
      const avgFeatures = tracksWithFeatures.length > 0 ? {
        valence: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.valence || 0), 0) / tracksWithFeatures.length * 100),
        energy: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.energy || 0), 0) / tracksWithFeatures.length * 100),
        danceability: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.danceability || 0), 0) / tracksWithFeatures.length * 100),
        tempo: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.tempo || 0), 0) / tracksWithFeatures.length),
        acousticness: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.acousticness || 0), 0) / tracksWithFeatures.length * 100),
        instrumentalness: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.instrumentalness || 0), 0) / tracksWithFeatures.length * 100)
      } : {
        valence: 50,
        energy: 50,
        danceability: 50,
        tempo: 120,
        acousticness: 30,
        instrumentalness: 10
      };

      // Prepare data for AI analysis
      const musicSummary = {
        topTracks: data.topTracks.slice(0, 10).map(track => ({
          name: track.name,
          artists: track.artists.map(a => a.name).join(', '),
          audioFeatures: track.audio_features
        })),
        topArtists: data.topArtists.slice(0, 10).map(artist => ({
          name: artist.name,
          genres: artist.genres
        })),
        topGenres: data.topGenres.slice(0, 10),
        audioProfile: avgFeatures
      };

      const prompt = `Based on this Spotify listening data, create a personalized 2-3 sentence vibe summary that captures this person's musical personality. Focus on their emotional relationship with music, what their taste reveals about their inner world, and their listening style. Be warm, insightful, and emotionally expressive.

Top Tracks: ${JSON.stringify(musicSummary.topTracks)}
Top Artists: ${JSON.stringify(musicSummary.topArtists)}
Top Genres: ${JSON.stringify(musicSummary.topGenres)}
Audio Profile: ${JSON.stringify(musicSummary.audioProfile)}

Write in second person ("You...") and make it feel deeply personal and emotionally resonant.`;

      const { data: aiResponse, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          endpoint: "chat",
          data: {
            messages: [
              {
                role: "system",
                content: "You are an insightful AI that analyzes music taste to create warm, emotionally expressive summaries. Be specific about musical elements and emotional connections."
              },
              {
                role: "user", 
                content: prompt
              }
            ]
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const vibeSummary = error ? this.generateDefaultVibeSummary(avgFeatures) : (aiResponse.content || this.generateDefaultVibeSummary(avgFeatures));

      return {
        topSongs: data.topTracks.slice(0, 5).map(track => ({
          name: track.name,
          artists: track.artists,
          album: track.album
        })),
        topArtists: data.topArtists.slice(0, 5).map(artist => ({
          name: artist.name,
          images: artist.images
        })),
        topAlbums: data.topAlbums?.slice(0, 5).map(album => ({
          name: album.name,
          artists: album.artists,
          images: album.images
        })) || [],
        topGenres: data.topGenres.slice(0, 5),
        vibeSummary,
        traitDisplay: avgFeatures
      };
    } catch (error) {
      console.error('Error in Spotify profile generation:', error);
      return this.getDefaultSpotifyProfile(data);
    }
  }

  private static getDefaultSpotifyProfile(data: SpotifyAnalysisData) {
    const tracksWithFeatures = data.topTracks.filter(track => track.audio_features);
    const avgFeatures = tracksWithFeatures.length > 0 ? {
      valence: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.valence || 0), 0) / tracksWithFeatures.length * 100),
      energy: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.energy || 0), 0) / tracksWithFeatures.length * 100),
      danceability: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.danceability || 0), 0) / tracksWithFeatures.length * 100),
      tempo: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.tempo || 0), 0) / tracksWithFeatures.length),
      acousticness: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.acousticness || 0), 0) / tracksWithFeatures.length * 100),
      instrumentalness: Math.round(tracksWithFeatures.reduce((sum, track) => sum + (track.audio_features?.instrumentalness || 0), 0) / tracksWithFeatures.length * 100)
    } : {
      valence: 50,
      energy: 50,
      danceability: 50,
      tempo: 120,
      acousticness: 30,
      instrumentalness: 10
    };

    return {
      topSongs: data.topTracks.slice(0, 5).map(track => ({
        name: track.name,
        artists: track.artists,
        album: track.album
      })),
      topArtists: data.topArtists.slice(0, 5).map(artist => ({
        name: artist.name,
        images: artist.images
      })),
      topAlbums: data.topAlbums?.slice(0, 5).map(album => ({
        name: album.name,
        artists: album.artists,
        images: album.images
      })) || [],
      topGenres: data.topGenres.slice(0, 5),
      vibeSummary: this.generateDefaultVibeSummary(avgFeatures),
      traitDisplay: avgFeatures
    };
  }

  private static generateDefaultVibeSummary(avgFeatures: any): string {
    const { valence, energy, acousticness, danceability } = avgFeatures;
    
    if (valence > 70 && energy > 70) {
      return "You're into upbeat, high-energy tracks that radiate positivity. Your playlist is the soundtrack to good vibes and celebration.";
    } else if (valence < 40 && acousticness > 60) {
      return "You're drawn to soulful, introspective tracks with emotional depth. Your taste reflects a thoughtful, contemplative inner world.";
    } else if (danceability > 70) {
      return "You love rhythmic, groove-heavy music that gets you moving. Whether it's electronic beats or funky basslines, you're all about the rhythm.";
    } else if (acousticness > 70) {
      return "You appreciate organic, acoustic sounds with raw authenticity. Your taste leans toward intimate, unplugged performances.";
    } else {
      return "You have an eclectic taste that balances different moods and styles. Your music reflects a complex, multifaceted personality.";
    }
  }
}
