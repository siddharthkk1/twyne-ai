
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
}

interface UserProfile {
  name: string;
  location: string;
  interests: string[];
  socialStyle: string;
  connectionPreferences: string;
  personalInsights: string[];
  age?: string;
  hometown?: string;
  timeInCurrentCity?: string;
  talkingPoints?: string[];
  friendshipPace?: string;
  socialEnergy?: string;
  weekendActivities?: string;
  mediaTastes?: string;
  dealBreakers?: string;
  lookingFor?: string;
  values?: string;
  misunderstood?: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hey there 👋 I'm Twyne, your friendly neighborhood connection finder.",
    sender: "ai",
  },
  {
    id: 2,
    text: "Let's chat for a bit so I can understand your vibe and help you connect with people you'll actually click with. What's your first name or what you like to be called?",
    sender: "ai",
  },
];

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    location: "",
    interests: [],
    socialStyle: "",
    connectionPreferences: "",
    personalInsights: [],
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Conversation logic - dynamic questions based on previous answers
  const getNextQuestion = () => {
    const questions = [
      // Follow-up based on name
      `Nice to meet you, ${userProfile.name}! Where are you currently based?`,
      
      // Follow-up on location
      (profile: UserProfile) => 
        `How long have you been in ${profile.location}? And where did you grow up?`,
      
      // Social energy question
      "I'd love to understand your social vibe better. How would you describe your energy in social situations? Are you more energized by deep one-on-ones or lively group settings?",
      
      // Interests/passion question
      "What's something you could talk about for hours and never get bored? Or maybe something you're curious about lately?",
      
      // Weekend activities
      "What's your ideal weekend look like when you have nothing planned?",
      
      // Media and culture
      "Any books, shows, or music you've been into lately that you'd love to discuss with new friends?",
      
      // Connection preferences
      "When it comes to making new connections, what kind of people do you tend to click with? Any green flags you look for?",
      
      // Values question
      "What's something people often misunderstand about you, or that takes time for others to see?",
      
      // Looking for
      "What kind of friendship are you hoping to find right now? One or two close people, a wider social circle, or something specific?",
      
      // Reflection and wrap-up
      (profile: UserProfile) => {
        const insights = [];
        
        if (profile.location) {
          insights.push(`based in ${profile.location}`);
        }
        
        if (profile.socialStyle) {
          insights.push(profile.socialStyle.toLowerCase());
        }
        
        if (profile.interests && profile.interests.length > 0) {
          insights.push(`passionate about ${profile.interests.join(", ")}`);
        }
        
        const insightText = insights.length > 0 
          ? `You're ${insights.join(", ")}. `
          : "";
          
        return `${insightText}Got it! I think I've got your vibe now. I'll use this to connect you with people nearby who you'll genuinely click with—not just random matches. I'll let you know when I find good connections!`;
      }
    ];

    // If we're at the final question
    if (currentStep >= questions.length) {
      return null;
    }

    // For dynamic questions that need user profile data
    if (typeof questions[currentStep] === 'function') {
      return (questions[currentStep] as Function)(userProfile);
    }
    
    return questions[currentStep];
  };

  const processUserResponse = (response: string) => {
    // Process the user's response based on current step
    switch (currentStep) {
      case 0: // Name
        setUserProfile(prev => ({ ...prev, name: response.trim() }));
        break;
      case 1: // Location
        setUserProfile(prev => ({ ...prev, location: response.trim() }));
        break;
      case 2: // Time in city + hometown
        const locationInfo = response.trim();
        setUserProfile(prev => ({ 
          ...prev, 
          timeInCurrentCity: locationInfo.split("?")[0]?.trim() || "",
          hometown: locationInfo.split("?")[1]?.trim() || ""
        }));
        break;
      case 3: // Social energy
        setUserProfile(prev => ({ ...prev, socialStyle: response.trim(), socialEnergy: response.trim() }));
        break;
      case 4: // Interests/Passions
        setUserProfile(prev => ({ 
          ...prev, 
          interests: [...(prev.interests || []), response.trim()],
          talkingPoints: [...(prev.talkingPoints || []), response.trim()]
        }));
        break;
      case 5: // Weekend activities
        setUserProfile(prev => ({ ...prev, weekendActivities: response.trim() }));
        break;
      case 6: // Media tastes
        setUserProfile(prev => ({ ...prev, mediaTastes: response.trim() }));
        break;
      case 7: // Connection preferences
        setUserProfile(prev => ({ ...prev, connectionPreferences: response.trim() }));
        break;
      case 8: // Misunderstood
        setUserProfile(prev => ({ 
          ...prev, 
          misunderstood: response.trim(),
          personalInsights: [...(prev.personalInsights || []), response.trim()]
        }));
        break;
      case 9: // Looking for
        setUserProfile(prev => ({ ...prev, lookingFor: response.trim() }));
        break;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMessage: Message = {
      id: messages.length + 1,
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Process the user's response
    processUserResponse(input);

    // After a delay, send the next question
    setTimeout(() => {
      const nextQuestion = getNextQuestion();
      
      // If there's no next question, complete the onboarding
      if (!nextQuestion) {
        setIsTyping(false);
        setIsComplete(true);
        // Save user profile to Supabase
        markUserAsOnboarded();
        return;
      }

      const newAiMessage: Message = {
        id: messages.length + 2,
        text: nextQuestion,
        sender: "ai",
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
      setIsTyping(false);
      setCurrentStep(currentStep + 1);
    }, 1500);
  };

  const markUserAsOnboarded = async () => {
    if (user) {
      try {
        // Save user profile data to user metadata
        const { error } = await supabase.auth.updateUser({
          data: { 
            has_onboarded: true,
            profile_data: userProfile 
          }
        });
        
        if (error) {
          console.error("Error updating user metadata:", error);
          toast({
            title: "Error",
            description: "Failed to update your profile. Please try again.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error marking user as onboarded:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-bg">
      <div className="p-4 border-b bg-background/80 backdrop-blur-sm">
        <h1 className="text-xl font-medium text-center">Chat with Twyne</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`animate-fade-in ${
                message.sender === "user" ? "chat-bubble-user" : "chat-bubble-ai"
              }`}
            >
              {message.text}
            </div>
          ))}
          {isTyping && (
            <div className="chat-bubble-ai animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {isComplete ? (
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="text-center mb-4">
            <h2 className="text-lg font-medium">Profile Created!</h2>
            <p className="text-muted-foreground">
              I'll notify you when I find people you might click with.
            </p>
          </div>
          <Button asChild className="w-full rounded-full">
            <Link to="/connections">See Your Connections</Link>
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-background/80 backdrop-blur-sm border-t">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="rounded-full"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="rounded-full"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;
