
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, UserRound, Heart, Star, BookOpen, Calendar, ThumbsUp } from "lucide-react";
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
              <TabsTrigger value="interests" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Heart className="h-4 w-4 mr-2" />
                Interests & Identity
              </TabsTrigger>
              <TabsTrigger value="vibe" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Star className="h-4 w-4 mr-2" />
                Vibe
              </TabsTrigger>
              <TabsTrigger value="story" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4 mr-2" />
                Story
              </TabsTrigger>
              <TabsTrigger value="values" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <ThumbsUp className="h-4 w-4 mr-2" />
                Values
              </TabsTrigger>
            </TabsList>

            {/* 1. Overview Tab Content */}
            <TabsContent value="overview" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* AI-Generated Vibe Summary */}
              <Card className="col-span-1 md:col-span-8 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Quick Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {userProfile.vibeSummary && (
                      <div>
                        <p>{userProfile.vibeSummary}</p>
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

              {/* Basic Info & Top Interests */}
              <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                  <CardHeader>
                    <CardTitle>Basic Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {name && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium text-muted-foreground">Name</div>
                          <div className="col-span-2 text-sm">{name}</div>
                        </div>
                      )}
                      {location && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium text-muted-foreground">Location</div>
                          <div className="col-span-2 text-sm">{location}</div>
                        </div>
                      )}
                      {age && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium text-muted-foreground">Age</div>
                          <div className="col-span-2 text-sm">{age}</div>
                        </div>
                      )}
                      {userProfile.hometown && (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-sm font-medium text-muted-foreground">Hometown</div>
                          <div className="col-span-2 text-sm">{userProfile.hometown}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
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
              </div>
            </TabsContent>

            {/* 2. Interests & Identity Tab Content */}
            <TabsContent value="interests" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Interests */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Passions & Hobbies</CardTitle>
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
                </CardContent>
              </Card>

              {/* Cultural Tastes */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Cultural Tastes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.mediaTastes || "No media tastes specified."}</p>
                </CardContent>
              </Card>

              {/* Creative Outlets */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Creative Outlets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.creativePursuits || "No creative pursuits specified."}</p>
                </CardContent>
              </Card>

              {/* Talking Points */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Talking Points</CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfile.talkingPoints && userProfile.talkingPoints.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {userProfile.talkingPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No talking points specified.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 3. Vibe Tab Content */}
            <TabsContent value="vibe" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Personality Visualization */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Personality</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <PersonalityChart traits={personalityTraits} />
                </CardContent>
              </Card>

              {/* Social Preferences */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Social Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-1">Social Style</h3>
                    <p>{userProfile.socialStyle || "No social style specified."}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Connection Preferences</h3>
                    <p>{userProfile.connectionPreferences || "No connection preferences specified."}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-1">Friendship Pace</h3>
                    <p>{userProfile.friendshipPace || "No friendship pace specified."}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Needs */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Social Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.socialNeeds || "No social needs specified."}</p>
                </CardContent>
              </Card>

              {/* Misunderstood Aspects */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Misunderstood Aspects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.misunderstood || "No misunderstood aspects specified."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 4. Story Tab Content */}
            <TabsContent value="story" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Life Story */}
              <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Life Story & Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifeStory || userProfile.background || "No life story specified."}</p>
                </CardContent>
              </Card>

              {/* Hometown & Moves */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Hometown & Moves</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userProfile.hometown && (
                      <div>
                        <h3 className="font-medium mb-1">Hometown</h3>
                        <p>{userProfile.hometown}</p>
                      </div>
                    )}
                    {userProfile.timeInCurrentCity && (
                      <div>
                        <h3 className="font-medium mb-1">Time in Current City</h3>
                        <p>{userProfile.timeInCurrentCity}</p>
                      </div>
                    )}
                  </div>
                  {!userProfile.hometown && !userProfile.timeInCurrentCity && (
                    <p>No hometown or move information specified.</p>
                  )}
                </CardContent>
              </Card>

              {/* Career or Studies */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Career or Studies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.careerOrEducation || "No career or education information specified."}</p>
                </CardContent>
              </Card>

              {/* Challenges & Growth */}
              <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Challenges & Growth Journey</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-1">Challenges Overcome</h3>
                      <p>{userProfile.challengesOvercome || "No challenges specified."}</p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Growth Journey</h3>
                      <p>{userProfile.growthJourney || "No growth journey specified."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 5. Values & Inner World Tab Content */}
            <TabsContent value="values" className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-0">
              {/* Core Values */}
              <Card className="col-span-1 md:col-span-12 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.coreValues || "No core values specified."}</p>
                </CardContent>
              </Card>

              {/* Personal Philosophy */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Personal Philosophy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifePhilosophy || "No life philosophy specified."}</p>
                </CardContent>
              </Card>

              {/* Meaningful Achievements */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Meaningful Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.meaningfulAchievements || "No achievements specified."}</p>
                </CardContent>
              </Card>

              {/* Emotional Intelligence */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Emotional Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.emotionalIntelligence || "No emotional intelligence insights specified."}</p>
                </CardContent>
              </Card>

              {/* Deal Breakers */}
              <Card className="col-span-1 md:col-span-6 bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Deal Breakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.dealBreakers || "No deal breakers specified."}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
