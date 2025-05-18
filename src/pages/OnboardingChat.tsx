import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";

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
  lifeStory?: string;
  background?: string;
  careerOrEducation?: string;
  creativePursuits?: string;
  meaningfulAchievements?: string;
  lifePhilosophy?: string;
  challengesOvercome?: string;
  growthJourney?: string;
  emotionalIntelligence?: string;
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
  const { user, clearNewUserFlag } = useAuth();
  const navigate = useNavigate();

  // Enhanced conversation logic - dynamic questions based on previous answers
  const getNextQuestion = () => {
    const questions = [
      // Follow-up based on name
      `Nice to meet you, ${userProfile.name || "there"}! Where are you currently based?`,
      
      // Follow-up on location
      (profile: UserProfile) => 
        `How long have you been in ${profile.location || "your area"}? And where did you grow up?`,
      
      // Age question
      "If you're comfortable sharing, how old are you?",
      
      // Background/Life story
      "I'd love to know a bit about your background or life story. What are some key experiences that have shaped who you are today?",
      
      // Career or education
      "What do you do in terms of work, studies, or other pursuits that occupy your time?",
      
      // Social energy question
      "I'd love to understand your social vibe better. How would you describe your energy in social situations? Are you more energized by deep one-on-ones or lively group settings?",
      
      // Interests/passion question
      "What are some things you're passionate about or could talk about for hours? I'd love to hear about your interests.",
      
      // Creative pursuits
      "Do you have any creative outlets or hobbies you enjoy? What do they mean to you?",
      
      // Weekend activities
      "What's your ideal weekend look like when you have nothing planned?",
      
      // Media and culture
      "Any books, shows, music, or cultural interests that have influenced you or that you've been into lately?",
      
      // Values question
      "What values or principles are most important to you in life or in relationships?",
      
      // Connection preferences
      "When it comes to making connections, what kind of people do you tend to click with? Any green flags you look for?",
      
      // Meaningful achievements
      "What's something you've done or created that you're particularly proud of?",
      
      // Life philosophy
      "Do you have any personal philosophy or approach to life that guides your decisions?",
      
      // Challenges overcome
      "Without getting too personal, what's a challenge you've faced that has helped you grow?",
      
      // Looking for
      "What kind of friendship or connection experience are you hoping to find right now?",
      
      // Misunderstood aspects
      "What's something about you that people often misunderstand or that takes time for others to see?",
      
      // Friendship pace/style
      "How would you describe your approach to friendships? Are you someone who prefers to go deep quickly or take time to build trust?",
      
      // Reflection and wrap-up
      (profile: UserProfile) => {
        return "Thank you for sharing all this with me. I've learned a lot about who you are and what matters to you. I'm going to put together a profile based on our conversation. This will help me connect you with people who truly match your vibe and values.";
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
          timeInCurrentCity: locationInfo.split("?")[0]?.trim() || locationInfo,
          hometown: locationInfo.split("?")[1]?.trim() || ""
        }));
        break;
      case 3: // Age
        setUserProfile(prev => ({ ...prev, age: response.trim() }));
        break;
      case 4: // Background/Life story
        setUserProfile(prev => ({ ...prev, lifeStory: response.trim(), background: response.trim() }));
        break;
      case 5: // Career or education
        setUserProfile(prev => ({ ...prev, careerOrEducation: response.trim() }));
        break;
      case 6: // Social energy
        setUserProfile(prev => ({ ...prev, socialStyle: response.trim(), socialEnergy: response.trim() }));
        break;
      case 7: // Interests/Passions
        setUserProfile(prev => ({ 
          ...prev, 
          interests: [...(prev.interests || []), ...response.split(",").map(item => item.trim())],
          talkingPoints: [...(prev.talkingPoints || []), response.trim()]
        }));
        break;
      case 8: // Creative pursuits
        setUserProfile(prev => ({ ...prev, creativePursuits: response.trim() }));
        break;
      case 9: // Weekend activities
        setUserProfile(prev => ({ ...prev, weekendActivities: response.trim() }));
        break;
      case 10: // Media tastes
        setUserProfile(prev => ({ ...prev, mediaTastes: response.trim() }));
        break;
      case 11: // Values
        setUserProfile(prev => ({ ...prev, values: response.trim() }));
        break;
      case 12: // Connection preferences
        setUserProfile(prev => ({ ...prev, connectionPreferences: response.trim() }));
        break;
      case 13: // Meaningful achievements
        setUserProfile(prev => ({ ...prev, meaningfulAchievements: response.trim() }));
        break;
      case 14: // Life philosophy
        setUserProfile(prev => ({ ...prev, lifePhilosophy: response.trim() }));
        break;
      case 15: // Challenges overcome
        setUserProfile(prev => ({ ...prev, challengesOvercome: response.trim() }));
        break;
      case 16: // Looking for
        setUserProfile(prev => ({ ...prev, lookingFor: response.trim() }));
        break;
      case 17: // Misunderstood
        setUserProfile(prev => ({ 
          ...prev, 
          misunderstood: response.trim(),
          personalInsights: [...(prev.personalInsights || []), response.trim()]
        }));
        break;
      case 18: // Friendship pace/style
        setUserProfile(prev => ({ ...prev, friendshipPace: response.trim() }));
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
        } else {
          // Clear the new user flag after successful onboarding
          clearNewUserFlag();
          console.log("User has been marked as onboarded");
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {!isComplete ? (
        <>
          <div className="p-4 border-b backdrop-blur-sm bg-background/80 flex items-center justify-center">
            <h1 className="text-xl font-medium">Getting to Know You</h1>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4 pb-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`animate-fade-in ${
                    message.sender === "user" 
                      ? "chat-bubble-user bg-primary/90 text-primary-foreground ml-auto" 
                      : "chat-bubble-ai bg-background border border-border/50 shadow-sm"
                  } rounded-2xl p-4 max-w-[85%] md:max-w-[70%]`}
                >
                  {message.text}
                </div>
              ))}
              {isTyping && (
                <div className="chat-bubble-ai bg-background border border-border/50 shadow-sm rounded-2xl p-4 animate-pulse flex space-x-1 w-16">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>
              )}
              <div ref={messagesEndRef}></div>
            </div>
          </div>

          <div className="p-4 backdrop-blur-sm bg-background/80 border-t">
            <div className="flex items-center space-x-2 max-w-3xl mx-auto">
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
        </>
      ) : (
        <ProfileCompletionDashboard 
          userProfile={userProfile}
        />
      )}
    </div>
  );
};

export default OnboardingChat;
