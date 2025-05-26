
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, BarChart3, Heart, User, Activity, BookOpen, Brain, Sparkles, Edit, Settings, MessageSquare, Music, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PersonalityChart from "@/components/onboarding/PersonalityChart";

interface UserProfile {
  vibeSummary?: string;
  oneLiner?: string;
  twyneTags?: string[];
  name?: string;
  age?: string;
  location?: string;
  job?: string;
  school?: string;
  ethnicity?: string;
  religion?: string;
  hometown?: string;
  lifestyle?: string;
  favoriteProducts?: string;
  style?: string;
  interestsAndPassions?: string;
  favoriteMoviesAndShows?: string;
  favoriteMusic?: string;
  favoriteBooks?: string;
  favoritePodcastsOrYouTube?: string;
  talkingPoints?: string[];
  favoriteActivities?: string;
  favoriteSpots?: string;
  coreValues?: string;
  lifePhilosophy?: string;
  goals?: string;
  personalitySummary?: string;
  bigFiveTraits?: {
    openness?: string;
    conscientiousness?: string;
    extraversion?: string;
    agreeableness?: string;
    neuroticism?: string;
  };
  quirks?: string;
  communicationStyle?: string;
  upbringing?: string;
  majorTurningPoints?: string;
  recentLifeContext?: string;
  socialStyle?: string;
  loveLanguageOrFriendStyle?: string;
  socialNeeds?: string;
  connectionPreferences?: string;
  dealBreakers?: string;
  boundariesAndPetPeeves?: string;
  connectionActivities?: string;
  personalityTraits?: any;
}

const Mirror = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{id: number, message: string, sender: 'user' | 'ai'}>>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching user profile for user ID:", user.id);
        
        // Get the most recent user_data entry for this user
        const { data, error } = await supabase
          .from('user_data')
          .select('profile_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } else if (data?.profile_data) {
          console.log("Raw profile data from database:", data.profile_data);
          
          // Handle the profile data properly - it should be the direct object
          const profileData = data.profile_data as UserProfile;
          console.log("Processed profile data:", profileData);
          
          setUserProfile(profileData);
        } else {
          console.log("No profile data found for user");
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleChatSubmit = () => {
    if (!chatMessage.trim()) return;
    
    const newMessage = {
      id: chatHistory.length + 1,
      message: chatMessage,
      sender: 'user' as const
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage("");
    
    // Simulate AI response (you can connect to your AI endpoint here)
    setTimeout(() => {
      const aiResponse = {
        id: chatHistory.length + 2,
        message: "Thanks for the update! I'll help you refine your mirror with this new information.",
        sender: 'ai' as const
      };
      setChatHistory(prev => [...prev, aiResponse]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your mirror...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to view your mirror.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>No Profile Found</CardTitle>
            <CardDescription>Complete the onboarding process to create your mirror.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const displayName = userProfile?.name || "User";
  const firstName = displayName.split(' ')[0];

  // Generate a color palette based on the user's name
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
    return userProfile.twyneTags || [];
  };

  const tags = getTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
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
              Your Mirror, {firstName}
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This is your personal mirror - a reflection of who you are based on our conversation.
            </p>
          </div>

          {/* Privacy Notice */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Privacy Guarantee</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This mirror is private and only visible to you. Twyne will never share your information with other users without your explicit permission.
            </p>
          </div>

          {/* Main Tabbed Interface */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-8 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="vibe" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Vibe</span>
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
              <TabsTrigger value="edit" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Connect</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Vibe Summary */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Vibe Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.vibeSummary || "We don't have info on that yet."}</p>
                </CardContent>
              </Card>

              {/* One Liner */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">One Liner</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">{userProfile.oneLiner || "We don't have info on that yet."}</p>
                </CardContent>
              </Card>

              {/* Twyne Tags */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Twyne Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5 text-primary">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p>We don't have info on that yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Key Facts & Background */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Key Facts & Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-muted-foreground">Name</h3>
                      <p className="font-semibold">{displayName || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">Age</h3>
                      <p>{userProfile.age || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">Location</h3>
                      <p>{userProfile.location || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">Job</h3>
                      <p>{userProfile.job || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">School</h3>
                      <p>{userProfile.school || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">Ethnicity</h3>
                      <p>{userProfile.ethnicity || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">Religion</h3>
                      <p>{userProfile.religion || "We don't have info on that yet."}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-muted-foreground">Hometown</h3>
                      <p>{userProfile.hometown || "We don't have info on that yet."}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vibe Tab */}
            <TabsContent value="vibe" className="space-y-6">
              {/* Personality Summary */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Personality Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.personalitySummary || "We don't have info on that yet."}</p>
                </CardContent>
              </Card>

              {/* Big Five Traits */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Big Five Traits</CardTitle>
                  <CardDescription>Your personality dimensions mapped across the Big Five model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {userProfile.bigFiveTraits?.openness ? (
                    <div>
                      <h3 className="font-medium mb-2">Openness</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.openness}</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium mb-2">Openness</h3>
                      <p className="text-sm text-muted-foreground">We don't have info on that yet.</p>
                    </div>
                  )}
                  
                  {userProfile.bigFiveTraits?.conscientiousness ? (
                    <div>
                      <h3 className="font-medium mb-2">Conscientiousness</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.conscientiousness}</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium mb-2">Conscientiousness</h3>
                      <p className="text-sm text-muted-foreground">We don't have info on that yet.</p>
                    </div>
                  )}
                  
                  {userProfile.bigFiveTraits?.extraversion ? (
                    <div>
                      <h3 className="font-medium mb-2">Extraversion</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.extraversion}</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium mb-2">Extraversion</h3>
                      <p className="text-sm text-muted-foreground">We don't have info on that yet.</p>
                    </div>
                  )}
                  
                  {userProfile.bigFiveTraits?.agreeableness ? (
                    <div>
                      <h3 className="font-medium mb-2">Agreeableness</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.agreeableness}</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium mb-2">Agreeableness</h3>
                      <p className="text-sm text-muted-foreground">We don't have info on that yet.</p>
                    </div>
                  )}
                  
                  {userProfile.bigFiveTraits?.neuroticism ? (
                    <div>
                      <h3 className="font-medium mb-2">Neuroticism</h3>
                      <p className="text-sm text-muted-foreground">{userProfile.bigFiveTraits.neuroticism}</p>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-medium mb-2">Neuroticism</h3>
                      <p className="text-sm text-muted-foreground">We don't have info on that yet.</p>
                    </div>
                  )}

                  {userProfile.personalityTraits && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Personality Visualization</h3>
                      <PersonalityChart traits={userProfile.personalityTraits || defaultTraits} />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Style */}
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.style || "We don't have info on that yet."}</p>
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
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Upbringing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.upbringing || "We don't have info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Major Turning Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.majorTurningPoints || "We don't have info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Life Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.recentLifeContext || "We don't have info on that yet."}</p>
                </CardContent>
              </Card>
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

            {/* Edit Tab */}
            <TabsContent value="edit" className="space-y-6">
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Chat with Your Mirror</CardTitle>
                  <CardDescription>Tell your mirror about updates to your life, and it will help refine your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-64 border rounded-lg p-4 overflow-y-auto bg-muted/20">
                      {chatHistory.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">
                          Start a conversation with your mirror! Tell it about recent changes in your life, new interests, or anything you'd like to update.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {chatHistory.map((chat) => (
                            <div
                              key={chat.id}
                              className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[80%] p-3 rounded-lg ${
                                  chat.sender === 'user'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background border'
                                }`}
                              >
                                <p className="text-sm">{chat.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Textarea
                        placeholder="Tell your mirror about updates to your life..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSubmit();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleChatSubmit} disabled={!chatMessage.trim()}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* New Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Connect Your Accounts</CardTitle>
                  <CardDescription>Link your music and video accounts to enhance your mirror</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Music className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">Spotify</h3>
                          <p className="text-sm text-muted-foreground">Connect your music taste and listening habits</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Connect
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Video className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">YouTube</h3>
                          <p className="text-sm text-muted-foreground">Connect your video preferences and subscriptions</p>
                        </div>
                      </div>
                      <Button variant="outline">
                        Connect
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-muted/20 rounded-lg">
                    <h4 className="font-medium mb-2">Coming Soon</h4>
                    <p className="text-sm text-muted-foreground">
                      More integrations like Instagram, Twitter, and Netflix are coming soon to make your mirror even more accurate.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Mirror;
