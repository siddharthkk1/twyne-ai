
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AnimatePresence, motion } from "framer-motion";

interface Message {
  id: number;
  text: string;
  sender: "ai" | "user";
  isThinking?: boolean;
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

// Conversation flow with more natural, friendly messages
const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hey there! I'm Twyne, your friendly connection guide. 👋",
    sender: "ai",
  },
  {
    id: 2,
    text: "I'd love to get to know you a bit so I can help you connect with people you'll genuinely click with. What should I call you?",
    sender: "ai",
  },
];

// More varied, conversational follow-up questions with personality
const followUpQuestions = {
  name: [
    "Great to meet you, NAME! What city or area do you call home these days?",
    "NAME! Love that. Where are you based right now?",
    "NAME - that's awesome. Where are you located these days?"
  ],
  location: [
    "LOCATION is such a cool place! How long have you been there? And where were you before that?",
    "Ah, LOCATION! What brought you there, and how long have you been around?",
    "LOCATION - nice! Are you a LOCATION native or did you move there from somewhere else?"
  ],
  background: [
    "That's quite a journey! What do you find yourself doing most days? Work, study, creative pursuits...?",
    "Interesting path! What fills most of your days lately - work, passion projects, other adventures?",
    "Love hearing that! What keeps you busy these days?"
  ],
  dailyLife: [
    "Outside of that, what do you like to do when you've got free time to yourself?",
    "When you're not busy with that, what kind of activities help you recharge or have fun?",
    "That sounds fulfilling! What do you enjoy doing when you have some downtime?"
  ],
  interests: [
    "That sounds fascinating! Is there a particular interest or hobby you could talk about for hours?",
    "I love that! What's something you're really passionate about that lights you up when you talk about it?",
    "That's so cool! What's something you're currently curious about or learning more about?"
  ],
  socialStyle: [
    "When it comes to hanging out with others, do you prefer intimate one-on-ones, group settings, or a mix of both?",
    "Would you say you're more energized by deep conversations with one person, or the vibe of a group hangout?",
    "In social situations, what feels most comfortable to you - smaller intimate gatherings or larger social events?"
  ],
  weekendPlans: [
    "What does your ideal weekend look like when you have nothing planned?",
    "If you had a free weekend with zero obligations, how would you spend it?",
    "When a weekend opens up with no plans, what do you usually find yourself doing?"
  ],
  values: [
    "What qualities do you really value in the people you're close with?",
    "When you think about the relationships that matter most to you, what makes them special?",
    "What traits or values do you appreciate most in your closest friends?"
  ],
  lookingFor: [
    "What kind of connections are you hoping to find here? Close friendships, activity buddies, intellectual sparring partners...?",
    "What are you looking for in new connections right now? Deep friendships, casual hangouts, specific shared interests?",
    "What would make a new friendship really valuable to you at this point in your life?"
  ],
  finalThoughts: [
    "Is there anything else you'd like to share that would help me understand what makes you, you?",
    "Before we wrap up, is there anything else you think would be good for me to know about you?",
    "Any final thoughts about what makes you unique or what you're looking for in connections?"
  ]
};

// Helper to get a random item from an array
const getRandomItem = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)];
};

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
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

  const questionCategories = [
    "name",
    "location",
    "background",
    "dailyLife",
    "interests",
    "socialStyle",
    "weekendPlans",
    "values",
    "lookingFor",
    "finalThoughts"
  ];

  // Get the next question based on current category and user profile
  const getNextQuestion = () => {
    const currentCategory = questionCategories[currentQuestionIndex];
    
    if (currentCategory === "name" && userProfile.name) {
      const question = getRandomItem(followUpQuestions.name);
      return question.replace("NAME", userProfile.name);
    }
    
    if (currentCategory === "location" && userProfile.location) {
      const question = getRandomItem(followUpQuestions.location);
      return question.replace("LOCATION", userProfile.location);
    }
    
    // If we've reached the end of our questions
    if (currentQuestionIndex >= questionCategories.length) {
      return generateSummary();
    }
    
    return getRandomItem(followUpQuestions[currentCategory as keyof typeof followUpQuestions] || ["Tell me more about yourself."]);
  };
  
  // Generate a personalized summary based on what we've learned
  const generateSummary = () => {
    let insights = [];
    
    if (userProfile.name) {
      insights.push(`${userProfile.name}`);
    }
    
    if (userProfile.location) {
      insights.push(`based in ${userProfile.location}`);
    }
    
    if (userProfile.socialStyle) {
      insights.push(`who tends to ${userProfile.socialStyle.toLowerCase()}`);
    }
    
    if (userProfile.interests && userProfile.interests.length > 0) {
      insights.push(`with interests in ${userProfile.interests.join(", ")}`);
    }
    
    if (userProfile.weekendActivities) {
      insights.push(`who enjoys ${userProfile.weekendActivities.toLowerCase()} on weekends`);
    }
    
    const summary = insights.length > 0 
      ? `From what I understand, you're ${insights.join(", ")}. `
      : "Thanks for sharing about yourself. ";
      
    return `${summary}It's been great getting to know you! I'll use what I've learned to connect you with people you're likely to really click with. I'll let you know when I find great matches!`;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Process user response based on the current question category
  const processUserResponse = (response: string) => {
    const currentCategory = questionCategories[currentQuestionIndex];
    
    switch (currentCategory) {
      case "name":
        setUserProfile(prev => ({ ...prev, name: response.trim() }));
        break;
      case "location":
        setUserProfile(prev => ({ ...prev, location: response.trim() }));
        break;
      case "background":
        setUserProfile(prev => ({ 
          ...prev, 
          timeInCurrentCity: response.trim(),
          hometown: response.includes("from") ? response.split("from")[1]?.trim() : ""
        }));
        break;
      case "dailyLife":
        setUserProfile(prev => ({ 
          ...prev,
          occupation: response.trim()
        }));
        break;
      case "interests":
        setUserProfile(prev => ({ 
          ...prev, 
          interests: [...(prev.interests || []), response.trim()],
          talkingPoints: [...(prev.talkingPoints || []), response.trim()]
        }));
        break;
      case "socialStyle":
        setUserProfile(prev => ({ ...prev, socialStyle: response.trim(), socialEnergy: response.trim() }));
        break;
      case "weekendPlans":
        setUserProfile(prev => ({ ...prev, weekendActivities: response.trim() }));
        break;
      case "values":
        setUserProfile(prev => ({ 
          ...prev,
          values: response.trim(),
          personalInsights: [...(prev.personalInsights || []), response.trim()]
        }));
        break;
      case "lookingFor":
        setUserProfile(prev => ({ ...prev, lookingFor: response.trim() }));
        break;
      case "finalThoughts":
        setUserProfile(prev => ({ 
          ...prev,
          personalInsights: [...(prev.personalInsights || []), response.trim()]
        }));
        break;
    }
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
    
    // Add a "thinking" message
    setIsTyping(true);
    
    // Process the user's response
    processUserResponse(input);

    // After a delay to simulate thinking, send the next question
    setTimeout(() => {
      // Move to the next question category
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      
      const nextQuestion = getNextQuestion();
      
      // If we've reached the end of our questions
      if (currentQuestionIndex >= questionCategories.length) {
        setIsComplete(true);
        markUserAsOnboarded();
      }

      const newAiMessage: Message = {
        id: messages.length + 2,
        text: nextQuestion,
        sender: "ai",
      };
      
      setMessages((prev) => [...prev, newAiMessage]);
      setIsTyping(false);
    }, Math.random() * 1000 + 1000); // Random delay between 1-2 seconds for more natural feel
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

  // Generate messages based on category context
  const getMessageStyle = (message: Message) => {
    if (message.sender === "user") {
      return "bg-primary text-primary-foreground";
    }
    return "bg-muted";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur-md flex items-center justify-center relative z-10 shadow-sm">
        <div className="absolute left-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowRight className="h-5 w-5 rotate-180" />
            </Link>
          </Button>
        </div>
        <h1 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
          Chat with Twyne
        </h1>
      </div>

      {/* Chat Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-4 pb-20">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex items-start gap-3 ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8 mt-0.5 bg-purple-100 border border-purple-200">
                    <AvatarImage src="/lovable-uploads/01b56105-88b1-40dc-b8f9-4ab2f5222a85.png" alt="Twyne" />
                    <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs">
                      AI
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] ${getMessageStyle(
                    message
                  )} ${message.sender === "ai" ? "rounded-tl-sm" : "rounded-tr-sm"}`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>

                {message.sender === "user" && (
                  <Avatar className="h-8 w-8 mt-0.5 bg-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <Avatar className="h-8 w-8 mt-0.5 bg-purple-100 border border-purple-200">
                <AvatarImage src="/lovable-uploads/01b56105-88b1-40dc-b8f9-4ab2f5222a85.png" alt="Twyne" />
                <AvatarFallback className="bg-primary/20 text-primary-foreground text-xs">
                  AI
                </AvatarFallback>
              </Avatar>
              <div className="px-4 py-3 rounded-2xl rounded-tl-sm max-w-[80%] bg-muted">
                <div className="flex space-x-2">
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef}></div>
        </div>
      </div>

      {/* Footer with Input or Completion Message */}
      {isComplete ? (
        <div className="p-4 bg-background/95 backdrop-blur-md border-t">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-4 space-y-2">
              <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-2">
                <Smile className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-lg font-medium">Profile Created!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Thanks for chatting with me! I'll use what I've learned to connect you with people you'll genuinely click with.
              </p>
            </div>
            <Button asChild className="w-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Link to="/connections">See Your Connections</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-background/95 backdrop-blur-md border-t">
          <div className="max-w-2xl mx-auto relative">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              className="pr-12 pl-4 py-6 rounded-full border-muted bg-background shadow-sm"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="absolute right-1 top-1 h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingChat;
