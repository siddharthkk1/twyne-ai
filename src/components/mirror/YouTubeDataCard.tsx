
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, TrendingUp } from 'lucide-react';
import { AIProfileService } from '@/services/aiProfileService';

interface YouTubeData {
  subscriptions: Array<{
    snippet: {
      title: string;
      description?: string;
      thumbnails: {
        default: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
  }>;
  likedVideos: Array<{
    snippet: {
      title: string;
      channelTitle: string;
      thumbnails: {
        default: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
  }>;
  playlists: Array<{
    snippet: {
      title: string;
      description?: string;
      thumbnails: {
        default: { url: string };
        medium?: { url: string };
        high?: { url: string };
      };
    };
    contentDetails: {
      itemCount: number;
    };
  }>;
  videos: Array<{
    snippet: {
      title: string;
      description?: string;
      thumbnails: {
        default: { url: string };
        medium?: { url: string };
        high?: { url: string };
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
  const [aiSummary, setAiSummary] = useState<string>("");
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

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

  // Ensure data arrays exist and are arrays
  const safeSubscriptions = Array.isArray(data.subscriptions) ? data.subscriptions : [];
  const safeLikedVideos = Array.isArray(data.likedVideos) ? data.likedVideos : [];
  const safePlaylists = Array.isArray(data.playlists) ? data.playlists : [];
  const safeVideos = Array.isArray(data.videos) ? data.videos : [];

  // Generate AI summary when component mounts with data
  useEffect(() => {
    if (data && !isDataStored && !aiSummary && !isGeneratingSummary) {
      setIsGeneratingSummary(true);
      
      // Prepare data for AI analysis
      const analysisData = {
        likedVideos: safeLikedVideos.map(video => ({
          title: video.snippet.title,
          channelTitle: video.snippet.channelTitle,
          description: ""
        })),
        subscriptions: safeSubscriptions.map(sub => ({
          title: sub.snippet.title,
          description: sub.snippet.description || ""
        })),
        watchHistory: [] // YouTube API doesn't provide watch history
      };

      // Generate AI summary
      AIProfileService.generateYouTubeProfile(analysisData)
        .then(summary => {
          setAiSummary(summary);
          
          // Store only the AI summary
          import('../../services/mirrorDataService').then(({ MirrorDataService }) => {
            MirrorDataService.storeMirrorData(
              { youtube: { summary } },
              {} // No raw YouTube data
            );
          });

          setIsDataStored(true);
        })
        .catch(error => {
          console.error('Error generating AI summary:', error);
          setAiSummary("Your YouTube viewing habits reflect a curious mind that enjoys discovering diverse content across the platform.");
        })
        .finally(() => {
          setIsGeneratingSummary(false);
        });
    }
  }, [data, isDataStored, aiSummary, isGeneratingSummary, safeSubscriptions, safeLikedVideos]);

  return (
    <Card className="bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Youtube className="h-5 w-5" />
          YouTube Profile
        </CardTitle>
        <CardDescription>Your viewing personality and content preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI-Generated Viewing Profile */}
        <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/20">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Your Viewing Personality
          </h3>
          {isGeneratingSummary ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              <p className="text-sm text-muted-foreground">Analyzing your viewing habits...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {aiSummary || "Your YouTube viewing habits reflect a curious mind that enjoys discovering diverse content across the platform."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeDataCard;
