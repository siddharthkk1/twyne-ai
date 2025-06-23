import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, BarChart3, Heart, User, Activity, BookOpen, Brain, Sparkles, Settings, MessageSquare, Send, RotateCcw, Youtube, Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PersonalityChart from "@/components/onboarding/PersonalityChart";
import AccountConnectionButtons from "@/components/connections/AccountConnectionButtons";
import SpotifyDataCard from "@/components/mirror/SpotifyDataCard";
import YouTubeDataCard from "@/components/mirror/YouTubeDataCard";
import { getMirrorChatResponse, updateProfileFromChat } from "@/utils/aiUtils";
import { toast } from "sonner";
import { UserProfile } from "@/types/chat";
import { MirrorDataService } from "@/services/mirrorDataService";
import { Link } from "react-router-dom";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";

const Mirror = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{id: number, message: string, sender: 'user' | 'ai'}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [spotifyData, setSpotifyData] = useState(null);
  const [youtubeData, setYoutubeData] = useState(null);

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
        
        // Safely handle the profile data - cast through unknown first
        const profileData = data.profile_data as unknown as UserProfile;
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

  const fetchConnectionData = async () => {
    if (!user) {
      // For anonymous users, check localStorage only
      const storedSpotifyData = localStorage.getItem('spotify_data');
      const storedYouTubeData = localStorage.getItem('youtube_data');
      
      if (storedSpotifyData) {
        try {
          const parsed = JSON.parse(storedSpotifyData);
          console.log('Loaded Spotify data from localStorage (anonymous):', parsed);
          setSpotifyData(parsed);
        } catch (error) {
          console.error('Error parsing Spotify data from localStorage:', error);
        }
      }
      
      if (storedYouTubeData) {
        try {
          const parsed = JSON.parse(storedYouTubeData);
          console.log('Loaded YouTube data from localStorage (anonymous):', parsed);
          setYoutubeData(parsed);
        } catch (error) {
          console.error('Error parsing YouTube data from localStorage:', error);
        }
      }
      return;
    }

    try {
      // Load persisted connection data from database
      const connectionData = await MirrorDataService.loadConnectionData();
      
      console.log('Loaded connection data:', connectionData);
      
      if (connectionData.spotify) {
        setSpotifyData(connectionData.spotify);
        // Also store in localStorage for immediate access
        localStorage.setItem('spotify_data', JSON.stringify(connectionData.spotify));
      }
      
      if (connectionData.youtube) {
        setYoutubeData(connectionData.youtube);
        // Also store in localStorage for immediate access
        localStorage.setItem('youtube_data', JSON.stringify(connectionData.youtube));
      }
    } catch (error) {
      console.error('Error fetching connection data:', error);
      
      // Fallback to localStorage
      const storedSpotifyData = localStorage.getItem('spotify_data');
      const storedYouTubeData = localStorage.getItem('youtube_data');
      
      if (storedSpotifyData) {
        try {
          const parsed = JSON.parse(storedSpotifyData);
          console.log('Fallback: Loaded Spotify data from localStorage:', parsed);
          setSpotifyData(parsed);
        } catch (error) {
          console.error('Error parsing Spotify data from localStorage:', error);
        }
      }
      
      if (storedYouTubeData) {
        try {
          const parsed = JSON.parse(storedYouTubeData);
          console.log('Fallback: Loaded YouTube data from localStorage:', parsed);
          setYoutubeData(parsed);
        } catch (error) {
          console.error('Error parsing YouTube data from localStorage:', error);
        }
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchConnectionData();
  }, [user]);

  // Re-fetch connection data when returning to the page
  useEffect(() => {
    const handleFocus = () => {
      console.log('Page focused, re-fetching connection data');
      fetchConnectionData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const handleChatSubmit = async () => {
    if (!chatMessage.trim() || isTyping) return;
    
    const newMessage = {
      id: chatHistory.length + 1,
      message: chatMessage,
      sender: 'user' as const
    };
    
    setChatHistory(prev => [...prev, newMessage]);
    setChatMessage("");
    setIsTyping(true);
    
    try {
      // Create conversation object for AI with proper structure
      const conversation = {
        messages: [
          ...chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.message
          })),
          {
            role: 'user' as const,
            content: chatMessage
          }
        ],
        userAnswers: chatHistory
          .filter(msg => msg.sender === 'user')
          .map(msg => msg.message)
          .concat([chatMessage])
      };

      const aiResponse = await getMirrorChatResponse(conversation);
      
      const aiMessage = {
        id: chatHistory.length + 2,
        message: aiResponse,
        sender: 'ai' as const
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast.error("Failed to get response. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (chatHistory.length === 0) {
      toast.error("No conversation to update from.");
      return;
    }

    setIsUpdating(true);
    
    try {
      // Create conversation object for profile update with proper structure
      const conversation = {
        messages: chatHistory.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: msg.message
        })),
        userAnswers: chatHistory
          .filter(msg => msg.sender === 'user')
          .map(msg => msg.message)
      };

      const result = await updateProfileFromChat(conversation);
      
      if (result.success) {
        toast.success(result.message);
        // Clear chat history after successful update
        setChatHistory([]);
        // Refetch user profile to show updated data
        await fetchUserProfile();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    toast.success("Chat cleared!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-slate-600 text-lg">Loading your mirror...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-slate-800">Authentication Required</CardTitle>
            <CardDescription className="text-slate-600">Please log in to view your mirror.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-slate-800">No Profile Found</CardTitle>
            <CardDescription className="text-slate-600">Complete the onboarding process to create your mirror.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const displayName = userProfile?.name || "User";
  const firstName = displayName.split(' ')[0];

  // Generate a sophisticated color palette based on the user's name
  const generateUserThemeColor = () => {
    const nameString = displayName;
    const hashedName = nameString.split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const hue = hashedName % 360;
    
    return {
      primary: `hsl(${hue}, 70%, 55%)`,
      secondary: `hsl(${(hue + 30) % 360}, 60%, 60%)`,
      tertiary: `hsl(${(hue + 60) % 360}, 50%, 65%)`,
      light: `hsl(${hue}, 40%, 96%)`,
      medium: `hsl(${hue}, 30%, 92%)`,
      dark: `hsl(${hue}, 60%, 25%)`,
      accent: `hsl(${(hue + 180) % 360}, 50%, 50%)`
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Mirror</span>
            </Link>
            <div className="text-sm text-slate-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="flex flex-col gap-8">
          {/* Modern Hero Section */}
          <div className="relative overflow-hidden">
            <div 
              className="rounded-2xl p-8 md:p-12 text-center relative"
              style={{ 
                background: `linear-gradient(135deg, ${userTheme.light} 0%, ${userTheme.medium} 50%, white 100%)`,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-white/40 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                  <Sparkles className="h-4 w-4" style={{ color: userTheme.primary }} />
                  <span className="text-sm font-medium text-slate-700">Your Personal Mirror</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Welcome back, {firstName}
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                  Your evolving digital reflection - a sophisticated view of who you are, 
                  powered by our conversations and your connected experiences.
                </p>
              </div>
            </div>
          </div>

          {/* Enhanced Privacy Notice */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-emerald-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Lock className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Privacy Guaranteed</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Your mirror is completely private and secured. We use enterprise-grade encryption 
                    and will never share your personal information with other users without explicit consent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modern Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setActiveTab("edit")}
              className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "edit" 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                  : "border-slate-200 hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat with Mirror
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab("integrations")}
              className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                activeTab === "integrations" 
                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                  : "border-slate-200 hover:border-primary/50 hover:shadow-md"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Connect Accounts
            </Button>
          </div>

          {/* Enhanced Tabbed Interface */}
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 mb-8 bg-white/60 backdrop-blur-sm p-1 rounded-xl shadow-lg border-0">
              <TabsTrigger value="overview" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="vibe" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Vibe</span>
              </TabsTrigger>
              <TabsTrigger value="interests" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Interests</span>
              </TabsTrigger>
              <TabsTrigger value="inner-world" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">Inner World</span>
              </TabsTrigger>
              <TabsTrigger value="story" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Story</span>
              </TabsTrigger>
              <TabsTrigger value="connection" className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Connection</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Modern Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                      </div>
                      Vibe Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">{userProfile.vibeSummary || "We're still getting to know you better."}</p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                      </div>
                      One Liner
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-medium text-slate-800 italic leading-relaxed">
                      "{userProfile.oneLiner || "Your story is still being written..."}"
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Twyne Tags */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg">
                      <Activity className="h-5 w-5 text-emerald-600" />
                    </div>
                    Your Twyne Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, i) => (
                        <Badge 
                          key={i} 
                          variant="outline" 
                          className="px-3 py-1 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 text-primary hover:bg-primary/10 transition-colors"
                        >
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500">Share more about yourself to discover your unique tags.</p>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced Key Facts */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg">
                      <User className="h-5 w-5 text-amber-600" />
                    </div>
                    Key Facts & Background
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { label: "Name", value: displayName, icon: "👤" },
                      { label: "Age", value: userProfile.age, icon: "🎂" },
                      { label: "Location", value: userProfile.location, icon: "📍" },
                      { label: "Job", value: userProfile.job, icon: "💼" },
                      { label: "School", value: userProfile.school, icon: "🎓" },
                      { label: "Ethnicity", value: userProfile.ethnicity, icon: "🌍" },
                      { label: "Religion", value: userProfile.religion, icon: "🕊️" },
                      { label: "Hometown", value: userProfile.hometown, icon: "🏠" }
                    ].map((item) => (
                      <div key={item.label} className="p-4 bg-slate-50/50 rounded-xl">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <div>
                            <h3 className="font-medium text-slate-500 text-sm mb-1">{item.label}</h3>
                            <p className="font-semibold text-slate-800">{item.value || "Not specified"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Vibe Tab */}
            <TabsContent value="vibe" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Personality Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.personalitySummary || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Big Five Traits</CardTitle>
                  <CardDescription>Your personality dimensions mapped across the Big Five model</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Openness</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.bigFiveTraits?.openness || "We don't have enough info on that yet."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Conscientiousness</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.bigFiveTraits?.conscientiousness || "We don't have enough info on that yet."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Extraversion</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.bigFiveTraits?.extraversion || "We don't have enough info on that yet."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Agreeableness</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.bigFiveTraits?.agreeableness || "We don't have enough info on that yet."}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Neuroticism</h3>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.bigFiveTraits?.neuroticism || "We don't have enough info on that yet."}
                    </p>
                  </div>

                  {userProfile.personalityTraits && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-4">Personality Visualization</h3>
                      <PersonalityChart traits={userProfile.personalityTraits || defaultTraits} />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.style || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Quirks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.quirks || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Communication Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.communicationStyle || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interests & Lifestyle Tab */}
            <TabsContent value="interests" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Lifestyle</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifestyle || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteProducts || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Interests & Passions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.interestsAndPassions || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Movies & Shows</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteMoviesAndShows || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              {/* Music Section with Spotify Data Card inside */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Music</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Spotify Profile Subsection */}
                  <div className="rounded-lg p-4 bg-muted/20">
                    <SpotifyDataCard data={spotifyData} />
                  </div>
                  
                  {/* Traditional Text Data */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Additional Music Preferences</h3>
                    <p className="text-muted-foreground">
                      {userProfile.favoriteMusic || "We don't have enough info on that yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteBooks || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              {/* Online Content Consumption Section */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Online Content Consumption
                  </CardTitle>
                  <CardDescription>Your viewing habits and content preferences across platforms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* YouTube Profile Subsection */}
                  <YouTubeDataCard data={youtubeData} />

                  {/* Traditional Text Data */}
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-3">Favorite Podcasts or YouTube</h3>
                    <p className="text-muted-foreground">
                      {userProfile.favoritePodcastsOrYouTube || "We don't have enough info on that yet."}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Talking Points</CardTitle>
                </CardHeader>
                <CardContent>
                  {userProfile.talkingPoints && userProfile.talkingPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {ensureArray(userProfile.talkingPoints).map((point, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/5 text-secondary">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p>We don't have enough info on that yet.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteActivities || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Favorite Spots</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.favoriteSpots || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inner World Tab */}
            <TabsContent value="inner-world" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.coreValues || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Life Philosophy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.lifePhilosophy || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.goals || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Political Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.politicalViews || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Personal Beliefs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.personalBeliefs || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Story Tab */}
            <TabsContent value="story" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Upbringing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.upbringing || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Major Turning Points</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.majorTurningPoints || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Recent Life Context</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.recentLifeContext || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connection Tab */}
            <TabsContent value="connection" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Social Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.socialStyle || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Love Language or Friend Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.loveLanguageOrFriendStyle || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Social Needs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.socialNeeds || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Connection Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.connectionPreferences || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Dealbreakers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.dealBreakers || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Boundaries & Pet Peeves</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.boundariesAndPetPeeves || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Connection Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{userProfile.connectionActivities || "We don't have enough info on that yet."}</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Chat Tab */}
            <TabsContent value="edit" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    Chat with Your Mirror
                  </CardTitle>
                  <CardDescription>Tell your mirror about updates to your life, and it will help refine your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-96 border rounded-xl p-4 overflow-y-auto bg-slate-50/50">
                      {chatHistory.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center max-w-md">
                            <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 leading-relaxed">
                              Start a conversation with your mirror! Tell it about recent changes in your life, 
                              new interests, or anything you'd like to update.
                            </p>
                          </div>
                        </div>
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
                                    : 'bg-white border shadow-sm'
                                }`}
                              >
                                <p className="text-sm">{chat.message}</p>
                              </div>
                            </div>
                          ))}
                          {isTyping && (
                            <div className="flex justify-start">
                              <div className="bg-white border shadow-sm p-3 rounded-lg max-w-[80%]">
                                <p className="text-sm text-muted-foreground">Twyne is thinking...</p>
                              </div>
                            </div>
                          )}
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
                        className="flex-1 rounded-xl border-slate-200"
                        disabled={isTyping}
                      />
                      <div className="flex flex-col gap-2">
                        <Button onClick={handleChatSubmit} disabled={!chatMessage.trim() || isTyping} className="rounded-xl">
                          <Send className="h-4 w-4" />
                        </Button>
                        {chatHistory.length > 0 && (
                          <>
                            <Button
                              onClick={handleUpdateProfile}
                              disabled={isUpdating}
                              variant="default"
                              className="bg-emerald-600 hover:bg-emerald-700 rounded-xl"
                            >
                              {isUpdating ? "Updating..." : "Update Profile"}
                            </Button>
                            <Button
                              onClick={clearChatHistory}
                              variant="outline"
                              size="sm"
                              className="rounded-xl"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Integrations Tab */}
            <TabsContent value="integrations" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600" />
                    </div>
                    Connect Your Accounts
                  </CardTitle>
                  <CardDescription>Link your music and video accounts to enhance your mirror</CardDescription>
                </CardHeader>
                <CardContent>
                  <AccountConnectionButtons />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Integrated Feedback Button */}
      <FeedbackButton />
    </div>
  );
};

export default Mirror;
