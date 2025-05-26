
import React, { useEffect, useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Youtube, TrendingUp, Heart, Video, User, Play } from 'lucide-react';
import { AIProfileService } from '@/services/aiProfileService';

interface SimplifiedVideo {
  rank: number;
  title: string;
  channelTitle: string;
  imageUrl: string;
}

interface SimplifiedChannel {
  rank: number;
  name: string;
  imageUrl: string;
}

interface YouTubeData {
  topVideos: SimplifiedVideo[];
  topChannels: SimplifiedChannel[];
  topCategories: string[];
  // For backwards compatibility with old data format
  fullTopVideos?: Array<{
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
  fullTopChannels?: Array<{
    snippet: {
      title: string;
      thumbnails: {
        default: { url: string };
        medium: { url: string };
        high: { url: string };
      };
    };
  }>;
}

interface YouTubeDataCardProps {
  data: YouTubeData | null;
}

const YouTubeDataCard: React.FC<YouTubeDataCardProps> = ({ data }) => {
  const [isDataStored, setIsDataStored] = useState(false);
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(data);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [youtubeInsights, setYoutubeInsights] = useState<any>(null);
  const [rawYouTubeData, setRawYouTubeData] = useState<any>(null);

  // Try to load data from localStorage if not provided
  useEffect(() => {
    if (!youtubeData) {
      const storedData = localStorage.getItem('youtube_data');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          console.log('Loaded YouTube data from localStorage:', parsed);
          setYoutubeData(parsed);
          setRawYouTubeData(parsed);
        } catch (error) {
          console.error('Error parsing stored YouTube data:', error);
        }
      }
    }
  }, [youtubeData]);

  // Generate and store YouTube insights when component mounts with data
  useEffect(() => {
    if (youtubeData && !isDataStored && !isGeneratingSummary && !youtubeInsights) {
      setIsGeneratingSummary(true);
      
      // Use full data if available, otherwise convert simplified data for AI analysis
      const dataForAI = youtubeData.fullTopVideos && youtubeData.fullTopChannels ? {
        topVideos: youtubeData.fullTopVideos,
        topChannels: youtubeData.fullTopChannels,
        topCategories: Array.isArray(youtubeData.topCategories) ? youtubeData.topCategories : [],
        likedVideos: [], // Add required fields for YouTubeAnalysisData
        subscriptions: []
      } : {
        topVideos: Array.isArray(youtubeData.topVideos) ? youtubeData.topVideos.map(video => ({
          snippet: {
            title: video.title,
            channelTitle: video.channelTitle,
            thumbnails: { 
              default: { url: video.imageUrl },
              medium: { url: video.imageUrl },
              high: { url: video.imageUrl }
            }
          }
        })) : [],
        topChannels: Array.isArray(youtubeData.topChannels) ? youtubeData.topChannels.map(channel => ({
          snippet: {
            title: channel.name,
            thumbnails: { 
              default: { url: channel.imageUrl },
              medium: { url: channel.imageUrl },
              high: { url: channel.imageUrl }
            }
          }
        })) : [],
        topCategories: Array.isArray(youtubeData.topCategories) ? youtubeData.topCategories : [],
        likedVideos: [], // Add required fields for YouTubeAnalysisData
        subscriptions: []
      };

      console.log('Processing YouTube data for AI analysis:', dataForAI);

      // Generate AI insights
      AIProfileService.generateYouTubeProfile(dataForAI)
        .then(insights => {
          console.log('Generated YouTube insights:', insights);
          
          // Convert the insights to match our SynthesizedYouTubeData format
          const synthesizedInsights = {
            topVideos: Array.isArray(youtubeData.topVideos) ? youtubeData.topVideos.slice(0, 5) : [],
            topChannels: Array.isArray(youtubeData.topChannels) ? youtubeData.topChannels.slice(0, 5) : [],
            topCategories: Array.isArray(youtubeData.topCategories) ? youtubeData.topCategories.slice(0, 5) : [],
            summary: (insights && typeof insights === 'object' && 'summary' in insights && typeof insights.summary === 'string') 
              ? insights.summary 
              : "Your viewing habits reflect diverse interests across multiple content categories."
          };
          
          setYoutubeInsights(synthesizedInsights);
          
          // Get raw YouTube data from localStorage
          const rawYouTubeData = localStorage.getItem('youtube_data');
          const parsedRawData = rawYouTubeData ? JSON.parse(rawYouTubeData) : null;

          // Store both synthesized and raw data
          import('../../services/mirrorDataService').then(({ MirrorDataService }) => {
            MirrorDataService.storeMirrorData(
              { spotify: null, youtube: synthesizedInsights },
              { spotify: null, youtube: parsedRawData }
            );
          });

          setIsDataStored(true);
        })
        .catch(error => {
          console.error('Error generating YouTube insights:', error);
        })
        .finally(() => {
          setIsGeneratingSummary(false);
        });
    }
  }, [youtubeData, isDataStored, isGeneratingSummary, youtubeInsights]);

  if (!youtubeData && !youtubeInsights && !rawYouTubeData) {
    return (
      <div>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Youtube className="h-5 w-5" />
            YouTube Content Profile
          </CardTitle>
          <CardDescription>Connect your YouTube account to see your viewing insights</CardDescription>
        </CardHeader>
      </div>
    );
  }

  // Use raw data first for displaying videos/channels, then fall back to insights for summary
  const displayDataForLists = rawYouTubeData || youtubeData;
  const safeVideos = Array.isArray(displayDataForLists?.topVideos) ? displayDataForLists.topVideos : [];
  const safeChannels = Array.isArray(displayDataForLists?.topChannels) ? displayDataForLists.topChannels : [];
  const safeCategories = Array.isArray(displayDataForLists?.topCategories) ? displayDataForLists.topCategories : [];

  return (
    <div>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Youtube className="h-5 w-5" />
          YouTube Content Profile
        </CardTitle>
        <CardDescription>Your viewing patterns and content preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Your Viewing Profile
          </h3>
          {isGeneratingSummary ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Analyzing your viewing patterns...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {youtubeInsights?.summary || "Your viewing habits reflect diverse interests across multiple content categories."}
            </p>
          )}
        </div>

        {/* Two-column layout for Top Channels and Top Videos */}
        {(safeChannels.length > 0 || safeVideos.length > 0) && (
          <div className="grid grid-cols-2 gap-6">
            {/* Top Channels - Left Column */}
            {safeChannels.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Top Channels
                </h3>
                <div className="space-y-2">
                  {safeChannels.slice(0, 5).map((channel, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium text-primary">
                        {channel.rank || (index + 1)}
                      </div>
                      {channel.imageUrl && (
                        <img
                          src={channel.imageUrl}
                          alt={channel.name}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{channel.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Videos - Right Column */}
            {safeVideos.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Top Videos
                </h3>
                <div className="space-y-2">
                  {safeVideos.slice(0, 5).map((video, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-medium text-primary">
                        {video.rank || (index + 1)}
                      </div>
                      {video.imageUrl && (
                        <img
                          src={video.imageUrl}
                          alt={video.title}
                          className="w-10 h-10 rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{video.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {video.channelTitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top Categories */}
        {safeCategories.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Top Categories</h3>
            <div className="flex flex-wrap gap-2">
              {safeCategories.slice(0, 5).map((category, index) => (
                <Badge key={index} variant="outline" className="bg-secondary/5 text-secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default YouTubeDataCard;
