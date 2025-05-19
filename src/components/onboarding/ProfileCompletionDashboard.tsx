
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, UserRound, Heart, Star, BookOpen, ThumbsUp, Users, Smile } from "lucide-react";
import { PersonalityChart } from "./PersonalityChart";
import { ValueCard } from "./ValueCard";
import { InsightCard } from "./InsightCard";

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
}

export const ProfileCompletionDashboard: React.FC<{ userProfile: UserProfile }> = ({ userProfile }) => {
  const { name, location, age } = userProfile;
  const [activeTab, setActiveTab] = useState("overview");

  const interests = Array.isArray(userProfile.interests) 
    ? userProfile.interests 
    : typeof userProfile.interests === 'string' 
      ? userProfile.interests.split(',').map(i => i.trim()) 
      : [];

  const getNameInitial = () => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const extractKeyValues = (text?: string): string[] => {
    if (!text) return [];
    // Fix: Put the entire regex on one line to prevent the "Unterminated regexp literal" error
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
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-primary">Your</span> Dashboard
        </h1>
        <p className="text-muted-foreground">
          This is private and just between you and Twyne — a reflection of who you are, based on our chat 💬
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto">
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
                  {name}'s Dashboard
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
              <TabsTrigger value="story">
                <BookOpen className="h-4 w-4 mr-2" /> Story
              </TabsTrigger>
              <TabsTrigger value="inner-world">
                <ThumbsUp className="h-4 w-4 mr-2" /> Inner World
              </TabsTrigger>
            </TabsList>

            {/* Tab contents continue here... */}

          </Tabs>
        </div>
      </div>
    </div>
  );
};
