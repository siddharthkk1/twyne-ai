
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface ProfileInsight {
  category: string;
  value: string;
}

interface ProfileInsightsDashboardProps {
  profileData: any;
  nameInitial: string;
}

const ProfileInsightsDashboard = ({ profileData, nameInitial }: ProfileInsightsDashboardProps) => {
  // Generate profile insights from user data
  const generateProfileInsights = () => {
    const insights = [
      { 
        category: "Location", 
        value: profileData.location || "Not specified" 
      },
      { 
        category: "Interests", 
        value: Array.isArray(profileData.interests) 
          ? profileData.interests.join(", ") 
          : profileData.talkingPoints?.join(", ") || "Not specified" 
      },
      { 
        category: "Social Style", 
        value: profileData.socialStyle || "Not specified" 
      },
      { 
        category: "Looking For", 
        value: profileData.lookingFor || "Not specified" 
      },
      { 
        category: "Weekend Activities", 
        value: profileData.weekendActivities || "Not specified" 
      },
      { 
        category: "Cultural Tastes", 
        value: profileData.mediaTastes || "Not specified" 
      },
      {
        category: "Core Values",
        value: profileData.coreValues || "Not specified"
      },
      {
        category: "Life Philosophy",
        value: profileData.lifePhilosophy || "Not specified"
      }
    ];
    
    // Filter out insights with "Not specified" values
    return insights.filter(insight => insight.value !== "Not specified");
  };

  // Get tags from profileData
  const getTags = () => {
    return profileData.twyneTags || [];
  };

  const profileInsights = generateProfileInsights();
  const tags = getTags();

  return (
    <Card className="animate-fade-in w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-xl">Your Dashboard</h2>
          <div className="flex items-center text-sm text-muted-foreground">
            <Lock className="h-4 w-4 mr-1 text-primary/70" />
            <span>Private</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10">
            <p className="text-muted-foreground">
              <span className="font-medium text-primary">Privacy note:</span> This information is private and not shared with other users. 
              It's only used by Twyne AI to help you make meaningful connections and is not visible as a public profile.
            </p>
          </div>
          
          {/* Vibe Summary */}
          {profileData.vibeSummary && (
            <div className="space-y-1">
              <div className="text-sm font-medium">Vibe Summary</div>
              <div className="bg-secondary/5 rounded-lg p-3 text-sm border border-secondary/10">
                {profileData.vibeSummary}
              </div>
            </div>
          )}
          
          {/* Twyne Tags */}
          {tags.length > 0 && (
            <div className="space-y-1">
              <div className="text-sm font-medium">Twyne Tags</div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Profile Insights */}
          <div className="space-y-3">
            {profileInsights.map((insight, index) => (
              <div key={index} className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-muted-foreground">{insight.category}</div>
                <div className="col-span-2 text-sm">{insight.value}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInsightsDashboard;
