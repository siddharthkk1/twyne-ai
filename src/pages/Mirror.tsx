
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User, Lock, Edit3, Brain, Heart, Activity, RefreshCw, Music, Youtube } from "lucide-react";
import { getMirrorChatResponse } from "@/utils/aiUtils";
import { Message, Conversation, ChatRole } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import PersonalityChart from "@/components/onboarding/PersonalityChart";
import { supabase } from "@/integrations/supabase/client";

const Mirror = () => {
  const { user, profile } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const [conversation, setConversation] = useState<Conversation>({
    messages: [
      { 
        role: "system" as ChatRole, 
        content: "You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values. The user will tell you what they want to change or update. Your job is to: Listen carefully and understand the essence of what they're saying. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes). Reflect back a concise summary of the proposed changes and ask for confirmation before applying them. Ask a clarifying follow-up only if necessary to make the update accurate. Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent." 
      }
    ],
    userAnswers: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user profile data on component mount
  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;
      
      try {
        const { data: userData } = await supabase
          .from('user_data')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (userData?.profile_data) {
          setProfileData(userData.profile_data);
        }
      } catch (error) {
        console.error("Error loading profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [user]);
  
  // Get user's actual first name
  const getUserFirstName = () => {
    if (profileData.name) {
      return profileData.name.split(' ')[0];
    }
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    return user?.email?.split('@')[0] || "Your";
  };

  // Generate a color palette based on the user's name
  const generateUserThemeColor = () => {
    const nameString = profile?.full_name || profile?.username || "Twyne User";
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

  // Extract tags
  const getTags = () => {
    return profileData.twyneTags || [];
  };

  const tags = getTags();

  // Initialize with a greeting from the AI when switching to edit tab
  useEffect(() => {
    const initializeConversation = async () => {
      if (activeTab !== "edit") return;
      
      // Reset conversation when entering edit tab
      setMessages([]);
      setConversation({
        messages: [
          { 
            role: "system" as ChatRole, 
            content: "You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values. The user will tell you what they want to change or update. Your job is to: Listen carefully and understand the essence of what they're saying. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes). Reflect back a concise summary of the proposed changes and ask for confirmation before applying them. Ask a clarifying follow-up only if necessary to make the update accurate. Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent." 
          }
        ],
        userAnswers: []
      });
      
      setIsTyping(true);
      
      const userName = getUserFirstName();
      
      const initialPrompt = `
        The user's name is ${userName}. 
        Here's what I know about them: ${JSON.stringify(profileData)}
        Greet them warmly and let them know you're here to help them update their Mirror - their personal profile that captures who they are. Explain that they can tell you what they'd like to change about themselves or their profile, and you'll help them update it thoughtfully.
      `;
      
      try {
        const tempConversation = {
          messages: [
            { 
              role: "system" as ChatRole, 
              content: "You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values. The user will tell you what they want to change or update. Your job is to: Listen carefully and understand the essence of what they're saying. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes). Reflect back a concise summary of the proposed changes and ask for confirmation before applying them. Ask a clarifying follow-up only if necessary to make the update accurate. Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent." 
            },
            { role: "user" as ChatRole, content: initialPrompt }
          ],
          userAnswers: []
        };
        
        const response = await getMirrorChatResponse(tempConversation);
        
        const aiMessage: Message = {
          id: 1,
          sender: "ai",
          text: response
        };
        
        setMessages([aiMessage]);
        
        setConversation({
          messages: [
            { 
              role: "system" as ChatRole, 
              content: "You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values. The user will tell you what they want to change or update. Your job is to: Listen carefully and understand the essence of what they're saying. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes). Reflect back a concise summary of the proposed changes and ask for confirmation before applying them. Ask a clarifying follow-up only if necessary to make the update accurate. Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent." 
            },
            { role: "assistant" as ChatRole, content: response }
          ],
          userAnswers: []
        });
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        toast({
          title: "Error",
          description: "Failed to start the conversation. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsTyping(false);
      }
    };
    
    if (user && !isLoading) {
      initializeConversation();
    }
  }, [user, activeTab, isLoading, profileData]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    const updatedConversation = {
      ...conversation,
      messages: [
        ...conversation.messages,
        { role: "user" as ChatRole, content: input }
      ],
      userAnswers: [...conversation.userAnswers, input]
    };
    
    try {
      const aiResponse = await getMirrorChatResponse(updatedConversation);
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai"
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      setConversation({
        messages: [
          ...updatedConversation.messages,
          { role: "assistant" as ChatRole, content: aiResponse }
        ],
        userAnswers: updatedConversation.userAnswers
      });
      
    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (conversation.userAnswers.length === 0) {
      toast({
        title: "No conversation to analyze",
        description: "Please have a conversation first before updating your profile.",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Create a prompt to analyze the conversation and update the user profile
      const updatePrompt = `
        Based on the following conversation between the user and Twyne, analyze what changes should be made to the user's profile data. 
        
        Current profile data: ${JSON.stringify(profileData)}
        
        Conversation messages: ${JSON.stringify(conversation.messages.filter(m => m.role !== 'system'))}
        
        Please return a JSON object with only the fields that should be updated or added to the user's profile. Do not include fields that haven't changed. Focus on personality traits, interests, values, social style, connection preferences, lifestyle changes, goals, or any other meaningful updates mentioned in the conversation.
        
        Return only valid JSON without any markdown formatting or additional text.
      `;

      const updateConversation = {
        messages: [
          { role: "system" as ChatRole, content: "You are an AI that analyzes conversations and extracts profile updates. Return only valid JSON." },
          { role: "user" as ChatRole, content: updatePrompt }
        ],
        userAnswers: []
      };

      const updateResponse = await getMirrorChatResponse(updateConversation);
      
      // Parse the AI response to get the updates
      let profileUpdates;
      try {
        profileUpdates = JSON.parse(updateResponse);
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        toast({
          title: "Update failed",
          description: "Failed to parse profile updates. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Merge the updates with existing profile data
      const updatedProfileData = { ...profileData, ...profileUpdates };

      // Save to database
      const { error } = await supabase
        .from('user_data')
        .update({
          profile_data: updatedProfileData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user?.id);

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profile updated successfully",
          description: "Your Mirror has been updated based on your conversation.",
        });
        
        // Update local state
        setProfileData(updatedProfileData);
        
        // Reset conversation after successful update
        setMessages([]);
        setConversation({
          messages: [
            { 
              role: "system" as ChatRole, 
              content: "You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values. The user will tell you what they want to change or update. Your job is to: Listen carefully and understand the essence of what they're saying. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes). Reflect back a concise summary of the proposed changes and ask for confirmation before applying them. Ask a clarifying follow-up only if necessary to make the update accurate. Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent." 
            }
          ],
          userAnswers: []
        });
        
        // Switch back to overview tab to see updates
        setActiveTab("overview");
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading your mirror...</h2>
          <p className="text-muted-foreground">Please wait while we prepare your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
        {/* Header with personalized greeting - Glassmorphic styling */}
        <div 
          className="text-center p-8 rounded-xl mb-8 backdrop-blur-md bg-white/10 border border-white/20 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))`,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            {getUserFirstName()}'s Mirror
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your personal profile that captures who you are. This information is private and only visible to you.
          </p>
        </div>

        {/* Privacy Notice - Glassmorphic styling */}
        <div className="backdrop-blur-md bg-primary/5 rounded-lg p-4 border border-primary/20 max-w-3xl mx-auto mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-primary" />
            <h3 className="font-medium">Privacy Guarantee</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            This profile is private and only visible to you. Twyne will never share your information with other users without your explicit permission.
          </p>
        </div>

        {/* Main Tabbed Interface - Glassmorphic styling */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-8 backdrop-blur-md bg-white/10 border border-white/20">
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
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Vibe Summary - Glassmorphic Card */}
            {profileData.vibeSummary && (
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Your Vibe</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg leading-relaxed">{profileData.vibeSummary}</p>
                  
                  {/* Twyne Tags */}
                  {tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-muted-foreground mb-3">Twyne Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Key Facts */}
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Key Facts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.name && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">Name</h4>
                      <p>{profileData.name}</p>
                    </div>
                  )}
                  {profileData.location && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">Location</h4>
                      <p>{profileData.location}</p>
                    </div>
                  )}
                  {profileData.job && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">Work</h4>
                      <p>{profileData.job}</p>
                    </div>
                  )}
                  {profileData.age && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">Age</h4>
                      <p>{profileData.age}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Style */}
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Social Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileData.socialStyle && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">How You Connect</h4>
                      <p>{profileData.socialStyle}</p>
                    </div>
                  )}
                  {profileData.communicationStyle && (
                    <div>
                      <h4 className="font-medium text-muted-foreground">Communication Style</h4>
                      <p>{profileData.communicationStyle}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Personality Chart */}
            {profileData.bigFiveTraits && (
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Personality Profile</CardTitle>
                  <CardDescription>Your unique personality dimensions</CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalityChart traits={profileData.bigFiveTraits} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6">
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Interests & Lifestyle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileData.interestsAndPassions && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Interests & Passions</h3>
                    <p>{profileData.interestsAndPassions}</p>
                  </div>
                )}
                
                {profileData.favoriteActivities && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Favorite Activities</h3>
                    <p>{profileData.favoriteActivities}</p>
                  </div>
                )}
                
                {profileData.talkingPoints && profileData.talkingPoints.length > 0 && (
                  <div>
                    <h3 className="font-medium text-lg mb-3">Talking Points</h3>
                    <div className="flex flex-wrap gap-2">
                      {ensureArray(profileData.talkingPoints).map((point, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/10 text-secondary border-secondary/20">
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
            {profileData.coreValues && (
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.coreValues}</p>
                </CardContent>
              </Card>
            )}
            
            {profileData.lifePhilosophy && (
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Life Philosophy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.lifePhilosophy}</p>
                </CardContent>
              </Card>
            )}

            {profileData.goals && (
              <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Goals & Aspirations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.goals}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Connect Your Accounts</CardTitle>
                <CardDescription>
                  Connect your Spotify and YouTube accounts to share your music and video preferences with Twyne.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Spotify Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg backdrop-blur-sm bg-white/5 border-white/10">
                  <div className="flex items-center gap-3">
                    <Music className="h-8 w-8 text-green-500" />
                    <div>
                      <h3 className="font-semibold">Spotify</h3>
                      <p className="text-sm text-muted-foreground">Share your music taste and listening habits</p>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-white/10 border-white/20">
                    Connect Spotify
                  </Button>
                </div>

                {/* YouTube Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg backdrop-blur-sm bg-white/5 border-white/10">
                  <div className="flex items-center gap-3">
                    <Youtube className="h-8 w-8 text-red-500" />
                    <div>
                      <h3 className="font-semibold">YouTube</h3>
                      <p className="text-sm text-muted-foreground">Share your video preferences and subscriptions</p>
                    </div>
                  </div>
                  <Button variant="outline" className="bg-white/10 border-white/20">
                    Connect YouTube
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Your data will only be used to enhance your Twyne profile and improve matches.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Tab with Chat */}
          <TabsContent value="edit" className="space-y-6">
            <Card className="backdrop-blur-md bg-white/10 border border-white/20 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Chat With Your Mirror</CardTitle>
                    <CardDescription>
                      Tell me what you'd like to update about yourself or your profile. I'll help you reflect on and refine how you want to be seen and understood.
                    </CardDescription>
                  </div>
                  {conversation.userAnswers.length > 0 && (
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isUpdating ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-y-auto mb-4 space-y-4 max-h-[400px] p-1">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-lg p-3 backdrop-blur-sm ${
                          message.sender === 'user' 
                            ? 'bg-primary/80 text-primary-foreground' 
                            : 'bg-white/10 border border-white/20'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-white/10 border border-white/20 backdrop-blur-sm">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce delay-150"></div>
                          <div className="h-2 w-2 bg-muted-foreground/50 rounded-full animate-bounce delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex items-end gap-2">
                  <Textarea
                    placeholder="Tell me what you'd like to update about yourself..."
                    className="resize-none backdrop-blur-sm bg-white/10 border-white/20"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    disabled={isTyping}
                  />
                  <Button 
                    size="icon" 
                    onClick={handleSend} 
                    disabled={isTyping || !input.trim()}
                    className="bg-primary/80 hover:bg-primary"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Mirror;
