
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, RefreshCw, User, Settings, AlertCircle } from "lucide-react";
import { getAIResponse } from "@/utils/aiUtils";
import { Message, Conversation } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";

const Mirror = () => {
  const { user, profile } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [
      { 
        role: "system", 
        content: "You are the user's personal mirror assistant. You help them reflect on themselves and update their personal profile. Be friendly, insightful, and helpful. Use what you know about them to personalize your responses." 
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
      
      // Prepare system prompt with user data
      const userName = profileData.name || profile?.full_name || user?.email?.split('@')[0] || "there";
      
      // Add initial greeting
      const initialPrompt = `
        The user's name is ${userName}. 
        Here's what I know about them so far: ${JSON.stringify(profileData)}
        Greet them personally and let them know they can ask you questions about their profile 
        or ask to update any information about themselves.
      `;
      
      try {
        // Add the user context message temporarily for generating the greeting
        const tempConversation = {
          ...conversation,
          messages: [
            ...conversation.messages,
            { role: "user", content: initialPrompt }
          ]
        };
        
        const response = await getAIResponse(tempConversation);
        
        const aiMessage: Message = {
          id: 1,
          sender: "ai",
          text: response
        };
        
        setMessages([aiMessage]);
        
        // Update the conversation with just the AI response
        setConversation({
          messages: [
            ...conversation.messages,
            { role: "assistant", content: response }
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
  
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // Add user message to UI
    const userMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput("");
    setIsTyping(true);
    
    // Update conversation with user message
    const updatedConversation = {
      ...conversation,
      messages: [
        ...conversation.messages,
        { role: "user", content: input }
      ],
      userAnswers: [...conversation.userAnswers, input]
    };
    
    try {
      // Get AI response
      const aiResponse = await getAIResponse(updatedConversation);
      
      // Add AI response to UI
      const aiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai"
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
      
      // Update conversation with AI response
      setConversation({
        messages: [
          ...updatedConversation.messages,
          { role: "assistant", content: aiResponse }
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
  
  // Helper function to check if a data field is empty
  const isDataEmpty = (value: any) => {
    if (value === null || value === undefined || value === "") return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === "object" && Object.keys(value).length === 0) return true;
    return false;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Your Mirror</h1>
        <p className="text-muted-foreground text-center mb-8">Reflect on yourself and your journey</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold mb-4">
                    {profileData.name ? profileData.name[0].toUpperCase() : profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                  <h2 className="text-xl font-medium">
                    {profileData.name || profile?.full_name || user?.email?.split('@')[0] || 'Anonymous'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {profileData.location || profile?.location || 'No location set'}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Core Values */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">CORE VALUES</h3>
                    {profileData.coreValues ? (
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profileData.coreValues) ? profileData.coreValues : [profileData.coreValues]).map((value: string, i: number) => (
                          <Badge key={i} variant="outline" className="bg-primary/5 text-primary">
                            {value}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">No core values identified yet</p>
                    )}
                  </div>
                  
                  {/* Interests */}
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">INTERESTS</h3>
                    {!isDataEmpty(profileData.interests) ? (
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(profileData.interests) ? profileData.interests : [profileData.interests]).map((interest: string, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-secondary/10">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm italic text-muted-foreground">No interests identified yet</p>
                    )}
                  </div>
                  
                  {/* Personality Traits */}
                  {profileData.personalityTraits && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">PERSONALITY TRAITS</h3>
                      <div className="space-y-2">
                        {Object.entries(profileData.personalityTraits).map(([trait, value]: [string, any]) => (
                          <div key={trait} className="grid grid-cols-3 gap-2 items-center">
                            <div className="text-xs capitalize">{trait}</div>
                            <div className="col-span-2 w-full bg-secondary/20 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Personal Insights */}
                  {profileData.personalInsights && profileData.personalInsights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">PERSONAL INSIGHTS</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {profileData.personalInsights.map((insight: string, i: number) => (
                          <li key={i}>{insight}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Missing Data Notice */}
                  {(isDataEmpty(profileData.coreValues) && 
                   isDataEmpty(profileData.interests) && 
                   isDataEmpty(profileData.personalityTraits) && 
                   isDataEmpty(profileData.personalInsights)) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">Your profile is incomplete</p>
                        <p className="text-xs text-amber-700 mt-1">
                          Chat with your personal mirror to help us learn more about you and complete your profile.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Chat With Your Mirror</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 max-h-[500px] p-1">
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
                    placeholder="Ask me anything about yourself..."
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
        </div>
      </div>
    </div>
  );
};

export default Mirror;
