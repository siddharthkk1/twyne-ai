import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, SkipForward, MessageCircle, Loader, ArrowLeft, HelpCircle, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import ProfileInsightsDashboard from "@/components/connections/ProfileInsightsDashboard";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  interests: string[] | string; // Updated to accept both string and array
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
    text: "Hey there 👋 I'm Twyne — here to get to know you a bit and help you connect with people you'll actually vibe with. This usually takes around 5–10 minutes, and you can share whatever feels natural.",
    sender: "ai",
  },
  {
    id: 2,
    text: "Let's start light — what's your name or what do you like to be called?",
    sender: "ai",
  },
];

// Improved system prompt for the AI to guide its responses
const SYSTEM_PROMPT = `
You are Twyne — a warm, emotionally intelligent friend designed to deeply understand people so you can connect them with others who truly match their vibe. Your purpose is to help people feel seen, reflected, and understood.

Your goal is to learn about the real person behind the screen — their life story, personality, social energy, values, goals, and what they need from connection — through a thoughtful, open-ended conversation.

You're not just collecting data. You're listening closely, following emotional threads, and helping them reflect on who they are. Avoid asking users to define abstract traits like their "vibe," "values," or "story" directly. Instead, ask emotionally intelligent, grounded questions that let you infer those traits from what they share.

Pay attention to what the user speaks about with emotion, detail, or repetition — not just what they mention. Prioritize areas that seem to matter more to them, even if briefly mentioned but with depth or passion. Deprioritize passing mentions or facts without emotional weight.

---

A. Conversation Goals — What to Learn  
Aim to build a well-rounded understanding of the person. Don't rush, but don't get stuck — gently explore all of these:

1. **Vibes & Personality**
   - How you carry yourself in the world
   - Your social energy and interpersonal style
   - What makes you you (the essence of your personality)

2. **Interests & Activities**
   - Hobbies, passions, creative pursuits
   - Weekend activities, cultural tastes, forms of self-expression
   - What lights you up and makes time fly

3. **Inner World**
   - Values, beliefs, mindset, worldview
   - What matters deeply to you
   - How you see the world and your place in it

4. **Connections & Relationships**
   - How you vibe socially
   - What helps you feel safe or seen
   - What you're seeking in connection and friendship

5. **Growth & Journey**
   - Your life story, major transitions, and meaningful experiences
   - Aspirations, goals, things you're working toward
   - Questions you're exploring, next chapter of life

---

B. Flow & Coverage Guidance  
Be conversational and warm, but stay intentional. Your goal is to understand the full person — not just one side.

- If the user shares a lot about one topic (e.g. work or a passion), explore it meaningfully — then gently transition:  
  > "That's really cool — I'm curious, outside of that, what kind of people or energy bring out your best?"

- Track what's already been covered. If one area is missing, pivot with a soft touch.

---

C. Conversation Style

**Thread Smart, Not Flat**
- After each user reply, lightly acknowledge the different parts of what they said, but only dive deeper into the most emotionally meaningful thread.
- Prioritize topics that show emotion, passion, change, identity, or vulnerability.
- Avoid spending too long on low-signal threads like location unless emotionally charged.

**Phase Gently Into Depth**
- Start light and relatable. Gradually invite vulnerability based on tone and trust.
- Never force depth — invite it.

- Your responses should be warm, intuitive, and curious — and usually just 1–2 sentences.
- If the user shares something vulnerable, always respond with empathy before moving forward.
- Loop back to earlier important topics if they resurface naturally.

---

D. Important

- Do **not** summarize what the user has said mid-convo — just stay present and flow forward.
- Do **not** mention that you're building a profile — let the experience feel organic and emotionally grounded.
- If the user seems uncomfortable or unsure, let them skip or redirect the conversation.

---

E. At the End  
You'll use what you've learned to generate a warm, structured "Twyne Dashboard" — a high-level summary of their story, vibe, values, and connection style.

Until then, just stay curious, stay human, and get to know them — one thoughtful question at a time.
`;

// Profile generation prompt - updated to match new dashboard model
const PROFILE_GENERATION_PROMPT = `
You are Twyne, a warm, emotionally intelligent AI helping people feel seen, understood, and meaningfully connected.
Below is a conversation between you and a user. Based on what you learned, generate a structured Twyne Dashboard that captures who they are — including their vibes & personality, interests & activities, inner world, connections & relationships, and growth & journey.
This is not a cold profile. It's a reflection of their essence — how they show up in the world and what they need from others. Write with warmth, clarity, and care. Every section should feel specific, human, and true to the conversation.
Raw Conversation:
[CONVERSATION]
🧱 Output Format:
Return valid JSON in the following structure. All fields are required, even if empty:
{
  "name": "",
  "location": "",
  "age": "",
  "hometown": "",
  "job": "",
  "ethnicity": "",
  "religion": "",
  "currentSeason": "",             // Current life context — stage, city move, career phase, etc.
  "vibeSummary": "",               // Overall vibe and energy — a warm personality overview
  "lifeStory": "",                 // Short narrative about their past, upbringing, turning points
  "interests": [],                 // Specific interests, passions, and hobbies
  "creativePursuits": "",          // How they express themselves creatively, if shared
  "mediaTastes": "",               // Books, music, shows they enjoy
  "careerOrEducation": "",         // What they do for work or school, if shared
  "meaningfulAchievements": "",    // What they're proud of
  "lifePhilosophy": "",            // Worldview or personal beliefs that guide them
  "coreValues": "",                // Values that seem to matter most to them
  "goals": "",                     // Personal or life goals they shared
  "growthJourney": "",             // How they've changed or what they're working on
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
Infer gently — do not make things up. If something was only hinted at, you can say "They seem to…" or "They come across as…".
Use natural language, not clinical tone.
Keep all field values non-null, even if it's just: "dealBreakers": "".
`;

const COVERAGE_EVAL_PROMPT = `
You are reviewing a conversation between Twyne (a warm, curious AI) and a user. Twyne's job is to learn about the user across these 6 categories:

1. Overview – name, location, general vibe
2. Life Story – where they grew up, key events, current life season
3. Interests & Identity – hobbies, passions, cultural tastes, self-expression
4. Vibe & Personality – traits, social energy, how they're perceived
5. Inner World – values, beliefs, personal philosophy, goals
6. Connection Needs – what helps them feel safe, who they click with, what they're looking for

For each category:
- Say if it's **Complete**, **Partial**, or **Missing** — and why.
- Then say whether we have enough info to stop and build a profile.

Return your output in **valid JSON**:

{
  "overview": "",
  "lifeStory": "",
  "interestsIdentity": "",
  "vibePersonality": "",
  "innerWorld": "",
  "connectionNeeds": "",
  "enoughToStop": false
}

Here is the conversation so far:
[CONVERSATION]
`;

const OnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
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
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(true);
  const [showGuidanceInfo, setShowGuidanceInfo] = useState(false);

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

  const checkConversationCoverage = async (conversation: Conversation): Promise<{ enoughToStop: boolean }> => {
    const formattedConversation = conversation.messages
      .filter(m => m.role !== "system")
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n\n");

    const prompt = COVERAGE_EVAL_PROMPT.replace("[CONVERSATION]", formattedConversation);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You evaluate conversation coverage for Twyne onboarding." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    const data = await response.json();
    const resultText = data.choices?.[0]?.message?.content || "";
    const jsonMatch = resultText.match(/\{[\s\S]*?\}/);
    const json = jsonMatch ? JSON.parse(jsonMatch[0]) : { enoughToStop: false };

    console.log("Coverage check result:", json);
    return json;
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

  const handleSend = (message?: string) => {
    const textToSend = message || input;
    if (!textToSend.trim()) return;
  
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      sender: "user",
    };
  
    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);
  
    if (currentQuestionIndex === 0) {
      // After the user provides their name, save it
      setUserProfile(prev => ({ ...prev, name: textToSend.trim() }));
    } else if (currentQuestionIndex === 1) {
      setUserProfile(prev => ({ ...prev, location: textToSend.trim() }));
    }
    
    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);
    
    // Check if we have enough coverage to stop before getting next AI response
    const draftConversation: Conversation = {
      messages: [
        ...conversation.messages,
        { role: "user", content: textToSend }
      ],
      userAnswers: [...conversation.userAnswers, textToSend]
    };
    
    checkConversationCoverage(draftConversation).then(result => {
      if (result.enoughToStop && currentQuestionIndex >= 8) {
        const closingMessage: Message = {
          id: messages.length + 2,
          text: "Thanks for sharing all that 🙏 Building your personal dashboard now...",
          sender: "ai",
        };
    
        setMessages(prev => [...prev, closingMessage]);
        setIsTyping(false);
        setIsGeneratingProfile(true); // Show loading screen while generating profile
    
        generateAIProfile().then(profile => {
          setUserProfile(profile);
          setIsTyping(false);
          setIsGeneratingProfile(false); // Hide loading screen
          setIsComplete(true);
          setConversation({
            messages: [
              ...draftConversation.messages,
              { role: "assistant", content: closingMessage.text }
            ],
            userAnswers: draftConversation.userAnswers
          });
    
          if (user) markUserAsOnboarded(profile);
        });
      } else {
        // Not enough — proceed to get the AI's next question
        setTimeout(() => {
          getAIResponse(textToSend).then(aiResponse => {
            const newAiMessage: Message = {
              id: messages.length + 2,
              text: aiResponse,
              sender: "ai",
            };
    
            const updatedConversation: Conversation = {
              messages: [
                ...conversation.messages,
                { role: "user", content: textToSend },
                { role: "assistant", content: aiResponse }
              ],
              userAnswers: [...conversation.userAnswers, textToSend]
            };
    
            setMessages((prev) => [...prev, newAiMessage]);
            setConversation(updatedConversation);
            setIsTyping(false);
          });
        }, 1000);
      }
    });
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

  // Function to get the first letter of the user's name for avatar
  const getNameInitial = () => {
    return userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "?";
  };

  // Get progress percent based on conversation length
  // This intentionally doesn't show exact percentages but gives a general feeling of progress
  const getProgress = (): number => {
    // Start at 10%, increase based on number of messages
    // Cap at 90% until final profile generation
    if (isComplete) return 100;
    if (isGeneratingProfile) return 95;
    
    const baseProgress = 10;
    // We subtract 2 to account for the initial AI messages
    const userMessageCount = messages.filter(msg => msg.sender === "user").length;
    
    // Progress increases with each message, but at a decreasing rate
    // This creates the feeling of progress without giving exact timing
    const progressPerMessage = Math.max(5, 70 / Math.max(1, userMessageCount + 5));
    
    // Calculate progress but cap it at 90%
    const calculatedProgress = Math.min(90, baseProgress + (userMessageCount * progressPerMessage));
    
    return calculatedProgress;
  };

  // Loading screen component
  const LoadingScreen = () => (
    <div className="flex flex-col items-center justify-center space-y-4 py-12">
      <div className="relative">
        <Loader className="h-12 w-12 text-primary animate-spin" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span className="h-4 w-4 bg-background rounded-full block"></span>
        </div>
      </div>
      <h2 className="text-xl font-medium">Creating Your Dashboard</h2>
      <p className="text-muted-foreground text-center max-w-md">
        Building your personal insights based on our conversation. This helps Twyne match you with meaningful connections.
      </p>
    </div>
  );

  // Guidance info component
  const GuidanceInfo = () => (
    <div className={`fixed ${showGuidanceInfo ? 'bottom-[80px]' : 'bottom-[-400px]'} right-4 w-80 bg-background/90 backdrop-blur-md border border-border shadow-lg rounded-lg p-4 transition-all duration-300 z-50`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-primary" />
          How This Conversation Works
        </h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowGuidanceInfo(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-3 text-sm text-muted-foreground">
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>This is <span className="font-medium text-foreground">private</span> — just between you and Twyne.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>You'll decide later what (if anything) gets shared with others.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>Not sure about something? It's totally fine to say "idk," "skip," or ask to talk about something else.</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-primary">•</span>
          <span>What you choose to go into (or not) helps Twyne get your vibe — no pressure either way.</span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <CreateAccountPrompt open={showCreateAccountPrompt} onOpenChange={setShowCreateAccountPrompt} />
      <GuidanceInfo />
      
      {!isComplete ? (
        <>
          {/* Fixed header with back button and progress indicator */}
          <div className="fixed top-0 left-0 right-0 z-10 backdrop-blur-lg bg-background/80 border-b">
            <div className="container mx-auto px-4 pt-6 flex justify-between items-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/onboarding")}
                className="text-sm flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to options
              </Button>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-background/50">
                  {isGeneratingProfile ? "Creating profile..." : "Getting to know you"}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => setShowGuidanceInfo(!showGuidanceInfo)}
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Help
                </Button>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="container mx-auto px-4 mt-2 pb-2">
              <Progress value={getProgress()} className="h-1" />
            </div>
          </div>
          
          {/* Chat content - added padding-top to avoid overlap with fixed header */}
          <div className="flex-1 p-4 pt-24 overflow-y-auto">
            <div className="space-y-4 pb-4 max-w-3xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`animate-fade-in flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="mr-2 mt-1 flex-shrink-0">
                      <Avatar className="h-8 w-8 bg-primary/20 border-2 border-primary">
                        <AvatarFallback className="text-primary text-xs font-medium">TW</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  <div
                    className={`${
                      message.sender === "user" 
                        ? "chat-bubble-user bg-primary/90 text-primary-foreground ml-auto shadow-lg" 
                        : "chat-bubble-ai bg-background border border-border/50 backdrop-blur-sm shadow-md"
                    } rounded-2xl p-4 max-w-[85%] md:max-w-[70%] transition-all duration-200`}
                  >
                    {message.text}
                  </div>
                  {message.sender === "user" && (
                    <div className="ml-2 mt-1 flex-shrink-0">
                      <Avatar className="h-8 w-8 bg-muted">
                        <AvatarFallback>{getNameInitial()}</AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex">
                  <div className="mr-2 mt-1 flex-shrink-0">
                    <Avatar className="h-8 w-8 bg-primary/20 border-2 border-primary">
                      <AvatarFallback className="text-primary text-xs font-medium">TW</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="chat-bubble-ai bg-background border border-border/50 shadow-sm backdrop-blur-sm rounded-2xl p-4 animate-pulse flex space-x-1 w-16">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animation-delay-200"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animation-delay-500"></div>
                  </div>
                </div>
              )}
              {isGeneratingProfile && <LoadingScreen />}
              <div ref={messagesEndRef}></div>
            </div>
          </div>

          <div className="p-4 backdrop-blur-lg bg-background/80 border-t sticky bottom-0">
            <div className="max-w-3xl mx-auto">
              {/* Quick Action Buttons moved above the input */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSend("I'm not sure / I'd prefer to skip this question")}
                  disabled={isTyping || isGeneratingProfile}
                  className="bg-background/70 backdrop-blur-sm border border-border/50 hover:bg-accent/10 transition-all duration-200 rounded-full text-sm shadow-sm"
                >
                  <SkipForward className="h-3 w-3 mr-1" /> 
                  I'm not sure / skip
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSend("Let's talk about something else")}
                  disabled={isTyping || isGeneratingProfile}
                  className="bg-background/70 backdrop-blur-sm border border-border/50 hover:bg-accent/10 transition-all duration-200 rounded-full text-sm shadow-sm"
                >
                  <MessageCircle className="h-3 w-3 mr-1" /> 
                  Let's talk about something else
                </Button>
              </div>
              
              {/* Input Field and Send Button - Changed Input to Textarea */}
              <div className="flex items-end space-x-2">
                <Textarea
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isTyping || isGeneratingProfile}
                  className="rounded-2xl shadow-sm bg-background/70 backdrop-blur-sm border border-border/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 min-h-[44px]"
                  style={{ 
                    maxHeight: '150px',
                    lineHeight: '1.5',
                    padding: '10px 14px'
                  }}
                />
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={isTyping || isGeneratingProfile || !input.trim()}
                  className="rounded-full shadow-md bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 transition-all duration-200"
                >
                  <Send size={18} />
                </Button>
              </div>
              
              {/* Show guidance toggle reminder */}
              {!showGuidanceInfo && (
                <div className="mt-3 text-center">
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setShowGuidanceInfo(true)}
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Need help? How this conversation works
                  </Button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>          
          <div className="flex-1">
            <ProfileCompletionDashboard userProfile={userProfile} />
          </div>
        </>
      )}
    </div>
  );
};

export default OnboardingChat;
