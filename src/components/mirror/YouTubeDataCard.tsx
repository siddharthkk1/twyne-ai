
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Youtube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface YouTubeDataCardProps {
  data?: any; // Optional, not used anymore
}

const YouTubeDataCard: React.FC<YouTubeDataCardProps> = () => {
  const { user } = useAuth();
  const [youtubeInsights, setYoutubeInsights] = useState<any>(null);
  const [youtubeChannel, setYoutubeChannel] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Load AI insights from profile_data and connection metadata from platform_connections
  useEffect(() => {
    const loadYouTubeData = async () => {
      if (!user) return;
      
      setIsLoadingInsights(true);
      
      try {
        const { data: userData, error } = await supabase
          .from('user_data')
          .select('profile_data, platform_connections')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && userData) {
          // Load AI insights from profile_data
          if (userData.profile_data) {
            const profileData = userData.profile_data as any;
            if (profileData.youtube_summary) {
              console.log('Loaded YouTube insights from profile_data:', profileData.youtube_summary);
              setYoutubeInsights({ summary: profileData.youtube_summary });
            }
          }

          // Load connection metadata from platform_connections
          if (userData.platform_connections) {
            const connections = userData.platform_connections as any;
            if (connections.youtube?.channel) {
              console.log('Loaded YouTube channel from platform_connections:', connections.youtube.channel);
              setYoutubeChannel(connections.youtube.channel);
            }
          }
        }
      } catch (error) {
        console.error('Error loading YouTube data:', error);
      } finally {
        setIsLoadingInsights(false);
      }
    };

    loadYouTubeData();
  }, [user]);

  if (!youtubeInsights && !youtubeChannel && !isLoadingInsights) {
    return (
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Content Profile
          </CardTitle>
          <CardDescription>Connect your YouTube account to see your content insights</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Youtube className="h-5 w-5 text-red-500" />
          YouTube Content Profile
        </CardTitle>
        <CardDescription>Your viewing preferences and content consumption patterns</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Summary */}
        <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/20">
          <h3 className="font-medium mb-2 flex items-center gap-2">
            <Video className="h-4 w-4 text-red-500" />
            Your Content Personality
          </h3>
          {isLoadingInsights ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
              <p className="text-sm text-muted-foreground">Loading your content insights...</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {youtubeInsights?.summary || "Your content preferences reveal unique interests and viewing patterns."}
            </p>
          )}
        </div>

        {/* Channel Info if available */}
        {youtubeChannel && (
          <div>
            <h3 className="font-medium mb-3">Connected Channel</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              {youtubeChannel.snippet?.thumbnails?.default?.url && (
                <img 
                  src={youtubeChannel.snippet.thumbnails.default.url} 
                  alt="YouTube Channel" 
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-medium">{youtubeChannel.snippet?.title || 'Connected Channel'}</p>
                <p className="text-sm text-muted-foreground">
                  {youtubeChannel.statistics?.subscriberCount ? 
                    parseInt(youtubeChannel.statistics.subscriberCount).toLocaleString() + ' subscribers' :
                    'YouTube connected'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeDataCard;
