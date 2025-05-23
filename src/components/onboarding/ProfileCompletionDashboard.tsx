
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from '@/types/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InsightCard from './InsightCard';
import ValueCard from './ValueCard';
import PersonalityChart from './PersonalityChart';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Lock, BarChart3, Heart, User, Activity, BookOpen, Share2, Lightbulb, Brain } from "lucide-react";

interface ProfileCompletionDashboardProps {
  userProfile: UserProfile;
}

export const ProfileCompletionDashboard: React.FC<ProfileCompletionDashboardProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Generate a color palette based on the user's name or interests
  const generateUserThemeColor = () => {
    // Generate a simple hash from the user's name or first interest
    const nameString = userProfile.name || "Twyne User";
    const hashedName = nameString.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Generate a hue based on the hash (0-360)
    const hue = hashedName % 360;
    
    // Return hsl values for use in gradients and colors
    return {
      primary: `hsl(${hue}, 80%, 60%)`,
      secondary: `hsl(${(hue + 30) % 360}, 70%, 65%)`,
      tertiary: `hsl(${(hue + 60) % 360}, 60%, 70%)`,
      light: `hsl(${hue}, 70%, 95%)`,
      medium: `hsl(${hue}, 60%, 85%)`,
      dark: `hsl(${hue}, 70%, 35%)`
    };
  };
  
  const userTheme = generateUserThemeColor();
  
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
        {/* Header with personalized greeting */}
        <div 
          className="text-center p-8 rounded-xl mb-4"
          style={{ 
            background: `linear-gradient(135deg, ${userTheme.light}, ${userTheme.medium})`,
            borderBottom: `3px solid ${userTheme.dark}`
          }}
        >
          <h1 className="text-3xl font-bold mb-3" style={{ color: userTheme.dark }}>
            Welcome, {userProfile.name || "Twyne User"}!
          </h1>
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

        {/* Main Tabbed Interface */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="interests" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Interests</span>
            </TabsTrigger>
            <TabsTrigger value="inner-world" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Inner World</span>
            </TabsTrigger>
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Connection</span>
            </TabsTrigger>
            <TabsTrigger value="story" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Story</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Core info */}
              <Card className="p-6 border border-border bg-card">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">About You</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-4">
                  {/* Basic Facts Section (from reference image) */}
                  <div>
                    <h3 className="font-medium text-muted-foreground">Name</h3>
                    <p className="font-semibold text-lg">{userProfile.name || "Anonymous"}</p>
                  </div>
                  
                  {userProfile.age && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Age</h3>
                      <p>{userProfile.age}</p>
                    </div>
                  )}
                  
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
                  
                  {/* School if available */}
                  {userProfile.school && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Education</h3>
                      <p>{userProfile.school}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Middle column - Vibe Summary */}
              <Card className="col-span-2 border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Vibe Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.vibeSummary || userProfile.oneLinerSummary || "Your personality is multifaceted and unique. You bring your own special energy to social situations and connections."}</p>
                  
                  {/* Twyne Tags */}
                  {tags.length > 0 && (
                    <div className="mt-4">
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
                </CardContent>
              </Card>
            </div>
            
            {/* Key Facts/Background */}
            {userProfile.keyFacts && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Key Facts & Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.keyFacts}</p>
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
            
            {/* Quick insights */}
            {userProfile.socialStyle && (
              <InsightCard insight={userProfile.socialStyle} index={0} />
            )}
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6">
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Interests & Passions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {ensureArray(userProfile.interests).map((interest, i) => (
                    <div 
                      key={i} 
                      className="px-4 py-3 rounded-lg text-sm font-medium"
                      style={{ 
                        backgroundColor: `${userTheme.light}`,
                        color: `${userTheme.dark}`,
                        border: `1px solid ${userTheme.medium}`
                      }}
                    >
                      {interest}
                    </div>
                  ))}
                </div>
                
                {/* Weekly routine and weekend activities */}
                {userProfile.weekendActivities && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">How You Spend Your Time</h3>
                    <p className="text-muted-foreground mb-4">Typical week and weekend activities</p>
                    <p>{userProfile.weekendActivities}</p>
                  </div>
                )}
                
                {/* Favorite Activities */}
                {userProfile.favoriteActivities && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">Favorite Activities</h3>
                    <p>{userProfile.favoriteActivities}</p>
                  </div>
                )}
                
                {userProfile.mediaTastes && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">Media & Cultural Tastes</h3>
                    <p className="text-muted-foreground mb-4">Entertainment and cultural preferences that resonate with you</p>
                    <p>{userProfile.mediaTastes}</p>
                  </div>
                )}
                
                {/* Talking Points */}
                {userProfile.talkingPoints && userProfile.talkingPoints.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">Talking Points</h3>
                    <p className="text-muted-foreground mb-4">Topics you enjoy discussing</p>
                    <div className="flex flex-wrap gap-2">
                      {ensureArray(userProfile.talkingPoints).map((point, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/5 text-secondary">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {userProfile.lookingFor && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">What You're Looking For</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lookingFor}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inner World Tab */}
          <TabsContent value="inner-world" className="space-y-6">
            {/* Personality Chart */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Your Personality Profile</CardTitle>
                <CardDescription>A visual representation of your inner dimensions</CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <PersonalityChart traits={userProfile.personalityTraits || defaultTraits} />
              </CardContent>
            </Card>
            
            {/* Core Values */}
            {(userProfile.coreValues || userProfile.values) && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.coreValues}</p>
                  {ensureArray(userProfile.values).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
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
            
            {/* Philosophy, Belief System, Spirituality */}
            {(userProfile.philosophy || userProfile.beliefSystem || userProfile.spirituality || userProfile.lifePhilosophy) && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Philosophy & Beliefs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.philosophy || userProfile.beliefSystem || userProfile.spirituality || userProfile.lifePhilosophy}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Goals and Aspirations */}
            {(userProfile.goals?.length > 0 || userProfile.aspirations?.length > 0) && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Goals & Aspirations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ensureArray(userProfile.goals).map((goal, i) => (
                      <div key={i} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                        {goal}
                      </div>
                    ))}
                    {ensureArray(userProfile.aspirations).map((aspiration, i) => (
                      <div key={i} className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                        {aspiration}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Personality Details */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Personality Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Big 5 traits representation is handled by the personality chart above */}
                
                {/* Quirks */}
                {userProfile.personalityQuirks?.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Quirks & Unique Traits</h3>
                    <div className="flex flex-wrap gap-2">
                      {ensureArray(userProfile.personalityQuirks).map((quirk, i) => (
                        <Badge key={i} variant="outline" className="bg-accent/5 text-accent">
                          {quirk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Communication Style */}
                {userProfile.communicationStyle && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Communication Style</h3>
                    <p>{userProfile.communicationStyle}</p>
                  </div>
                )}
                
                {/* Boundaries & Pet Peeves */}
                {(userProfile.boundaries || userProfile.petPeeves) && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Boundaries & Pet Peeves</h3>
                    <p>{userProfile.boundaries || ""}</p>
                    {userProfile.boundaries && userProfile.petPeeves && <div className="h-2"></div>}
                    <p>{userProfile.petPeeves || ""}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Personal Insights */}
            {userProfile.personalInsights?.length > 0 && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Key Traits & Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(userProfile.personalInsights).map((trait, i) => (
                      <span 
                        key={i} 
                        className="px-3 py-1.5 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${userTheme.light}`,
                          color: `${userTheme.dark}`,
                          border: `1px solid ${userTheme.medium}`
                        }}
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Vibe Summary if available */}
            {userProfile.vibeSummary && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Inner World Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.vibeSummary}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Story Tab */}
          <TabsContent value="story" className="space-y-6">
            {/* Upbringing */}
            {userProfile.upbringing && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Upbringing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.upbringing}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Major Events & Turning Points */}
            {(userProfile.majorEvents?.length > 0 || userProfile.turningPoints?.length > 0) && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Major Events & Turning Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ensureArray(userProfile.majorEvents).map((event, i) => (
                      <div key={i} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                        {event}
                      </div>
                    ))}
                    {ensureArray(userProfile.turningPoints).map((point, i) => (
                      <div key={i} className="p-3 bg-accent/5 rounded-lg border border-accent/10">
                        {point}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Recent Life Context */}
            {userProfile.recentLifeContext && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Life Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.recentLifeContext}</p>
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
                </CardContent>
              </Card>
            )}
            
            {/* Challenges Overcome */}
            {userProfile.challengesOvercome && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Challenges Overcome</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.challengesOvercome}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Achievements */}
            {userProfile.meaningfulAchievements && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Meaningful Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.meaningfulAchievements}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Background if available */}
            {userProfile.background && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.background}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            {/* Social Style */}
            {userProfile.socialStyle && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Social Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.socialStyle}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Love Language & Friends Style */}
            {(userProfile.loveLanguage || userProfile.friendsStyle) && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">How You Connect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.loveLanguage && (
                    <div>
                      <h3 className="font-medium text-lg mb-2">Love Language</h3>
                      <p>{userProfile.loveLanguage}</p>
                    </div>
                  )}
                  
                  {userProfile.friendsStyle && (
                    <div>
                      <h3 className="font-medium text-lg mb-2">Friendship Style</h3>
                      <p>{userProfile.friendsStyle}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Social Needs */}
            {userProfile.socialNeeds && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Social Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.socialNeeds}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Connection Preferences */}
            {userProfile.connectionPreferences && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Connection Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.connectionPreferences}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Looking For */}
            {userProfile.lookingFor && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">What You're Looking For</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lookingFor}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Friendship Pace if available */}
            {userProfile.friendshipPace && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Friendship Pace</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.friendshipPace}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={() => navigate('/connections')}
            className="px-8 py-6 text-lg"
            style={{ 
              backgroundColor: userTheme.primary,
              color: "white"
            }}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Find My People
          </Button>
        </div>
      </div>
    </div>
  );
};
