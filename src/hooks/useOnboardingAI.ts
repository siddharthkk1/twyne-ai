
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
  const initializeChat = async (systemPrompt: string, userName?: string) => {
    setIsInitializing(true);
    setIsTyping(true);
    
    try {
      // Create initial conversation with just the system prompt
      const initialConversation: Conversation = {
        messages: [{ role: "system" as ChatRole, content: systemPrompt }],
        userAnswers: []
      };
      
      // If we have a userName, add guidance for the AI
      if (userName) {
        initialConversation.messages.push({
          role: "assistant" as ChatRole,
          content: `The user's name is ${userName}. Please personalize your responses accordingly.`
        });
      }
      
      let aiGreeting: string;
      
      // Use a seed message if in playful mode, otherwise get from AI
      if (systemPrompt === SYSTEM_PROMPT_PLAYFUL) {
        // Personalize greeting with name if available
        aiGreeting = userName ? 
          `Hey ${userName}! ${getRandomSeedMessage()}` :
          getRandomSeedMessage();
      } else {
        // Get AI greeting with specific guidance to use the name if available
        const nameGuidance = userName ? 
          `The user's name is ${userName}. Start by greeting them by name and introducing yourself.` :
          "Please introduce yourself and ask for the user's name in a conversational way.";
          
        // Update the conversation temporarily to include our guidance
        const guidedConversation = {
          ...initialConversation,
          messages: [
            ...initialConversation.messages,
            { role: "user" as ChatRole, content: nameGuidance }
          ]
        };
        
        // Call getAIResponse with the single conversation argument
        aiGreeting = await getAIResponse(guidedConversation);
        
        // Remove the guidance message as it was just for prompting
        initialConversation.messages = initialConversation.messages.filter(
          msg => msg.role !== "user" || msg.content !== nameGuidance
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
        fallbackGreeting = userName ? 
          `Hey ${userName}! ${getRandomSeedMessage()}` :
          getRandomSeedMessage();
      } else {
        fallbackGreeting = userName ?
          `Hey ${userName}! I'm Twyne — let's chat and get to know you better.` :
          "Hey there! I'm Twyne — let's chat and get to know you better. What's your name?";
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

  const generateProfile = async (finalConversation: Conversation, userName?: string) => {
    setIsGeneratingProfile(true);
    
    try {
      // Pass the userName to the profile generation function for better personalization
      const profile = await generateAIProfile(finalConversation, userName);
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
