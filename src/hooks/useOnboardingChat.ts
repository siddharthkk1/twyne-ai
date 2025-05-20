
import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Message, Conversation, UserProfile } from '@/types/chat';
import { SYSTEM_PROMPT } from '@/utils/aiUtils';
import { getAIResponse, generateAIProfile, checkConversationCoverage } from '@/utils/aiUtils';

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

export const useOnboardingChat = () => {
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
  const [conversationMode, setConversationMode] = useState<"text" | "voice">("text");
  const [showModeSelection, setShowModeSelection] = useState(true);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      setUserProfile(prev => ({ ...prev, name: textToSend.trim() }));
    } else if (currentQuestionIndex === 1) {
      setUserProfile(prev => ({ ...prev, location: textToSend.trim() }));
    }

    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);

    const draftConversation: Conversation = {
      messages: [...conversation.messages, { role: "user", content: textToSend }],
      userAnswers: [...conversation.userAnswers, textToSend]
    };

    const userMessageCount = draftConversation.userAnswers.length;
    const shouldRunCheck = userMessageCount >= 8;
    const isCompletionTurn = userMessageCount % 3 === 0;

    const handleContinue = (aiResponse: string) => {
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

      setMessages(prev => [...prev, newAiMessage]);
      setConversation(updatedConversation);
      setIsTyping(false);
    };

    if (shouldRunCheck) {
      checkConversationCoverage(draftConversation).then(async (result) => {
        if (result.enoughToStop && isCompletionTurn) {
          const closingMessage: Message = {
            id: messages.length + 2,
            text: "Thanks for sharing all that 🙏 Building your personal dashboard now...",
            sender: "ai",
          };

          setMessages(prev => [...prev, closingMessage]);
          setIsTyping(false);
          setIsGeneratingProfile(true);

          try {
            const profile = await generateAIProfile(draftConversation);
            // Ensure all required fields are present
            const completeProfile = {
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
              emotionalIntelligence: profile.emotionalIntelligence || "",
              // Include any other fields returned by the AI
              ...profile
            };
            
            setUserProfile(completeProfile);
            setIsGeneratingProfile(false);
            setIsComplete(true);
            setConversation({
              messages: [...draftConversation.messages, { role: "assistant", content: closingMessage.text }],
              userAnswers: draftConversation.userAnswers
            });

            if (user) markUserAsOnboarded(completeProfile);
          } catch (error) {
            console.error("Error in profile generation:", error);
            // Handle error with fallback
            setIsGeneratingProfile(false);
            toast({
              title: "Error generating profile",
              description: "We encountered an issue creating your profile. Let's continue our conversation.",
              variant: "destructive",
            });
            // Continue conversation instead
            getAIResponse(conversation, textToSend).then(handleContinue);
          }
        } else {
          // Redirect guidance using missing fields
          const missingCategories = Object.entries(result)
            .filter(([key, val]) =>
              ["overview", "lifeStory", "interestsIdentity", "vibePersonality", "innerWorld", "connectionNeeds"].includes(key) &&
              val === "Missing"
            )
            .map(([key]) => key);

          let assistantGuidance = "";
          if (missingCategories.length > 0) {
            assistantGuidance = `After responding to the user's last message, if the topic feels complete or winds down, gently pivot the conversation toward these areas: ${missingCategories.join(", ")}. Be subtle and natural — don't make it obvious.`;
          }

          const updatedMessages: Conversation["messages"] = [
            ...draftConversation.messages,
            ...(assistantGuidance
              ? [{ role: "system", content: assistantGuidance }]
              : [])
          ];

          getAIResponse(conversation, textToSend, updatedMessages).then(handleContinue);
        }
      });
    } else {
      getAIResponse(conversation, textToSend).then(handleContinue);
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

  // Function to handle conversation mode selection (text or voice)
  const handleModeSelection = (mode: "text" | "voice") => {
    setConversationMode(mode);
    setShowModeSelection(false);
  };

  // Function to get the first letter of the user's name for avatar
  const getNameInitial = () => {
    return userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "?";
  };

  return {
    messages,
    input,
    setInput,
    isComplete,
    isTyping,
    isGeneratingProfile,
    userProfile,
    messagesEndRef,
    showCreateAccountPrompt,
    setShowCreateAccountPrompt,
    showGuidanceInfo,
    setShowGuidanceInfo,
    conversationMode,
    setConversationMode,
    showModeSelection,
    getProgress,
    handleModeSelection,
    getNameInitial,
    handleSend
  };
};
