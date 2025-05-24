import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserProfile } from '@/types/chat';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, BarChart3, Heart, User, Activity, BookOpen, Brain } from "lucide-react";
import PersonalityChart from './PersonalityChart';

interface ProfileCompletionDashboardProps {
  userProfile: UserProfile;
  userName?: string;
}

export const ProfileCompletionDashboard: React.FC<ProfileCompletionDashboardProps> = ({ userProfile, userName }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use the passed userName first, then fall back to userProfile.name, then default
  const displayName = userName || userProfile?.name || "User";
  const firstName = displayName.split(' ')[0];
  
  // Add debugging
  useEffect(() => {
    console.log("ProfileCompletionDashboard received:");
    console.log("- userName:", userName);
    console.log("- userProfile:", userProfile);
    console.log("- displayName:", displayName);
    console.log("- userProfile.vibeSummary:", userProfile?.vibeSummary);
    console.log("- userProfile.twyneTags:", userProfile?.twyneTags);
  }, [userProfile, userName, displayName]);
  
  // Generate a color palette based on the user's name or interests
  const generateUserThemeColor = () => {
    const nameString = displayName;
    const hashedName = nameString.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const hue = hashedName % 360;
    
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
  
  // Helper function to ensure arrays
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
            Welcome, {firstName}!
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
            <TabsTrigger value="story" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Story</span>
            </TabsTrigger>
            <TabsTrigger value="connection" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Connection</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Vibe Summary */}
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

            {/* One Liner */}
            {userProfile.oneLiner && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">One Liner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{userProfile.oneLiner}</p>
                </CardContent>
              </Card>
            )}

            {/* Twyne Tags */}
            {tags.length > 0 && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Twyne Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <Badge key={i} variant="outline" className="bg-primary/5 text-primary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Facts & Background */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Key Facts & Background</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayName && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Name</h3>
                      <p className="font-semibold">{displayName}</p>
                    </div>
                  )}
                  
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
                  
                  {userProfile.job && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Job</h3>
                      <p>{userProfile.job}</p>
                    </div>
                  )}
                  
                  {userProfile.school && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">School</h3>
                      <p>{userProfile.school}</p>
                    </div>
                  )}
                  
                  {userProfile.ethnicity && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Ethnicity</h3>
                      <p>{userProfile.ethnicity}</p>
                    </div>
                  )}
                  
                  {userProfile.religion && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Religion</h3>
                      <p>{userProfile.religion}</p>
                    </div>
                  )}
                  
                  {userProfile.hometown && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Hometown</h3>
                      <p>{userProfile.hometown}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Interests & Lifestyle Tab */}
          <TabsContent value="interests" className="space-y-6">
            {userProfile.lifestyle && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Lifestyle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifestyle}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.favoriteProducts && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteProducts}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.style && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.style}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.interestsAndPassions && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Interests & Passions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.interestsAndPassions}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.mediaTastes && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Media & Cultural Tastes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.mediaTastes}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.favoriteMoviesAndShows && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Movies & Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteMoviesAndShows}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.favoriteMusic && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Music</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteMusic}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.favoriteBooks && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteBooks}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.favoritePodcastsOrYouTube && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Podcasts or YouTube</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoritePodcastsOrYouTube}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.talkingPoints && userProfile.talkingPoints.length > 0 && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Talking Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(userProfile.talkingPoints).map((point, i) => (
                      <Badge key={i} variant="outline" className="bg-secondary/5 text-secondary">
                        {point}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {userProfile.favoriteActivities && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteActivities}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.favoriteSpots && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Spots</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteSpots}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inner World Tab */}
          <TabsContent value="inner-world" className="space-y-6">
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

            {userProfile.lifePhilosophy && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Life Philosophy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifePhilosophy}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.goals && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.goals}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.personalitySummary && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Personality Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.personalitySummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Big Five Traits */}
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Big Five Traits</CardTitle>
                <CardDescription>Your personality dimensions mapped across the Big Five model</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userProfile.bigFiveTraits?.openness && (
                  <div>
                    <h3 className="font-medium mb-2">Openness</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.openness}</p>
                  </div>
                )}
                
                {userProfile.bigFiveTraits?.conscientiousness && (
                  <div>
                    <h3 className="font-medium mb-2">Conscientiousness</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.conscientiousness}</p>
                  </div>
                )}
                
                {userProfile.bigFiveTraits?.extraversion && (
                  <div>
                    <h3 className="font-medium mb-2">Extraversion</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.extraversion}</p>
                  </div>
                )}
                
                {userProfile.bigFiveTraits?.agreeableness && (
                  <div>
                    <h3 className="font-medium mb-2">Agreeableness</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.agreeableness}</p>
                  </div>
                )}
                
                {userProfile.bigFiveTraits?.neuroticism && (
                  <div>
                    <h3 className="font-medium mb-2">Neuroticism</h3>
                    <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.neuroticism}</p>
                  </div>
                )}

                {/* Visual representation if we have numeric personality traits */}
                {userProfile.personalityTraits && (
                  <div className="mt-6">
                    <h3 className="font-medium mb-4">Personality Visualization</h3>
                    <PersonalityChart traits={userProfile.personalityTraits || defaultTraits} />
                  </div>
                )}
              </CardContent>
            </Card>

            {userProfile.quirks && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Quirks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.quirks}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.communicationStyle && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Communication Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.communicationStyle}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Story Tab */}
          <TabsContent value="story" className="space-y-6">
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

            {userProfile.majorTurningPoints && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Major Turning Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.majorTurningPoints}</p>
                </CardContent>
              </Card>
            )}

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

            {userProfile.loveLanguageOrFriendStyle && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Love Language or Friend Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.loveLanguageOrFriendStyle}</p>
                </CardContent>
              </Card>
            )}

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

            {userProfile.dealBreakers && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Dealbreakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.dealBreakers}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.boundariesAndPetPeeves && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Boundaries & Pet Peeves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.boundariesAndPetPeeves}</p>
                </CardContent>
              </Card>
            )}

            {userProfile.connectionActivities && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Connection Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.connectionActivities}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
