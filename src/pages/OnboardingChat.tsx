
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, MapPin, Sparkles, BookOpen, Users, Heart, Coffee, Calendar, Music, Star, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
  icon?: React.ReactNode;
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
    text: "Hey there! I'm Twyne, your friendly neighborhood connection finder. 👋",
    sender: "ai",
    icon: <Smile className="h-5 w-5 text-yellow-500" />
  },
  {
    id: 2,
    text: "I'd love to get to know you so I can help you connect with people who match your vibe. What's your name or what do you like to be called?",
    sender: "ai",
    icon: <Sparkles className="h-5 w-5 text-purple-500" />
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

  // Icon mapping for different question topics
  const getIconForStep = (step: number) => {
    const icons = [
      <Sparkles className="h-5 w-5 text-purple-500" />, // Name
      <MapPin className="h-5 w-5 text-indigo-500" />,   // Location
      <MapPin className="h-5 w-5 text-blue-500" />,     // Time in city
      <Users className="h-5 w-5 text-violet-500" />,    // Social energy
      <BookOpen className="h-5 w-5 text-emerald-500" />, // Interests
      <Calendar className="h-5 w-5 text-amber-500" />,  // Weekend
      <Music className="h-5 w-5 text-pink-500" />,      // Media
      <Heart className="h-5 w-5 text-rose-500" />,      // Connection preferences
      <Star className="h-5 w-5 text-yellow-500" />,     // Values
      <Coffee className="h-5 w-5 text-orange-500" />,   // Looking for
      <Shield className="h-5 w-5 text-green-500" />,    // Wrap up
    ];
    return icons[step] || icons[0];
  };

  // Conversation logic - dynamic questions based on previous answers
  const getNextQuestion = () => {
    const questions = [
      // Follow-up based on name - use a warm, friendly tone
      (profile: UserProfile) => {
        const name = profile.name || "there";
        return `${name}! That's a great name. I'm already getting good vibes from you! ✨ Where are you based these days?`;
      },
      
      // Follow-up on location - conversational and curious
      (profile: UserProfile) => 
        `${profile.location}! Nice! How long have you been living there? And where did you grow up?`,
      
      // Social energy question - casual and reflective
      "OK, let's talk about you a bit. I'm curious - in social situations, are you more energized by deep one-on-ones, lively group settings, or a mix of both? What's your social vibe like?",
      
      // Interests/passion question - enthusiastic
      "What's something that lights you up when you talk about it? Could be anything - a hobby, interest, or just something you're curious about lately...",
      
      // Weekend activities - relaxed tone
      "Imagine you have a free weekend with nothing planned - what does your ideal day look like? What would make you feel most like yourself?",
      
      // Media and culture - conversational
      "I love getting entertainment recommendations from friends! Any books, shows, music or podcasts you've been into lately that you'd want to share with new friends?",
      
      // Connection preferences - thoughtful
      "When it comes to new friendships, what kind of people do you naturally click with? Any qualities that you really value in friends?",
      
      // Values question - introspective
      "This might be a bit deep, but I'm curious - what's something about you that people might misunderstand at first, or that takes time for others to see?",
      
      // Looking for - direct but warm
      "What kind of connections are you hoping to find right now? Looking for one or two close friends, a wider social circle, or something specific?",
      
      // Reflection and wrap-up - enthusiastic and affirming
      (profile: UserProfile) => {
        const insights = [];
        
        if (profile.location) {
          insights.push(`based in ${profile.location}`);
        }
        
        if (profile.socialStyle) {
          const socialStyle = profile.socialStyle.toLowerCase();
          insights.push(socialStyle.includes("one") || socialStyle.includes("deep") ? 
            "someone who values meaningful connections" : 
            "someone with great social energy");
        }
        
        if (profile.interests && profile.interests.length > 0) {
          insights.push(`passionate about ${profile.interests.join(", ")}`);
        }
        
        const insightText = insights.length > 0 
          ? `You're ${insights.join(", ")}. `
          : "";
          
        return `${insightText}I feel like I'm getting to know the real you! 🙌 Thanks for sharing all this with me. I'll use what I've learned to connect you with people nearby who share your vibe and interests. I'll let you know when I find some great potential connections!`;
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
        icon: getIconForStep(currentStep + 1)
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 via-slate-50 to-blue-50">
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm">
        <h1 className="text-xl font-medium text-center">Chat with Twyne</h1>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4 pb-4 max-w-2xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`animate-fade-in flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[80%] p-4 rounded-2xl ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-white shadow-sm border border-slate-100 rounded-bl-none"
                }`}
              >
                {message.sender === "ai" && message.icon && (
                  <div className="absolute -left-3 -top-3 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                    {message.icon}
                  </div>
                )}
                <p className={message.sender === "ai" ? "pl-2" : ""}>{message.text}</p>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-slate-100 rounded-2xl rounded-bl-none p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-primary/80 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {isComplete ? (
        <div className="p-6 bg-white/80 backdrop-blur-sm border-t">
          <div className="text-center mb-6 max-w-md mx-auto">
            <div className="flex justify-center mb-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-medium mb-1">Profile Created!</h2>
            <p className="text-muted-foreground">
              I'll notify you when I find people who match your vibe. This usually takes 1-2 days.
            </p>
          </div>
          <Button asChild className="w-full max-w-md mx-auto rounded-full py-6 bg-gradient-to-r from-primary to-secondary">
            <Link to="/connections">See Your Connections</Link>
          </Button>
        </div>
      ) : (
        <div className="p-4 bg-white/80 backdrop-blur-sm border-t">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="rounded-full border-slate-200 focus-visible:ring-primary/50 shadow-sm"
              autoFocus
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="rounded-full h-10 w-10 bg-primary hover:bg-primary/90 shadow-sm"
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
