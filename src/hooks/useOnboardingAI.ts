
import { useState } from 'react';
import { Conversation, UserProfile, ChatRole } from '@/types/chat';
import { 
  SYSTEM_PROMPT_STRUCTURED, 
  SYSTEM_PROMPT_PLAYFUL, 
  SYSTEM_PROMPT_YOUNG_ADULT,
  getAIResponse, 
  generateAIProfile,
  getRandomSeedMessage 
} from '@/utils/aiUtils';
import { toast } from "@/components/ui/use-toast";

export const useOnboardingAI = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [{ role: "system" as ChatRole, content: SYSTEM_PROMPT_PLAYFUL }], // Default to playful
    userAnswers: []
  });

  // Initialize chat with AI greeting
  const initializeChat = async (systemPrompt: string) => {
    setIsInitializing(true);
    setIsTyping(true);
    
    try {
      // Create initial conversation with just the system prompt
      const initialConversation: Conversation = {
        messages: [{ role: "system" as ChatRole, content: systemPrompt }],
        userAnswers: []
      };
      
      let aiGreeting: string;
      
      // Use a seed message if in playful mode, otherwise get from AI
      if (systemPrompt === SYSTEM_PROMPT_PLAYFUL) {
        aiGreeting = getRandomSeedMessage();
      } else {
        // Get AI greeting with specific guidance to ask for name
        aiGreeting = await getAIResponse(
          initialConversation, 
          "", // Empty user message to trigger greeting
          "Please introduce yourself and ask for the user's name in a conversational way."
        );
      }
      
      // Update conversation with AI greeting
      const updatedConversation = {
        messages: [
          ...initialConversation.messages,
          { role: "assistant" as ChatRole, content: aiGreeting }
        ],
        userAnswers: []
      };
      
      return { aiGreeting, updatedConversation };
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      
      // Fallback greeting if AI fails
      let fallbackGreeting: string;
      
      if (systemPrompt === SYSTEM_PROMPT_PLAYFUL) {
        fallbackGreeting = getRandomSeedMessage();
      } else {
        fallbackGreeting = "Hey there! I'm Twyne — let's chat and get to know you better. What's your name?";
      }
      
      const fallbackConversation = {
        messages: [
          { role: "system" as ChatRole, content: systemPrompt },
          { role: "assistant" as ChatRole, content: fallbackGreeting }
        ],
        userAnswers: []
      };
      
      return { aiGreeting: fallbackGreeting, updatedConversation: fallbackConversation };
    } finally {
      setIsInitializing(false);
      setIsTyping(false);
    }
  };

  const generateProfile = async (finalConversation: Conversation) => {
    setIsGeneratingProfile(true);
    
    try {
      const profile = await generateAIProfile(finalConversation);
      setIsGeneratingProfile(false);
      return profile;
    } catch (error) {
      console.error("Error generating profile:", error);
      setIsGeneratingProfile(false);
      toast({
        title: "Error generating profile",
        description: "We encountered an issue creating your profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    conversation,
    setConversation,
    isTyping,
    setIsTyping,
    isInitializing,
    setIsInitializing,
    isGeneratingProfile,
    initializeChat,
    generateProfile
  };
};
