import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, AlertCircle, Lock, Edit3, Lightbulb } from "lucide-react";
import { getAIResponse, getMirrorChatResponse } from "@/utils/aiUtils";
import { Message, Conversation, ChatRole } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const Mirror = () => {
  const { user, profile } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state for editing
  const [formData, setFormData] = useState({
    username: profile?.username || "",
    full_name: profile?.full_name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
  });

  const [conversation, setConversation] = useState<Conversation>({
    messages: [
      { 
        role: "system" as ChatRole, 
        content: "You are the user's personal mirror assistant. You help them reflect on themselves and update their personal profile information. When they want to update something about themselves, help them think through it and then provide the updated information in a structured format. Be friendly, insightful, and helpful." 
      }
    ],
    userAnswers: []
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const profileData = user?.user_metadata?.profile_data || {};

  // Initialize with a greeting from the AI
  useEffect(() => {
    const initializeConversation = async () => {
      setIsTyping(true);
      
      const userName = profileData.name || profile?.full_name || user?.email?.split('@')[0] || "there";
      
      const initialPrompt = `
        The user's name is ${userName}. 
        Here's what I know about them: ${JSON.stringify(profileData)}
        Greet them and let them know they can ask you questions about their profile 
        or ask to update any information about themselves. You can help them update their bio, interests, values, and other personal information.
      `;
      
      try {
        const tempConversation = {
          ...conversation,
          messages: [
            ...conversation.messages,
            { role: "user" as ChatRole, content: initialPrompt }
          ]
        };
        
        const response = await getAIResponse(tempConversation);
        
        const aiMessage: Message = {
          id: 1,
          sender: "ai",
          text: response
        };
        
        setMessages([aiMessage]);
        
        setConversation({
          messages: [
            ...conversation.messages,
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
    
    if (user && messages.length === 0) {
      initializeConversation();
    }
  }, [user]);
  
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
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          bio: formData.bio,
          location: formData.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

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
        setActiveTab("profile");
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

  // Get name initial for avatar
  const nameInitial = profileData.name 
    ? profileData.name[0].toUpperCase() 
    : profile?.full_name 
      ? profile.full_name[0].toUpperCase() 
      : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {profile?.full_name || profile?.username || user?.email?.split('@')[0] || "Your"}'s Mirror
        </h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Lock className="h-4 w-4 mr-1 text-primary/70" />
          <span>Private</span>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <div className="bg-background rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col items-center mb-6">
              <div className="h-24 w-24 rounded-full bg-secondary/50 mb-4 flex items-center justify-center text-2xl font-semibold">
                {nameInitial}
              </div>
              <h2 className="text-xl font-medium">{profile?.full_name || profile?.username || user?.email?.split('@')[0]}</h2>
              <p className="text-muted-foreground">{profile?.location || 'No location set'}</p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">ABOUT YOU</h3>
                <p className="mt-1">
                  {profile?.bio || 'No bio added yet'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">EMAIL</h3>
                <p className="mt-1">{user?.email}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">USERNAME</h3>
                <p className="mt-1">{profile?.username || 'No username set'}</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="animate-fade-in w-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-xl">Your Insights</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 mr-1 text-primary/70" />
                  <span>Private</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-primary">Privacy note:</span> This information is private and not shared with other users. 
                    It's only used by Twyne AI to help you make meaningful connections and is not visible as a public profile.
                  </p>
                </div>
                
                {profileData.vibeSummary && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Vibe Summary</div>
                    <div className="bg-secondary/5 rounded-lg p-3 text-sm border border-secondary/10">
                      {profileData.vibeSummary}
                    </div>
                  </div>
                )}
                
                {profileData.twyneTags && profileData.twyneTags.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Twyne Tags</div>
                    <div className="flex flex-wrap gap-2">
                      {profileData.twyneTags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  {Object.entries(profileData).filter(([key, value]) => 
                    key !== 'vibeSummary' && key !== 'twyneTags' && value && value !== "Not specified"
                  ).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-3 gap-2">
                      <div className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className="col-span-2 text-sm">
                        {Array.isArray(value) ? value.join(", ") : String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="space-y-4">
          <div className="bg-background rounded-2xl p-6 shadow-sm">
            <div className="bg-primary/5 rounded-lg p-3 text-sm border border-primary/10 mb-6">
              <p className="text-muted-foreground">
                <span className="font-medium text-primary">Privacy note:</span> This information is private and used by Twyne AI to help you make meaningful connections.
                It's not visible as a public profile to other users.
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="h-24 w-24 rounded-full bg-secondary/50 mb-4 flex items-center justify-center text-2xl font-semibold">
                  {nameInitial}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Your username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Your location (e.g., San Francisco)"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">About You</Label>
                  <Textarea 
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Tell us a bit about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setActiveTab("profile")}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Chat Section */}
      <Card className="mt-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Chat With Your Mirror</CardTitle>
          <p className="text-sm text-muted-foreground">
            Ask me to help you update your profile information, reflect on your experiences, 
            or explore what makes you unique. I can help you refine your bio, interests, values, and more.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-y-auto mb-4 space-y-4 max-h-[300px] p-1">
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
              placeholder="Ask me to help update your profile or reflect on yourself..."
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
    </div>
  );
};

export default Mirror;
