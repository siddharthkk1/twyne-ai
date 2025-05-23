
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
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";

const Mirror = () => {
  const { user, profile } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  
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

  // Create a UserProfile object from the profile data for the dashboard
  const userProfile = {
    name: profileData.name || profile?.full_name || user?.email?.split('@')[0] || "User",
    location: profileData.location || profile?.location || "",
    interests: profileData.interests || profileData.talkingPoints || [],
    socialStyle: profileData.socialStyle || "",
    connectionPreferences: profileData.lookingFor || "",
    personalInsights: profileData.personalInsights || [],
    coreValues: profileData.coreValues || "",
    personalityTraits: profileData.personalityTraits || {
      extroversion: 50,
      openness: 50,
      empathy: 50,
      structure: 50
    }
  };

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

  return (
    <div className="py-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {userProfile.name}'s Mirror
        </h1>
        <div className="flex items-center text-sm text-muted-foreground">
          <Lock className="h-4 w-4 mr-1 text-primary/70" />
          <span>Private</span>
        </div>
      </div>

      {/* Profile Dashboard */}
      <ProfileCompletionDashboard 
        userProfile={userProfile}
        isGeneratingProfile={false}
      />

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
