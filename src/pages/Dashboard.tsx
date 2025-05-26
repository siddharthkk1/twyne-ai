
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from '@/types/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import InsightCard from '@/components/onboarding/InsightCard';
import ValueCard from '@/components/onboarding/ValueCard';
import PersonalityChart from '@/components/onboarding/PersonalityChart';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Lock, BarChart3, Heart, User, Activity, BookOpen, UserPlus, Lightbulb, Brain } from "lucide-react";
import { CreateAccountPrompt } from '@/components/auth/CreateAccountPrompt';

interface ProfileCompletionDashboardProps {
  userProfile: UserProfile;
}

export const ProfileCompletionDashboard: React.FC<ProfileCompletionDashboardProps> = ({ userProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  
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
    return userProfile.twyneTags || [];
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
                  <p>{userProfile.vibeSummary || "Your personality is multifaceted and unique. You bring your own special energy to social situations and connections."}</p>
                  
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

            {/* Personality Chart */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Your Social Style</CardTitle>
                <CardDescription>Based on our conversation, here's your social style and energy</CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalityChart traits={defaultTraits} />
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
                {userProfile.interestsAndPassions ? (
                  <p>{userProfile.interestsAndPassions}</p>
                ) : (
                  <p>We don't have info on that yet.</p>
                )}
                
                {/* Favorite Activities */}
                {userProfile.favoriteActivities && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">Favorite Activities</h3>
                    <p>{userProfile.favoriteActivities}</p>
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
                <PersonalityChart traits={defaultTraits} />
              </CardContent>
            </Card>
            
            {/* Core Values */}
            {userProfile.coreValues && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.coreValues}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Philosophy, Belief System, Spirituality */}
            {userProfile.lifePhilosophy && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Philosophy & Beliefs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifePhilosophy}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Goals and Aspirations */}
            {userProfile.goals && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Goals & Aspirations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.goals}</p>
                </CardContent>
              </Card>
            )}
            
            {/* Personality Details */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Personality Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Communication Style */}
                {userProfile.communicationStyle && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Communication Style</h3>
                    <p>{userProfile.communicationStyle}</p>
                  </div>
                )}
                
                {/* Boundaries & Pet Peeves */}
                {userProfile.boundariesAndPetPeeves && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Boundaries & Pet Peeves</h3>
                    <p>{userProfile.boundariesAndPetPeeves}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
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
            {userProfile.majorTurningPoints && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Major Events & Turning Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.majorTurningPoints}</p>
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
            {userProfile.loveLanguageOrFriendStyle && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">How You Connect</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.loveLanguageOrFriendStyle}</p>
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
          </TabsContent>
        </Tabs>
        
        {/* Create Account Section - replaces Find My People button */}
        <div className="flex justify-center mt-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <UserPlus className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Save Your Profile</h3>
                <p className="text-muted-foreground">
                  Create an account to save your insights and access all Twyne features.
                </p>
                <Button 
                  onClick={() => setShowCreateAccount(true)}
                  className="w-full"
                  style={{ 
                    backgroundColor: userTheme.primary,
                    color: "white"
                  }}
                >
                  <UserPlus className="mr-2 h-5 w-5" />
                  Create Account to Save Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Account Dialog */}
      <CreateAccountPrompt 
        open={showCreateAccount} 
        onOpenChange={setShowCreateAccount}
        onboardingProfileData={userProfile}
      />
    </div>
  );
};

export default ProfileCompletionDashboard;
