
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

interface Conversation {
  messages: {
    role: "system" | "user" | "assistant";
    content: string;
  }[];
  userAnswers: string[];
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
  twyneTags?: string[];
  vibeSummary?: string;
  socialNeeds?: string;
  coreValues?: string;
  lifeContext?: string;
}

// OpenAI API key - in a real app, this would be stored securely in environment variables or backend
// For this demo, we're using it directly (not recommended for production)
const OPENAI_API_KEY = "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";

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

// Improved system prompt for the AI to guide its responses
const SYSTEM_PROMPT = `
You are Twyne, a warm, intuitive AI helping people reflect and connect. You're here to learn about the user in order to build a connection blueprint: their vibe, values, story, social energy, and what they need from others.

Your tone is conversational, curious, and emotionally intelligent.

With each reply:
- Ask just **one** follow-up question.
- Keep it short (1–2 sentences).
- Be *genuinely interested*, not robotic.
- Don't summarize — keep learning.

Example:
User: "I moved to Seattle last year."
Twyne: "Nice! What inspired the move?"

Now stay in this mode and keep going until prompted to stop.
`;

// Profile generation prompt
const PROFILE_GENERATION_PROMPT = `
You are Twyne, a warm, thoughtful, socially intelligent AI. Given the following conversation with a user, summarize what you learned about them in a way that feels reflective, intuitive, and human. Focus on who they are, what matters to them, their social vibe, and how they come across.

Generate a structured "Persona Summary" with the sections below. Each should have a short paragraph.

Raw Conversation:
[CONVERSATION]

Output strictly as valid JSON with this structure:
{
  "name": "Extract their name",
  "location": "Extract their location",
  "age": "Extract their age if mentioned",
  "hometown": "Extract their hometown if mentioned",
  "vibeSummary": "A warm, insightful paragraph about their overall vibe and personality",
  "socialNeeds": "How they approach social connections, what they need in relationships",
  "coreValues": "What matters most to them based on the conversation",
  "lifeContext": "Current life situation, background, or journey",
  "interests": ["Interest 1", "Interest 2", "Interest 3"],
  "socialStyle": "Their social interaction style",
  "connectionPreferences": "What they look for in connections",
  "personalInsights": ["Insight 1", "Insight 2"],
  "twyneTags": ["#Tag1", "#Tag2", "#Tag3", "#Tag4"],
  "talkingPoints": ["Topic 1", "Topic 2", "Topic 3"],
  "creativePursuits": "Their creative outlets and expressions",
  "mediaTastes": "Books, music, shows they enjoy",
  "lifeStory": "Brief background narrative",
  "careerOrEducation": "Work or study information if shared",
  "meaningfulAchievements": "What they're proud of",
  "lifePhilosophy": "Their worldview or personal philosophy",
  "challengesOvercome": "Significant challenges they've faced",
  "growthJourney": "How they've evolved",
  "friendshipPace": "How quickly they open up",
  "emotionalIntelligence": "How they relate to feelings"
}

Make sure ALL the JSON fields are included and properly formatted.
`;

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [{ role: "system", content: SYSTEM_PROMPT }],
    userAnswers: []
  });
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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to get AI response using OpenAI API
  const getAIResponse = async (userMessage: string): Promise<string> => {
    try {
      // Add user message to conversation history
      const updatedMessages = [
        ...conversation.messages,
        { role: "user", content: userMessage }
      ];

      console.log("Sending to OpenAI:", updatedMessages);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: updatedMessages,
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;
      
      // Save AI's response to conversation history
      setConversation(prev => ({
        messages: [
          ...updatedMessages,
          { role: "assistant", content: aiResponse }
        ],
        userAnswers: [...prev.userAnswers, userMessage]
      }));
      
      return aiResponse;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I'm having trouble processing that right now. Could you tell me more about yourself?";
    }
  };

  // Generate user profile using OpenAI
  const generateAIProfile = async (): Promise<UserProfile> => {
    try {
      // Format conversation for the profile generation prompt
      const formattedConversation = conversation.messages
        .filter(msg => msg.role !== "system")
        .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
        .join("\n\n");
      
      // Create prompt for profile generation
      const prompt = PROFILE_GENERATION_PROMPT.replace("[CONVERSATION]", formattedConversation);

      console.log("Sending profile generation prompt to OpenAI");

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            { role: "system", content: "You analyze conversations and create personality profiles." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI profile generation error:", errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const profileText = data.choices[0].message.content;
      
      console.log("Raw profile from OpenAI:", profileText);
      
      // Extract the JSON part from the response
      const jsonMatch = profileText.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : profileText;
      
      try {
        const profile = JSON.parse(jsonString);
        console.log("Parsed profile:", profile);
        
        // Ensure all required fields are present
        return {
          name: profile.name || userProfile.name || "",
          location: profile.location || userProfile.location || "",
          interests: Array.isArray(profile.interests) ? profile.interests : [],
          socialStyle: profile.socialStyle || "",
          connectionPreferences: profile.connectionPreferences || "",
          personalInsights: Array.isArray(profile.personalInsights) ? profile.personalInsights : [],
          vibeSummary: profile.vibeSummary || "",
          socialNeeds: profile.socialNeeds || "",
          coreValues: profile.coreValues || "",
          lifeContext: profile.lifeContext || "",
          twyneTags: Array.isArray(profile.twyneTags) ? profile.twyneTags : [],
          age: profile.age || "",
          hometown: profile.hometown || "",
          talkingPoints: Array.isArray(profile.talkingPoints) ? profile.talkingPoints : [],
          creativePursuits: profile.creativePursuits || "",
          mediaTastes: profile.mediaTastes || "",
          lifeStory: profile.lifeStory || "",
          careerOrEducation: profile.careerOrEducation || "",
          meaningfulAchievements: profile.meaningfulAchievements || "",
          lifePhilosophy: profile.lifePhilosophy || "",
          challengesOvercome: profile.challengesOvercome || "",
          growthJourney: profile.growthJourney || "",
          friendshipPace: profile.friendshipPace || "",
          emotionalIntelligence: profile.emotionalIntelligence || "",
          // Include any other fields returned by the AI
          ...profile
        };
      } catch (error) {
        console.error("Error parsing AI profile:", error, profileText);
        throw new Error("Failed to parse AI-generated profile");
      }
    } catch (error) {
      console.error("Error generating AI profile:", error);
      // Fallback to basic profile
      return {
        ...userProfile,
        vibeSummary: "Based on our conversation, you seem like an interesting person with unique perspectives.",
        socialNeeds: "You appear to value meaningful connections.",
        coreValues: "Authenticity and understanding seem important to you.",
        lifeContext: "You're on a personal journey of connection and growth.",
        twyneTags: ["#Authentic", "#Thoughtful"]
      };
    }
  };

  // Function to decide whether to continue the conversation or complete onboarding
  const shouldCompleteOnboarding = () => {
    // Complete onboarding after a minimum number of exchanges (8 questions)
    return currentQuestionIndex >= 8;
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

    // Process basic user info from first responses
    if (currentQuestionIndex === 0) {
      setUserProfile(prev => ({ ...prev, name: input.trim() }));
    } else if (currentQuestionIndex === 1) {
      setUserProfile(prev => ({ ...prev, location: input.trim() }));
    }

    // Increment the question index
    setCurrentQuestionIndex(currentQuestionIndex + 1);

    // Check if we should complete the onboarding process
    if (shouldCompleteOnboarding()) {
      // Generate AI profile and complete onboarding
      generateAIProfile().then(profile => {
        setUserProfile(profile);
        setIsTyping(false);
        setIsComplete(true);
        
        // If user is logged in, save the profile
        if (user) {
          markUserAsOnboarded(profile);
        }
      });
    } else {
      // Get next AI response
      setTimeout(() => {
        getAIResponse(input).then(aiResponse => {
          const newAiMessage: Message = {
            id: messages.length + 2,
            text: aiResponse,
            sender: "ai",
          };
          
          setMessages((prev) => [...prev, newAiMessage]);
          setIsTyping(false);
        });
      }, 1000);
    }
  };

  const markUserAsOnboarded = async (profile: UserProfile) => {
    if (user) {
      try {
        // Save user profile data to user metadata
        const { error } = await supabase.auth.updateUser({
          data: { 
            has_onboarded: true,
            profile_data: profile,
            conversation_data: conversation
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

  // Create a function to handle the end of onboarding
  const handleCompleteOnboarding = () => {
    // If user is logged in, take them to the connections page
    if (user) {
      navigate("/connections");
    } else {
      // If user is not logged in, prompt them to sign up or log in
      navigate("/auth");
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
        <>
          <ProfileCompletionDashboard 
            userProfile={userProfile}
          />
          <div className="p-4 flex justify-center">
            <Button onClick={handleCompleteOnboarding} className="px-8 py-2">
              {user ? "Go to Connections" : "Sign Up or Log In"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingChat;
