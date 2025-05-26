
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
}
