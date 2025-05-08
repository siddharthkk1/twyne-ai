
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
        value: profileData.interests?.join(", ") || profileData.talkingPoints?.join(", ") || "Not specified" 
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
        category: "Media Tastes", 
        value: profileData.mediaTastes || "Not specified" 
      }
    ];
    
    // Filter out insights with "Not specified" values
    return insights.filter(insight => insight.value !== "Not specified");
  };

  const profileInsights = generateProfileInsights();

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>{nameInitial}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-medium">{profileData.name || "Your"} Profile</h2>
            <p className="text-sm text-muted-foreground">Here's what we know about you so far</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {profileInsights.map((insight, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <div className="text-sm font-medium text-muted-foreground">{insight.category}</div>
              <div className="col-span-2 text-sm">{insight.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInsightsDashboard;
