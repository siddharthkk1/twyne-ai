
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, User, AlertCircle, Lock, Edit3, Lightbulb } from "lucide-react";
import { getMirrorChatResponse } from "@/utils/aiUtils";
import { Message, Conversation, ChatRole } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import ProfileInsightsDashboard from "@/components/connections/ProfileInsightsDashboard";

const Mirror = () => {
  const { user, profile, signOut } = useAuth();
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
        content: "You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values. The user will tell you what they want to change or update. Your job is to: Listen carefully and understand the essence of what they're saying. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes). Reflect back a concise summary of the proposed changes and ask for confirmation before applying them. Ask a clarifying follow-up only if necessary to make the update accurate. Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent." 
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
        Greet them warmly and let them know you're here to help them update their Mirror - their personal profile that captures who they are. Explain that they can tell you what they'd like to change about themselves or their profile, and you'll help them update it thoughtfully.
      `;
      
      try {
        const tempConversation = {
          ...conversation,
          messages: [
            ...conversation.messages,
            { role: "user" as ChatRole, content: initialPrompt }
          ]
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
  const nameInitial = profile?.full_name 
    ? profile.full_name[0] 
    : profile?.username 
      ? profile.username[0] 
      : user?.email?.[0] || "?";

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
          <ProfileInsightsDashboard 
            profileData={profileData} 
            nameInitial={nameInitial} 
          />
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
            Tell me what you'd like to update about yourself or your profile. I'll help you reflect on and refine how you want to be seen and understood.
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
    </div>
  );
};

export default Mirror;
