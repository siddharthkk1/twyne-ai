
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from '@/types/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InsightCard from './InsightCard';
import ValueCard from './ValueCard';
import PersonalityChart from './PersonalityChart';
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

interface ProfileCompletionDashboardProps {
  userProfile: UserProfile;
}

export const ProfileCompletionDashboard: React.FC<ProfileCompletionDashboardProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  
  // Fixed tag colors - using dark text for tags
  const tagColors = [
    "bg-primary-light text-primary-dark",  
    "bg-accent-light text-accent-dark",
    "bg-secondary-light text-secondary-dark",
    "bg-yellow-100 text-yellow-800",    
    "bg-green-100 text-green-800",     
    "bg-blue-100 text-blue-800",       
    "bg-purple-100 text-purple-800",   
    "bg-pink-100 text-pink-800"       
  ];
  
  // Function to get random but consistent color for a tag
  const getTagColor = (index: number) => {
    return tagColors[index % tagColors.length];
  };

  // Helper function to ensure interests and personalInsights are arrays
  const ensureArray = (value: string[] | string | undefined): string[] => {
    if (!value) return [];
    if (typeof value === 'string') return [value];
    return value;
  };

  // Default personality traits if none provided
  const defaultTraits = {
    extroversion: 60,
    openness: 70,
    empathy: 80,
    structure: 50
  };

  // Extract all tags
  const getTags = () => {
    return userProfile.twyneTags || userProfile.vibeWords || [];
  };

  const tags = getTags();

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-3">Your Twyne Profile</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Here's what we learned about you from our conversation. This information is private and only visible to you.
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Privacy Guarantee</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This profile is private and only visible to you. Twyne will never share your information with other users without your explicit permission.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Core info */}
          <Card className="p-6 border border-border bg-card col-span-2 md:col-span-1">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">About You</CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-4">
              <div>
                <h3 className="font-medium text-muted-foreground">Name</h3>
                <p className="font-semibold text-lg">{userProfile.name || "Anonymous"}</p>
              </div>
              
              {userProfile.location && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Location</h3>
                  <p>{userProfile.location}</p>
                </div>
              )}
              
              {/* Job/Occupation if available */}
              {userProfile.job && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Occupation</h3>
                  <p>{userProfile.job}</p>
                </div>
              )}
              
              {/* Background if available */}
              {userProfile.background && (
                <div>
                  <h3 className="font-medium text-muted-foreground">Background</h3>
                  <p>{userProfile.background}</p>
                </div>
              )}
              
              {/* Interests and Passions */}
              <div>
                <h3 className="font-medium text-muted-foreground mb-2">Interests & Passions</h3>
                <div className="flex flex-wrap gap-2">
                  {ensureArray(userProfile.interests).slice(0, 6).map((interest, i) => (
                    <span 
                      key={i} 
                      className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTagColor(i)}`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Twyne Tags */}
              {tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">#TwyneTags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTagColor(i + 10)}`}
                      >
                        #{tag.replace(/\s+/g, '')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Keywords that describe you */}
              {userProfile.personalInsights?.length > 0 && (
                <div>
                  <h3 className="font-medium text-muted-foreground mb-2">Keywords That Describe You</h3>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(userProfile.personalInsights).slice(0, 5).map((trait, i) => (
                      <span 
                        key={i} 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTagColor(i + 3)}`}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Right column - Personality and insights */}
          <div className="col-span-2 space-y-6">
            {/* Vibe Summary / Overview */}
            {userProfile.vibeSummary && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Vibe Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.vibeSummary}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Personality Chart */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Your Social Style</CardTitle>
                <CardDescription>Based on our conversation, here's your social style and energy</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalityChart traits={userProfile.personalityTraits || defaultTraits} />
              </CardContent>
            </Card>
            
            {/* Values section */}
            {userProfile.coreValues && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.coreValues}</p>
                  {ensureArray(userProfile.values).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {ensureArray(userProfile.values).map((value, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/5 text-secondary">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Life Stories section */}
            {userProfile.lifeStory && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Life Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifeStory}</p>
                  {userProfile.challengesOvercome && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Challenges Overcome</h4>
                      <p className="text-sm">{userProfile.challengesOvercome}</p>
                    </div>
                  )}
                  {userProfile.meaningfulAchievements && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-1">Meaningful Achievements</h4>
                      <p className="text-sm">{userProfile.meaningfulAchievements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Social Connection Style */}
            {userProfile.socialStyle && (
              <InsightCard 
                insight={userProfile.socialStyle}
                index={0}
              />
            )}
            
            {/* Connection Preferences */}
            {userProfile.connectionPreferences && (
              <InsightCard 
                insight={userProfile.connectionPreferences}
                index={1}
              />
            )}
            
            {/* Social Needs */}
            {userProfile.socialNeeds && (
              <InsightCard 
                insight={userProfile.socialNeeds}
                index={2}
              />
            )}
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => navigate('/connections')}
            className="px-8 py-6 text-lg"
          >
            Find My People
          </Button>
        </div>
      </div>
    </div>
  );
};
