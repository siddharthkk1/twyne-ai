
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, UserRound, Heart, Star, BookOpen, Calendar } from "lucide-react";
import { PersonalityChart } from "./PersonalityChart";
import { ValueCard } from "./ValueCard";
import { InsightCard } from "./InsightCard";

interface UserProfile {
  name: string;
  location: string;
  interests: string[] | string; // Updated to accept both string and array
  socialStyle: string;
  connectionPreferences: string;
  personalInsights: string[];
  age?: string;
  hometown?: string;
  timeInCurrentCity?: string;
  talkingPoints?: string[];
  friendshipPace?: string;
  socialEnergy?: string;
  weekendActivities?: string;
  mediaTastes?: string;
  dealBreakers?: string;
  lookingFor?: string;
  values?: string;
  misunderstood?: string;
  lifeStory?: string;
  background?: string;
  careerOrEducation?: string;
  creativePursuits?: string;
  meaningfulAchievements?: string;
  lifePhilosophy?: string;
  challengesOvercome?: string;
  growthJourney?: string;
  emotionalIntelligence?: string;
  twyneTags?: string[];
  vibeSummary?: string;
  socialNeeds?: string;
  coreValues?: string;
  lifeContext?: string;
}

export const ProfileCompletionDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const { name, location, age } = userProfile;
  const [activeTab, setActiveTab] = useState("overview");

  // Extract interests as array - Fixed by handling both string and array types
  const interests = Array.isArray(userProfile.interests) 
    ? userProfile.interests 
    : typeof userProfile.interests === 'string' 
      ? userProfile.interests.split(',').map(i => i.trim()) 
      : [];

  // Helper function to get the first letter of the name
  const getNameInitial = () => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Helper function to extract key values from text
  const extractKeyValues = (text?: string): string[] => {
    if (!text) return [];
    // Split by periods, commas, or natural language indicators
    const segments = text.split(/[.,]|\s(?:and|but|or)\s/).filter(Boolean);
    return segments.map(s => s.trim()).filter(s => s.length > 5 && s.length < 100);
  };

  const values = extractKeyValues(userProfile.values);
  const insights = extractKeyValues(userProfile.lifePhilosophy)
    .concat(extractKeyValues(userProfile.meaningfulAchievements))
    .concat(extractKeyValues(userProfile.challengesOvercome));

  // Personality traits based on social style descriptions
  const personalityTraits = {
    extroversion: userProfile.socialEnergy?.toLowerCase().includes('group') ? 80 : 
                 userProfile.socialEnergy?.toLowerCase().includes('one') ? 40 : 60,
    openness: userProfile.creativePursuits ? 70 : 50,
    empathy: userProfile.connectionPreferences?.toLowerCase().includes('empath') || 
             userProfile.connectionPreferences?.toLowerCase().includes('listen') ? 85 : 65,
    structure: userProfile.weekendActivities?.toLowerCase().includes('plan') ? 75 : 
              userProfile.weekendActivities?.toLowerCase().includes('spontaneous') ? 30 : 50,
  };

  return (
    <div className="flex flex-col bg-gradient-to-br from-primary/10 via-background to-background min-h-screen p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-primary">Your</span> Persona Profile
        </h1>
        <p className="text-muted-foreground">
          Based on our conversation, here's what I've learned about you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
        {/* Main column - Header card */}
        <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 bg-primary/20">
                <AvatarFallback className="text-xl font-medium text-primary">
                  {getNameInitial()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {name}'s Profile
                  <Badge variant="outline" className="ml-2 bg-primary/10 text-primary">
                    <Check className="mr-1 h-3 w-3" /> Complete
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {location}{age ? `, ${age}` : ''}
                  {userProfile.hometown && ` • Originally from ${userProfile.hometown}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tab navigation */}
        <div className="col-span-1 md:col-span-12">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full animate-fade-in"
          >
            <TabsList className="mb-4 w-full md:w-auto bg-white/80 backdrop-blur-sm p-1 rounded-lg">
              <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <UserRound className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="personality" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="h-4 w-4 mr-2" />
                Personality
              </TabsTrigger>
              <TabsTrigger value="interests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="h-4 w-4 mr-2" />
                Interests
              </TabsTrigger>
              <TabsTrigger value="story" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                Story
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* AI-Generated Vibe Summary */}
              <Card className="col-span-1 md:col-span-8 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Vibe Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProfile.vibeSummary && (
                      <div>
                        <p>{userProfile.vibeSummary}</p>
                      </div>
                    )}
                    
                    {userProfile.socialNeeds && (
                      <div>
                        <h3 className="font-medium text-primary mb-1">Social Needs</h3>
                        <p>{userProfile.socialNeeds}</p>
                      </div>
                    )}

                    {userProfile.coreValues && (
                      <div>
                        <h3 className="font-medium text-primary mb-1">Core Values</h3>
                        <p>{userProfile.coreValues}</p>
                      </div>
                    )}

                    {userProfile.lifeContext && (
                      <div>
                        <h3 className="font-medium text-primary mb-1">Life Context</h3>
                        <p>{userProfile.lifeContext}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Twyne Tags */}
              <Card className="col-span-1 md:col-span-4 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Twyne Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {userProfile.twyneTags && userProfile.twyneTags.map((tag, index) => (
                      <Badge 
                        key={index}
                        variant="outline"
                        className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Interests & Top Values */}
              <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top Interests */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                  <CardHeader>
                    <CardTitle>Top Interests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {interests.slice(0, 8).map((interest, index) => (
                        <Badge 
                          key={index}
                          className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Values */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                  <CardHeader>
                    <CardTitle>Your Values</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {values.length > 0 ? (
                        values.slice(0, 3).map((value, index) => (
                          <Badge 
                            key={index}
                            variant="outline"
                            className="bg-secondary/10 text-secondary hover:bg-secondary/20 px-3 py-1 text-sm"
                          >
                            {value.length > 30 ? value.substring(0, 30) + '...' : value}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No values specified yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Personality Tab Content */}
            <TabsContent value="personality" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Personality Traits Visualization */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Personality Profile</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <PersonalityChart traits={personalityTraits} />
                </CardContent>
              </Card>

              {/* Values Cards */}
              <div className="col-span-1 md:col-span-6 space-y-6">
                {values.slice(0, 3).map((value, index) => (
                  <ValueCard key={index} value={value} index={index} />
                ))}
              </div>

              {/* Connection Preferences */}
              <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Connection Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.connectionPreferences || "No connection preferences specified."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests Tab Content */}
            <TabsContent value="interests" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Interests */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Interests & Passions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <Badge 
                        key={index}
                        className="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1 text-sm"
                      >
                        {interest}
                      </Badge>
                    ))}
                  </div>
                  
                  {userProfile.talkingPoints && userProfile.talkingPoints.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Talking Points</h3>
                      <p>{userProfile.talkingPoints[0]}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Creative Pursuits */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Creative Pursuits</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.creativePursuits || "No creative pursuits specified."}</p>
                </CardContent>
              </Card>

              {/* Media Tastes */}
              <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Media & Cultural Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.mediaTastes || "No media tastes specified."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Story Tab Content */}
            <TabsContent value="story" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Life Story */}
              <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Your Story</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifeStory || "No life story specified."}</p>
                </CardContent>
              </Card>

              {/* Achievements and Challenges */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Meaningful Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.meaningfulAchievements || "No achievements specified."}</p>
                </CardContent>
              </Card>

              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Growth Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.challengesOvercome || "No challenges specified."}</p>
                </CardContent>
              </Card>

              {/* Personal Insights */}
              <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {insights.slice(0, 2).map((insight, index) => (
                  <InsightCard key={index} insight={insight} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
