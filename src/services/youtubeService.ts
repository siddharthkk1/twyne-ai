interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
}

interface YouTubeVideo {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    publishedAt: string;
    channelTitle: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

interface YouTubePlaylist {
  id: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
  contentDetails: {
    itemCount: number;
  };
}

interface YouTubeSubscription {
  id: string;
  snippet: {
    title: string;
    description: string;
    resourceId: {
      channelId: string;
    };
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

interface YouTubeTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export class YouTubeService {
  private static readonly API_BASE = 'https://www.googleapis.com/youtube/v3';
  
  static async exchangeCodeForToken(code: string): Promise<YouTubeTokenResponse> {
    const { supabase } = await import("@/integrations/supabase/client");
    
    const { data, error } = await supabase.functions.invoke('google-auth', {
      body: { code }
    });
    
    if (error) {
      console.error('YouTube token exchange failed:', error);
      throw new Error('Failed to exchange code for token');
    }
    
    return data;
  }
  
  static async getChannelInfo(accessToken: string): Promise<YouTubeChannel> {
    const response = await fetch(`${this.API_BASE}/channels?part=snippet,statistics&mine=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch channel info');
    }
    
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('No channel found');
    }
    
    console.log('YouTube channel data:', data.items[0]);
    return data.items[0];
  }
  
  static async getUserVideos(accessToken: string, maxResults: number = 50): Promise<YouTubeVideo[]> {
    // First get the channel's upload playlist ID
    const channelResponse = await fetch(`${this.API_BASE}/channels?part=contentDetails&mine=true`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!channelResponse.ok) {
      throw new Error('Failed to fetch channel details');
    }
    
    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
    
    if (!uploadsPlaylistId) {
      return [];
    }
    
    // Get videos from the uploads playlist
    const playlistResponse = await fetch(`${this.API_BASE}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!playlistResponse.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    const playlistData = await playlistResponse.json();
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
    
    if (!videoIds) {
      return [];
    }
    
    // Get detailed video information
    const videosResponse = await fetch(`${this.API_BASE}/videos?part=snippet,statistics&id=${videoIds}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!videosResponse.ok) {
      throw new Error('Failed to fetch video details');
    }
    
    const videosData = await videosResponse.json();
    return videosData.items;
  }
  
  static async getUserPlaylists(accessToken: string, maxResults: number = 50): Promise<YouTubePlaylist[]> {
    const response = await fetch(`${this.API_BASE}/playlists?part=snippet,contentDetails&mine=true&maxResults=${maxResults}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    const data = await response.json();
    return data.items;
  }

  static async getUserSubscriptions(accessToken: string, maxResults: number = 50): Promise<YouTubeSubscription[]> {
    const response = await fetch(`${this.API_BASE}/subscriptions?part=snippet&mine=true&maxResults=${maxResults}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch subscriptions');
    }
    
    const data = await response.json();
    return data.items;
  }

  // Alias for backward compatibility
  static async getSubscriptions(accessToken: string, maxResults: number = 50): Promise<YouTubeSubscription[]> {
    return this.getUserSubscriptions(accessToken, maxResults);
  }
  
  static async getLikedVideos(accessToken: string): Promise<YouTubeVideo[]> {
    const response = await fetch(`${this.API_BASE}/videos?part=snippet,statistics&myRating=like&maxResults=50`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch liked videos');
    }
    
    const data = await response.json();
    return data.items;
  }

  static async getEnhancedLikedVideos(accessToken: string): Promise<any[]> {
    try {
      const likedVideos = await this.getLikedVideos(accessToken);
      
      // Get enhanced video details with tags and categories
      const videoIds = likedVideos.map(video => video.id).slice(0, 50).join(',');
      
      if (!videoIds) return [];
      
      const enhancedResponse = await fetch(`${this.API_BASE}/videos?part=snippet,topicDetails&id=${videoIds}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!enhancedResponse.ok) {
        return likedVideos.map(video => ({
          title: video.snippet.title,
          description: video.snippet.description,
          channelTitle: video.snippet.channelTitle,
          tags: [],
          categoryId: null,
          topicCategories: []
        }));
      }
      
      const enhancedData = await enhancedResponse.json();
      
      return enhancedData.items.map((video: any) => ({
        title: video.snippet.title,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
        tags: video.snippet.tags || [],
        categoryId: video.snippet.categoryId,
        topicCategories: video.topicDetails?.topicCategories || []
      }));
    } catch (error) {
      console.error('Error getting enhanced liked videos:', error);
      return [];
    }
  }

  static async getEnhancedSubscriptions(accessToken: string): Promise<any[]> {
    try {
      const subscriptions = await this.getUserSubscriptions(accessToken);
      
      // Get channel details for subscriptions
      const channelIds = subscriptions.map(sub => sub.snippet.resourceId.channelId).slice(0, 50).join(',');
      
      if (!channelIds) return [];
      
      const channelsResponse = await fetch(`${this.API_BASE}/channels?part=snippet,topicDetails&id=${channelIds}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!channelsResponse.ok) {
        return subscriptions.map(sub => ({
          title: sub.snippet.title,
          description: sub.snippet.description,
          topicCategories: [],
          keywords: []
        }));
      }
      
      const channelsData = await channelsResponse.json();
      
      return channelsData.items.map((channel: any) => ({
        title: channel.snippet.title,
        description: channel.snippet.description,
        topicCategories: channel.topicDetails?.topicCategories || [],
        keywords: channel.snippet.keywords || []
      }));
    } catch (error) {
      console.error('Error getting enhanced subscriptions:', error);
      return [];
    }
  }

  static async getWatchHistory(accessToken: string): Promise<YouTubeVideo[]> {
    // YouTube doesn't provide direct access to watch history via API for privacy reasons
    // We'll return liked videos as a proxy for user engagement
    return this.getLikedVideos(accessToken);
  }

  static async getWatchLaterPlaylist(accessToken: string): Promise<YouTubeVideo[]> {
    try {
      const response = await fetch(`${this.API_BASE}/playlistItems?part=snippet&playlistId=WL&maxResults=50`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      const videoIds = data.items.map((item: any) => item.snippet.resourceId.videoId).join(',');
      
      if (!videoIds) {
        return [];
      }
      
      const videosResponse = await fetch(`${this.API_BASE}/videos?part=snippet,statistics&id=${videoIds}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!videosResponse.ok) {
        return [];
      }
      
      const videosData = await videosResponse.json();
      return videosData.items;
    } catch (error) {
      console.error('Failed to fetch watch later playlist:', error);
      return [];
    }
  }
}
