
import React, { useEffect, useState } from 'react';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Youtube, TrendingUp, Heart, Video, User, Play } from 'lucide-react';
import { YouTubeService } from '@/services/youtubeService';
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
    const generateYouTubeInsights = async () => {
      if (youtubeData && !isDataStored && !isGeneratingSummary && !youtubeInsights) {
        setIsGeneratingSummary(true);
        
        try {
          console.log('Starting YouTube data analysis...');
          
          // Get access token from localStorage
          const accessToken = localStorage.getItem('youtube_access_token');
          if (!accessToken) {
            console.error('No YouTube access token found');
            setIsGeneratingSummary(false);
            return;
          }

          // Fetch actual YouTube data using the API
          console.log('Fetching YouTube data from API...');
          
          const [likedVideos, subscriptions, watchLaterVideos] = await Promise.all([
            YouTubeService.getEnhancedLikedVideos(accessToken).catch(error => {
              console.error('Error fetching liked videos:', error);
              return [];
            }),
            YouTubeService.getEnhancedSubscriptions(accessToken).catch(error => {
              console.error('Error fetching subscriptions:', error);
              return [];
            }),
            YouTubeService.getWatchLaterPlaylist(accessToken).catch(error => {
              console.error('Error fetching watch later:', error);
              return [];
            })
          ]);

          console.log('Fetched YouTube data:', {
            likedVideosCount: likedVideos.length,
            subscriptionsCount: subscriptions.length,
            watchLaterCount: watchLaterVideos.length
          });

          // Prepare data for AI analysis using the original algorithm
          const youtubeAnalysisData = {
            likedVideos: likedVideos.map(video => ({
              title: video.title,
              description: video.description,
              channelTitle: video.channelTitle,
              tags: video.tags || [],
              categoryId: video.categoryId,
              topicCategories: video.topicCategories || []
            })),
            subscriptions: subscriptions.map(sub => ({
              title: sub.title,
              description: sub.description,
              topicCategories: sub.topicCategories || [],
              keywords: sub.keywords || []
            })),
            watchHistory: watchLaterVideos.map(video => ({
              title: video.snippet?.title || '',
              description: video.snippet?.description || '',
              tags: [],
              categoryId: null
            }))
          };

          console.log('Sending data to AI for analysis...');
          
          // Generate AI insights using the original algorithm
          const aiSummary = await AIProfileService.generateYouTubeProfile(youtubeAnalysisData);
          
          console.log('Generated AI summary:', aiSummary);
          
          // Create simplified data for display
          const topVideos = likedVideos.slice(0, 5).map((video, index) => ({
            rank: index + 1,
            title: video.title,
            channelTitle: video.channelTitle,
            imageUrl: video.snippet?.thumbnails?.medium?.url || video.snippet?.thumbnails?.default?.url || ''
          }));

          const topChannels = subscriptions.slice(0, 5).map((sub, index) => ({
            rank: index + 1,
            name: sub.title,
            imageUrl: sub.snippet?.thumbnails?.medium?.url || sub.snippet?.thumbnails?.default?.url || ''
          }));

          // Extract categories from topics
          const allCategories = [
            ...likedVideos.flatMap(v => v.topicCategories || []),
            ...subscriptions.flatMap(s => s.topicCategories || [])
          ];
          
          const categoryCount = allCategories.reduce((acc, cat) => {
            const cleanCat = cat.replace('https://en.wikipedia.org/wiki/', '').replace(/_/g, ' ');
            acc[cleanCat] = (acc[cleanCat] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const topCategories = Object.entries(categoryCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([cat]) => cat);

          const synthesizedInsights = {
            topVideos,
            topChannels,
            topCategories,
            summary: aiSummary
          };
          
          setYoutubeInsights(synthesizedInsights);
          
          // Store both synthesized and raw data
          const rawDataForStorage = {
            likedVideos,
            subscriptions,
            watchLaterVideos,
            topVideos,
            topChannels,
            topCategories
          };

          import('../../services/mirrorDataService').then(({ MirrorDataService }) => {
            MirrorDataService.storeMirrorData(
              { spotify: null, youtube: synthesizedInsights },
              { spotify: null, youtube: rawDataForStorage }
            );
          });

          setIsDataStored(true);
        } catch (error) {
          console.error('Error generating YouTube insights:', error);
        } finally {
          setIsGeneratingSummary(false);
        }
      }
    };

    generateYouTubeInsights();
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
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Your Viewing Profile
          </h3>
          {isGeneratingSummary ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <p className="text-sm text-muted-foreground">Analyzing your viewing patterns...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {youtubeInsights?.summary || "Analyzing your YouTube data to create a personalized viewing profile..."}
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
                      <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full text-xs font-medium text-red-700">
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
                      <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full text-xs font-medium text-red-700">
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
                <Badge key={index} variant="outline" className="bg-red-50 text-red-700 border-red-200">
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
