import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User, Lock, Edit3, Brain, Heart, Activity, RefreshCw } from "lucide-react";
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
  
  // Form state for editing
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
  });

  const [isLoading, setIsLoading] = useState(false);
  
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
  
  // Get profile data from the database profile_data column or user metadata
  const profileData = profile?.profile_data || user?.user_metadata?.profile_data || {};

  // Get user's actual first name
  const getUserFirstName = () => {
    // Try to get name from profile_data first
    if (profileData.name) {
      return profileData.name.split(' ')[0];
    }
    // Fallback to full_name from profile
    if (profile?.full_name) {
      return profile.full_name.split(' ')[0];
    }
    // Last resort fallback
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

  // Default personality traits if none provided
  const defaultTraits = {
    extroversion: 60,
    openness: 70,
    empathy: 80,
    structure: 50
  };

  // Extract tags
  const getTags = () => {
    return profileData.twyneTags || profileData.vibeWords || [];
  };

  const tags = getTags();

  // Initialize with a greeting from the AI and reset conversation when switching to edit tab
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
    
    if (user) {
      initializeConversation();
    }
  }, [user, activeTab]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('user_data')
        .update({
          profile_data: {
            ...profileData,
            username: formData.username,
            full_name: formData.full_name,
            bio: formData.bio,
            location: formData.location,
          },
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
          title: "Profile updated",
          description: "Your information has been updated successfully",
        });
        setActiveTab("overview");
      }
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
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
        
        // Refresh the page to show updated data
        window.location.reload();
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
            {getUserFirstName()}'s Mirror
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your personal profile that captures who you are. This information is private and only visible to you.
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
          <TabsList className="grid grid-cols-4 mb-8">
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
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
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
                  <div>
                    <h3 className="font-medium text-muted-foreground">Name</h3>
                    <p className="font-semibold text-lg">{profile?.full_name || profile?.username || "Anonymous"}</p>
                  </div>
                  
                  {profile?.location && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Location</h3>
                      <p>{profile.location}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-muted-foreground">Email</h3>
                    <p>{user?.email}</p>
                  </div>
                  
                  {profile?.username && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Username</h3>
                      <p>{profile.username}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Middle column - Vibe Summary */}
              <Card className="col-span-2 border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profile?.bio || profileData.vibeSummary || "No bio added yet"}</p>
                  
                  {/* Twyne Tags */}
                  {tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-medium text-muted-foreground mb-2">#TwyneTags</h3>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-primary/5 text-primary">
                            #{tag.replace(/\s+/g, '')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Key Facts/Background */}
            {profileData.keyFacts && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Key Facts & Background</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.keyFacts}</p>
                </CardContent>
              </Card>
            )}

            {/* Personality Chart */}
            {profileData.personalityTraits && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Your Social Style</CardTitle>
                  <CardDescription>Based on our conversation, here's your social style and energy</CardDescription>
                </CardHeader>
                <CardContent>
                  <PersonalityChart traits={profileData.personalityTraits || defaultTraits} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Interests Tab */}
          <TabsContent value="interests" className="space-y-6">
            <Card className="border border-border bg-card">
              <CardHeader>
                <CardTitle className="text-xl">Interests & Passions</CardTitle>
              </CardHeader>
              <CardContent>
                {profileData.interests && (
                  <div className="flex flex-wrap gap-3">
                    {ensureArray(profileData.interests).map((interest, i) => (
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
                )}
                
                {profileData.weekendActivities && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">How You Spend Your Time</h3>
                    <p>{profileData.weekendActivities}</p>
                  </div>
                )}
                
                {profileData.mediaTastes && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">Media & Cultural Tastes</h3>
                    <p>{profileData.mediaTastes}</p>
                  </div>
                )}
                
                {profileData.talkingPoints && (
                  <div className="mt-8">
                    <h3 className="font-medium text-xl mb-4">Talking Points</h3>
                    <div className="flex flex-wrap gap-2">
                      {ensureArray(profileData.talkingPoints).map((point, i) => (
                        <Badge key={i} variant="outline" className="bg-secondary/5 text-secondary">
                          {point}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {profileData.lookingFor && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">What You're Looking For</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.lookingFor}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Inner World Tab */}
          <TabsContent value="inner-world" className="space-y-6">
            {profileData.personalityTraits && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Your Personality Profile</CardTitle>
                  <CardDescription>A visual representation of your inner dimensions</CardDescription>
                </CardHeader>
                <CardContent className="pb-8">
                  <PersonalityChart traits={profileData.personalityTraits || defaultTraits} />
                </CardContent>
              </Card>
            )}
            
            {profileData.coreValues && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Core Values</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.coreValues}</p>
                </CardContent>
              </Card>
            )}
            
            {(profileData.philosophy || profileData.lifePhilosophy) && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Philosophy & Beliefs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.philosophy || profileData.lifePhilosophy}</p>
                </CardContent>
              </Card>
            )}
            
            {profileData.personalInsights && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Key Traits & Characteristics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {ensureArray(profileData.personalInsights).map((trait, i) => (
                      <Badge key={i} variant="outline" className="bg-accent/5 text-accent">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Connection Tab */}
          <TabsContent value="connection" className="space-y-6">
            {profileData.socialStyle && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Social Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.socialStyle}</p>
                </CardContent>
              </Card>
            )}
            
            {profileData.connectionPreferences && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">Connection Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.connectionPreferences}</p>
                </CardContent>
              </Card>
            )}
            
            {profileData.lookingFor && (
              <Card className="border border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-xl">What You're Looking For</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{profileData.lookingFor}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Edit Tab with Chat Only */}
          <TabsContent value="edit" className="space-y-6">
            {/* Chat with Mirror */}
            <Card className="border border-border bg-card">
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
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-muted">
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
                    className="resize-none"
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
