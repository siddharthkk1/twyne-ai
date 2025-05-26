
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

export class YouTubeService {
  private static readonly API_BASE = 'https://www.googleapis.com/youtube/v3';
  
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
    
    return data.items[0];
  }
  
  static async getUserVideos(accessToken: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
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
  
  static async getUserPlaylists(accessToken: string, maxResults: number = 20): Promise<YouTubePlaylist[]> {
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
  
  static async getWatchHistory(accessToken: string): Promise<YouTubeVideo[]> {
    // Note: YouTube API doesn't provide watch history directly due to privacy concerns
    // This would require additional setup with YouTube Analytics API for channel owners
    // For now, we'll return liked videos as a proxy
    const response = await fetch(`${this.API_BASE}/videos?part=snippet,statistics&myRating=like&maxResults=20`, {
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
}
