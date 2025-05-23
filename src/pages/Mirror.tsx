
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, User, AlertCircle } from "lucide-react";
import { getAIResponse } from "@/utils/aiUtils";
import { Message, Conversation, ChatRole } from "@/types/chat";
import { toast } from "@/components/ui/use-toast";
import ProfileInsightsDashboard from "@/components/connections/ProfileInsightsDashboard";
import { Textarea } from "@/components/ui/textarea";

const Mirror = () => {
  const { user, profile } = useAuth();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [
      { 
        role: "system" as ChatRole, 
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
        
        // Update the conversation with just the AI response
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
        { role: "user" as ChatRole, content: input }
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 pb-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Your Mirror</h1>
        <p className="text-muted-foreground text-center mb-8">Reflect on yourself and your journey</p>
        
        {/* Dashboard Section */}
        <ProfileInsightsDashboard 
          profileData={profileData}
          nameInitial={nameInitial}
        />
        
        {/* Chat Section */}
        <Card className="mt-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Chat With Your Mirror</CardTitle>
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
  );
};

export default Mirror;
