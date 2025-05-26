import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Youtube, PlayCircle, Users, Heart, TrendingUp } from 'lucide-react';

interface YouTubeData {
  subscriptions: Array<{
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
  likedVideos: Array<{
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
  playlists: Array<{
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
  }>;
  videos: Array<{
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
      viewCount: string;
      likeCount: string;
    };
  }>;
}

interface YouTubeDataCardProps {
  data: YouTubeData | null;
}

const YouTubeDataCard: React.FC<YouTubeDataCardProps> = ({ data }) => {
  const [isDataStored, setIsDataStored] = useState(false);

  if (!data) {
    return (
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            YouTube Profile
          </CardTitle>
          <CardDescription>Connect your YouTube account to see your viewing insights</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Generate content summary based on subscriptions and liked videos
  const generateContentSummary = () => {
    const subscriptionTitles = data.subscriptions.map(sub => sub.snippet.title.toLowerCase());
    const likedVideoTitles = data.likedVideos.map(video => video.snippet.title.toLowerCase());
    
    const allContent = [...subscriptionTitles, ...likedVideoTitles].join(' ');
    
    // Simple keyword analysis
    const keywords = {
      educational: ['tutorial', 'learn', 'how to', 'explain', 'science', 'history', 'documentary'],
      entertainment: ['funny', 'comedy', 'meme', 'react', 'gaming', 'stream'],
      lifestyle: ['vlog', 'daily', 'routine', 'lifestyle', 'travel', 'food'],
      tech: ['tech', 'coding', 'programming', 'computer', 'software', 'review'],
      music: ['music', 'song', 'album', 'artist', 'concert', 'live'],
      fitness: ['workout', 'fitness', 'gym', 'health', 'exercise'],
      creative: ['art', 'design', 'creative', 'drawing', 'photography']
    };
    
    const scores = Object.entries(keywords).map(([category, words]) => {
      const score = words.reduce((acc, word) => {
        return acc + (allContent.split(word).length - 1);
      }, 0);
      return { category, score };
    }).sort((a, b) => b.score - a.score);
    
    const topCategories = scores.filter(s => s.score > 0).slice(0, 2);
    
    if (topCategories.length === 0) {
      return "You have a diverse viewing pattern across various types of content on YouTube.";
    }
    
    const categoryDescriptions = {
      educational: "thought-provoking educational content",
      entertainment: "entertaining and fun videos",
      lifestyle: "lifestyle and vlog content", 
      tech: "technology and programming content",
      music: "music and audio content",
      fitness: "health and fitness content",
      creative: "creative and artistic content"
    };
    
    if (topCategories.length === 1) {
      return `You're drawn to ${categoryDescriptions[topCategories[0].category as keyof typeof categoryDescriptions]} that matches your interests and curiosity.`;
    } else {
      return `You enjoy a mix of ${categoryDescriptions[topCategories[0].category as keyof typeof categoryDescriptions]} and ${categoryDescriptions[topCategories[1].category as keyof typeof categoryDescriptions]}, showing your diverse interests.`;
    }
  };

  // Store synthesized data when component mounts with data
  useEffect(() => {
    if (data && !isDataStored) {
      const synthesizedData = {
        subscriptions: data.subscriptions.slice(0, 5),
        likedVideos: data.likedVideos.slice(0, 5),
        playlists: data.playlists.slice(0, 3),
        videos: data.videos.slice(0, 3),
        vibeSummary: generateContentSummary()
      };

      // Get raw YouTube data from localStorage
      const rawYouTubeData = localStorage.getItem('youtube_data');
      const parsedRawData = rawYouTubeData ? JSON.parse(rawYouTubeData) : null;

      // Store both synthesized and raw data
      import('../services/mirrorDataService').then(({ MirrorDataService }) => {
        MirrorDataService.storeMirrorData(
          { youtube: synthesizedData },
          { youtube: parsedRawData }
        );
      });

      setIsDataStored(true);
    }
  }, [data, isDataStored]);

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Youtube className="h-5 w-5" />
          YouTube Profile
        </CardTitle>
        <CardDescription>Your viewing habits and content preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Summary */}
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/20">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Your Viewing Vibe
          </h3>
          <p className="text-sm text-muted-foreground">{generateContentSummary()}</p>
        </div>

        {/* Top Subscriptions */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Top Subscriptions
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {data.subscriptions.slice(0, 5).map((subscription, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                <img 
                  src={subscription.snippet.thumbnails.default.url} 
                  alt={subscription.snippet.title}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{subscription.snippet.title}</p>
                  {subscription.snippet.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {subscription.snippet.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Liked Videos */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Recently Liked Videos
          </h3>
          <div className="grid grid-cols-1 gap-2">
            {data.likedVideos.slice(0, 5).map((video, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                <img 
                  src={video.snippet.thumbnails.default.url} 
                  alt={video.snippet.title}
                  className="w-10 h-10 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-1">{video.snippet.title}</p>
                  <p className="text-xs text-muted-foreground">{video.snippet.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Playlists */}
        {data.playlists.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <PlayCircle className="h-4 w-4" />
              Your Playlists
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {data.playlists.slice(0, 3).map((playlist, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                  <img 
                    src={playlist.snippet.thumbnails.default.url} 
                    alt={playlist.snippet.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{playlist.snippet.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {playlist.contentDetails.itemCount} videos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Your Videos (if any) */}
        {data.videos.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              Your Content
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {data.videos.slice(0, 3).map((video, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/20">
                  <img 
                    src={video.snippet.thumbnails.default.url} 
                    alt={video.snippet.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm line-clamp-1">{video.snippet.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {parseInt(video.statistics.viewCount).toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeDataCard;
