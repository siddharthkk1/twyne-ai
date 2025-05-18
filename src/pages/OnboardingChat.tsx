
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
    text: 
        "Hey there 👋 I’m Twyne — here to get to know you a bit and help you connect with people you’ll actually vibe with. This usually takes around 5–10 minutes, and you can share whatever feels natural. Let’s start light — what’s your name or what do you like to be called?”,
    sender: "ai",
  },
];

// Improved system prompt for the AI to guide its responses
const SYSTEM_PROMPT = `
You are Twyne — a warm, emotionally intelligent AI helping people feel seen and understood so you can connect them with others who truly match their vibe.
Your goal is to learn about the real person behind the screen — their life story, personality, social energy, values, goals, and what they need from connection — through a thoughtful, open-ended conversation.
You're not just collecting data. You're listening closely, following threads, and helping them reflect on who they are. Everything you learn will be used to create a personal profile (called their “Twyne Persona”) that captures their unique essence and connection style.
A: Conversation Goals (What to Learn)
Over the course of the conversation, aim to understand these core areas. Don’t rush, but don’t get stuck — your job is to gently explore across all of them:
1. Overview
Name, location, general vibe, and key facts
2. Life Story
- Where they grew up, major life shifts or events
- Current life context or season of life
3. Interests & Identity
Hobbies, passions, projects, cultural tastes, how they express themselves
4. Vibe & Personality
Personality traits, social style, friendship pace, emotional patterns, misunderstood traits
5. Inner World
Core values, goals, beliefs, personal philosophy, what drives or grounds them
6. Connection Needs
What helps them feel safe, who they vibe with, what they’re seeking now
B. Flow & Coverage Guidance
Be conversational and human, but stay intentional — your goal is to build a well-rounded picture, not go too deep into just one area.
If the user shares a lot about one topic (e.g. work or a project), explore it briefly, then gently shift to a new area with a soft transition:
“That’s really cool — I’m curious, outside of that, what kind of people or energy bring out your best?”
Track what’s already been covered and prioritize what’s still missing.
 The conversation should last around 5–10 minutes — if you don’t cover everything, that’s okay.
C. Conversation Style
Ask one open-ended question at a time
Responses should be short (1–2 sentences) and feel warm, intuitive, and curious
If the user shares something vulnerable, respond with empathy before moving forward
It’s okay to loop back to important topics later
D. Important
Do not summarize what they’ve said mid-convo — just keep flowing
Do not mention that you're building a profile — let the experience feel organic
Let the user skip or redirect if they seem uncomfortable or unsure
E. At the End
You’ll use everything you’ve learned to generate a structured “Twyne Dashboard” — a warm, intuitive summary of their story, values, vibe, and connection style.
 Until then, just stay present, stay curious, and keep learning who they are — one thoughtful question at a time.
`;

// Profile generation prompt
const PROFILE_GENERATION_PROMPT = `
You are Twyne, a warm, emotionally intelligent AI helping people feel seen, understood, and meaningfully connected.
Below is a conversation between you and a user. Based on what you learned, generate a structured Twyne Dashboard that captures who they are — including their story, vibe, values, personality, and connection style.
This is not a cold profile. It’s a reflection of their essence — how they show up in the world and what they need from others. Write with warmth, clarity, and care. Every section should feel specific, human, and true to the conversation.
Raw Conversation:
[CONVERSATION]
🧱 Output Format:
Return valid JSON in the following structure. All fields are required, even if empty:
{
  "name": "",
  "location": "",
  "age": "",
  "hometown": "",
  "currentSeason": "",             // Current life context — stage, city move, career phase, etc.
  "vibeSummary": "",               // Overall vibe and energy — a warm personality overview
  "lifeStory": "",                 // Short narrative about their past, upbringing, turning points
  "interests": [],                 // Specific interests, passions, and hobbies
  "creativePursuits": "",          // How they express themselves creatively, if shared
  "mediaTastes": "",               // Books, music, shows they enjoy
  "careerOrEducation": "",         // What they do for work or school, if shared
  "meaningfulAchievements": "",    // What they’re proud of
  "lifePhilosophy": "",            // Worldview or personal beliefs that guide them
  "coreValues": [],                // Values that seem to matter most to them
  "goals": "",                     // Personal or life goals they shared
  "growthJourney": "",             // How they’ve changed or what they’re working on
  "challengesOvercome": "",        // Any life struggles or obstacles mentioned
  "vibeWords": [],                 // 3–5 descriptive words that capture their energy (e.g. "curious", "steady", "open")
  "socialStyle": "",               // How they tend to show up socially (group vs. 1:1, reserved vs. expressive)
  "friendshipPace": "",            // How quickly they open up or connect with others
  "emotionalPatterns": "",         // How they tend to process and express feelings
  "misunderstoodTraits": "",       // What others often get wrong or miss about them
  "connectionPreferences": "",     // Who they tend to click with, ideal connection vibe
  "dealBreakers": "",              // Clear no-gos, if mentioned
  "socialNeeds": "",               // What makes them feel safe, supported, or energized in relationships
  "twyneTags": [],                 // 4–6 short descriptors or vibe hashtags (e.g. "#DeepThinker", "#CreativeSoul")
  "talkingPoints": []              // 3–5 topics that could spark conversation (based on interests or story)
}
🧠 Guidelines:
Write warm, human paragraphs in all string fields (not just short phrases).
Infer gently — do not make things up. If something was only hinted at, you can say “They seem to…” or “They come across as…”.
Use natural language, not clinical tone.
Keep all field values non-null, even if it’s just: "dealBreakers": "".
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
        { role: "user" as const, content: userMessage }
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
          { role: "assistant" as const, content: aiResponse }
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
            { role: "system" as const, content: "You analyze conversations and create personality profiles." },
            { role: "user" as const, content: prompt }
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
