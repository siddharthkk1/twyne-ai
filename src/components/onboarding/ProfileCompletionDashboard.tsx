
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRound, Heart, Star, BookOpen, ThumbsUp, Users, Smile } from "lucide-react";
import { PersonalityChart } from "./PersonalityChart";
import { ValueCard } from "./ValueCard";
import { InsightCard } from "./InsightCard";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";

interface UserProfile {
  name: string;
  location: string;
  interests: string[] | string;
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
  job?: string;
  ethnicity?: string;
  religion?: string;
}

export const ProfileCompletionDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const { name, location, age } = userProfile;
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(true);

  // Show create account prompt when the dashboard is first displayed
  useEffect(() => {
    // Small delay to allow the dashboard to render
    const timer = setTimeout(() => {
      setShowCreateAccountPrompt(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const interests = Array.isArray(userProfile.interests) 
    ? userProfile.interests 
    : typeof userProfile.interests === 'string' 
      ? userProfile.interests.split(',').map(i => i.trim()) 
      : [];

  // Fix: update the regex to be on a single line
  const extractKeyValues = (text?: string): string[] => {
    if (!text) return [];
    const segments = text.split(/[.,]|\s(?:and|but|or)\s/).filter(Boolean);
    return segments.map(s => s.trim()).filter(s => s.length > 5 && s.length < 100);
  };

  const values = extractKeyValues(userProfile.values);
  const insights = extractKeyValues(userProfile.lifePhilosophy)
    .concat(extractKeyValues(userProfile.meaningfulAchievements))
    .concat(extractKeyValues(userProfile.challengesOvercome));

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
      <CreateAccountPrompt open={showCreateAccountPrompt} onOpenChange={setShowCreateAccountPrompt} />
      
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">
          {name}'s <span className="text-primary">Dashboard</span>
        </h1>
        <p className="text-muted-foreground">
          This is private and just between you and Twyne — a reflection of who you are, based on our chat 💬
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
        <div className="col-span-1 md:col-span-12">
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full animate-fade-in"
          >
            <TabsList className="mb-4 w-full md:w-auto bg-white/80 backdrop-blur-sm p-1 rounded-lg">
              <TabsTrigger value="overview">
                <UserRound className="h-4 w-4 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="interests">
                <Heart className="h-4 w-4 mr-2" /> Interests
              </TabsTrigger>
              <TabsTrigger value="personality">
                <Smile className="h-4 w-4 mr-2" /> Personality
              </TabsTrigger>
              <TabsTrigger value="connection">
                <Users className="h-4 w-4 mr-2" /> Connection
              </TabsTrigger>
              <TabsTrigger value="inner-world">
                <ThumbsUp className="h-4 w-4 mr-2" /> Inner World
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-6">
              {/* Vibe Summary Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Vibe Summary</CardTitle>
                  <CardDescription>How you come across</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.vibeSummary || "Your vibe profile is still developing..."}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {userProfile.twyneTags?.length ? (
                      userProfile.twyneTags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="bg-primary/10 hover:bg-primary/20">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Tags will appear as we learn more about you</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Basic Info Card */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Basic Info</CardTitle>
                  <CardDescription>Quick facts about you</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p>{location || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Age</h4>
                      <p>{age || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Job</h4>
                      <p>{userProfile.job || userProfile.careerOrEducation || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Hometown</h4>
                      <p>{userProfile.hometown || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Ethnicity</h4>
                      <p>{userProfile.ethnicity || "Not specified"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Religion</h4>
                      <p>{userProfile.religion || "Not specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Top Interests */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Top Interests</CardTitle>
                  <CardDescription>What matters to you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {interests.length ? (
                      interests.slice(0, 5).map((interest, i) => (
                        <Badge key={i} className="bg-secondary/10 hover:bg-secondary/20">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">Interests will appear as we learn more about you</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Interests Tab Content */}
            <TabsContent value="interests" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Passions & Hobbies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {interests.length ? (
                      interests.map((interest, i) => (
                        <Badge key={i} className="bg-secondary/10 hover:bg-secondary/20">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No passions or hobbies identified yet</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Cultural Tastes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.mediaTastes || "No preferences identified yet"}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Creative Outlets</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.creativePursuits || "No creative outlets identified yet"}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Talking Points</CardTitle>
                  <CardDescription>Topics that might spark conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {userProfile.talkingPoints?.length ? (
                      userProfile.talkingPoints.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No talking points identified yet</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Personality Tab Content */}
            <TabsContent value="personality" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Personality Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center mb-6">
                    <PersonalityChart traits={personalityTraits} />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Social Energy</h3>
                      <p className="text-muted-foreground">{userProfile.socialEnergy || "Not yet identified"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Weekend Activities</h3>
                      <p className="text-muted-foreground">{userProfile.weekendActivities || "Not yet identified"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Emotional Intelligence</h3>
                      <p className="text-muted-foreground">{userProfile.emotionalIntelligence || "Not yet identified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Connection Tab Content */}
            <TabsContent value="connection" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Social Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">Social Style</h3>
                    <p className="text-muted-foreground">{userProfile.socialStyle || "Not yet identified"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Friendship Pace</h3>
                    <p className="text-muted-foreground">{userProfile.friendshipPace || "Not yet identified"}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Emotional Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.socialNeeds || "Not yet identified"}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Connection Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.connectionPreferences || "Not yet identified"}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Deal Breakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.dealBreakers || "Not yet identified"}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Inner World Tab Content */}
            <TabsContent value="inner-world" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {values.length ? (
                      values.map((value, i) => (
                        <ValueCard key={i} value={value} index={i} />
                      ))
                    ) : (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-muted-foreground">Values will appear as we learn more about you</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Life Philosophy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifePhilosophy || "Not yet identified"}</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Personal Growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {insights.length ? (
                      insights.slice(0, 4).map((insight, i) => (
                        <InsightCard key={i} insight={insight} index={i} />
                      ))
                    ) : (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-muted-foreground">Insights will appear as we learn more about you</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm shadow-md">
                <CardHeader>
                  <CardTitle>Life Story</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifeStory || "Not yet identified"}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
