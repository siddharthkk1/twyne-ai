
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

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
        value: profileData.location || "We don't have enough info on that yet." 
      },
      { 
        category: "Age", 
        value: profileData.age || "We don't have enough info on that yet." 
      },
      { 
        category: "Job", 
        value: profileData.job || "We don't have enough info on that yet." 
      },
      { 
        category: "School", 
        value: profileData.school || "We don't have enough info on that yet." 
      },
      { 
        category: "Interests", 
        value: Array.isArray(profileData.interests) 
          ? profileData.interests.join(", ") 
          : profileData.talkingPoints?.join(", ") || "We don't have enough info on that yet." 
      },
      { 
        category: "Social Style", 
        value: profileData.socialStyle || "We don't have enough info on that yet." 
      },
      { 
        category: "Lifestyle", 
        value: profileData.lifestyle || "We don't have enough info on that yet." 
      },
      { 
        category: "Favorite Activities", 
        value: profileData.favoriteActivities || "We don't have enough info on that yet." 
      },
      { 
        category: "Communication Style", 
        value: profileData.communicationStyle || "We don't have enough info on that yet." 
      },
      {
        category: "Core Values",
        value: profileData.coreValues || "We don't have enough info on that yet."
      },
      {
        category: "Life Philosophy",
        value: profileData.lifePhilosophy || "We don't have enough info on that yet."
      },
      {
        category: "Goals",
        value: profileData.goals || "We don't have enough info on that yet."
      },
      {
        category: "Favorite Music",
        value: profileData.favoriteMusic || "We don't have enough info on that yet."
      },
      {
        category: "Favorite Movies & Shows",
        value: profileData.favoriteMoviesAndShows || "We don't have enough info on that yet."
      },
      {
        category: "Favorite Books",
        value: profileData.favoriteBooks || "We don't have enough info on that yet."
      },
      {
        category: "Connection Preferences",
        value: profileData.connectionPreferences || "We don't have enough info on that yet."
      }
    ];
    
    // Return all insights, even if empty
    return insights;
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
          <div className="space-y-1">
            <div className="text-sm font-medium">Vibe Summary</div>
            <div className="bg-secondary/5 rounded-lg p-3 text-sm border border-secondary/10">
              {profileData.vibeSummary || "We don't have enough info on that yet."}
            </div>
          </div>
          
          {/* One Liner */}
          <div className="space-y-1">
            <div className="text-sm font-medium">One Liner</div>
            <div className="bg-secondary/5 rounded-lg p-3 text-sm border border-secondary/10">
              {profileData.oneLiner || "We don't have enough info on that yet."}
            </div>
          </div>
          
          {/* Twyne Tags */}
          <div className="space-y-1">
            <div className="text-sm font-medium">Twyne Tags</div>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="bg-secondary/5 rounded-lg p-3 text-sm border border-secondary/10">
                We don't have enough info on that yet.
              </div>
            )}
          </div>
          
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
