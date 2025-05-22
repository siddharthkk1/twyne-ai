import { useState, useRef, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Message, Conversation, UserProfile, ChatRole } from '@/types/chat';
import { 
  SYSTEM_PROMPT_STRUCTURED, 
  SYSTEM_PROMPT_PLAYFUL, 
  SYSTEM_PROMPT_YOUNG_ADULT,
  getAIResponse, 
  generateAIProfile,
  getRandomSeedMessage 
} from '@/utils/aiUtils';
import { PromptModeType, usePromptMode } from './usePromptMode';
import { ConversationModeType, useConversationMode } from './useConversationMode';
import { useSmsConversation } from './useSmsConversation';
import { useSupabaseSync } from './useSupabaseSync';
import { supabase } from "@/integrations/supabase/client";
import type { Json } from '@/integrations/supabase/types';

// Maximum number of messages before automatically completing the onboarding
const MESSAGE_CAP = 20; // Count only user messages, not AI messages

export const useOnboardingChat = () => {
  const { promptMode, setPromptMode, showPromptSelection, setShowPromptSelection, handlePromptModeChange } = usePromptMode();
  const { 
    conversationMode, 
    setConversationMode, 
    showModeSelection, 
    setShowModeSelection, 
    phoneNumber, 
    setPhoneNumber, 
    isSmsVerified, 
    handleModeSelection, 
    startSmsConversation 
  } = useConversationMode();
  const { handleSmsResponse } = useSmsConversation();
  const { saveOnboardingData } = useSupabaseSync();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [{ role: "system" as ChatRole, content: SYSTEM_PROMPT_PLAYFUL }], // Default to playful
    userAnswers: []
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    location: "",
    interests: [],
    socialStyle: "",
    connectionPreferences: "",
    personalInsights: [],
    personalityTraits: {
      extroversion: 50,
      openness: 50,
      empathy: 50,
      structure: 50
    }
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, clearNewUserFlag } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(true);
  const [showGuidanceInfo, setShowGuidanceInfo] = useState(false);
  const [userName, setUserName] = useState<string>(""); // Store name separately

  // Reset conversation when prompt mode changes and initialize with AI greeting
  useEffect(() => {
    let systemPrompt = SYSTEM_PROMPT_STRUCTURED;
    
    if (promptMode === "playful") {
      systemPrompt = SYSTEM_PROMPT_PLAYFUL;
    } else if (promptMode === "young-adult") {
      systemPrompt = SYSTEM_PROMPT_YOUNG_ADULT;
    }
    
    // Reset messages and conversation
    setMessages([]);
    setConversation({
      messages: [{ role: "system" as ChatRole, content: systemPrompt }],
      userAnswers: []
    });
    setCurrentQuestionIndex(0);
    
    // Initialize chat with AI greeting
    initializeChat(systemPrompt);
  }, [promptMode]);

  // Initialize chat with AI greeting
  const initializeChat = async (systemPrompt: string) => {
    setIsInitializing(true);
    setIsTyping(true);
    
    try {
      // Create initial conversation with just the system prompt
      const initialConversation: Conversation = {
        messages: [{ role: "system", content: systemPrompt }],
        userAnswers: []
      };
      
      let aiGreeting: string;
      
      // Use a seed message if in playful mode, otherwise get from AI
      if (promptMode === "playful") {
        aiGreeting = getRandomSeedMessage();
      } else {
        // Get AI greeting
        aiGreeting = await getAIResponse(
          initialConversation, 
          "", // Empty user message to trigger greeting
          "Please introduce yourself and ask for the user's name in a conversational way."
        );
      }
      
      // Add AI greeting to messages
      const greetingMessage: Message = {
        id: 1,
        text: aiGreeting,
        sender: "ai"
      };
      
      setMessages([greetingMessage]);
      
      // Update conversation with AI greeting
      setConversation({
        messages: [
          ...initialConversation.messages,
          { role: "assistant", content: aiGreeting }
        ],
        userAnswers: []
      });
      
    } catch (error) {
      console.error("Failed to initialize chat:", error);
      
      // Fallback greeting if AI fails
      let fallbackGreeting: string;
      
      if (promptMode === "playful") {
        fallbackGreeting = getRandomSeedMessage();
      } else {
        fallbackGreeting = "Hey there! I'm Twyne — let's chat and get to know you better. What's your name?";
      }
      
      const fallbackMessage: Message = {
        id: 1,
        text: fallbackGreeting,
        sender: "ai"
      };
      
      setMessages([fallbackMessage]);
      
      // Update conversation with fallback greeting
      setConversation({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "assistant", content: fallbackGreeting }
        ],
        userAnswers: []
      });
    } finally {
      setIsInitializing(false);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = (message?: string) => {
    const textToSend = message || input;
    if (!textToSend.trim()) return;

    // Check if we've reached the message cap
    // Count only user messages for the message cap
    const userMessageCount = conversation.userAnswers.length;
    
    if (userMessageCount >= MESSAGE_CAP - 1) { // -1 to account for the new user message we're about to add
      // Add user message to UI
      const newUserMessage: Message = {
        id: messages.length + 1,
        text: textToSend,
        sender: "user",
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");
      
      // Add closing message
      const closingMessage: Message = {
        id: messages.length + 2,
        text: "Thanks for sharing! I think I've got enough to understand your vibe. Building your personal dashboard now...",
        sender: "ai",
      };

      setMessages(prev => [...prev, closingMessage]);
      setIsTyping(false);
      setIsGeneratingProfile(true);

      // Update conversation with user's final message
      const finalConversation = {
        messages: [
          ...conversation.messages, 
          { role: "user" as ChatRole, content: textToSend },
          { role: "assistant" as ChatRole, content: closingMessage.text }
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };
      
      setConversation(finalConversation);

      // Generate profile and complete onboarding
      generateAIProfile(finalConversation)
        .then(profile => {
          setUserProfile(profile);
          setIsGeneratingProfile(false);
          setIsComplete(true);
          
          // Save conversation to Supabase
          saveOnboardingData(profile, finalConversation, promptMode, user, clearNewUserFlag);
        })
        .catch(error => {
          console.error("Error generating profile at message cap:", error);
          setIsGeneratingProfile(false);
          toast({
            title: "Error generating profile",
            description: "We encountered an issue creating your profile.",
            variant: "destructive",
          });
        });
      
      return;
    }

    // Add user message to UI
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: textToSend,
      sender: "user",
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsTyping(true);

    // Update basic profile info for first question - extract name
    if (currentQuestionIndex === 0) {
      setUserName(textToSend.trim());
      setUserProfile(prev => ({ ...prev, name: textToSend.trim() }));
    } else if (currentQuestionIndex === 1) {
      setUserProfile(prev => ({ ...prev, location: textToSend.trim() }));
    }

    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);

    // Prepare conversation data for API request
    const draftConversation: Conversation = {
      messages: [...conversation.messages, { role: "user" as ChatRole, content: textToSend }],
      userAnswers: [...conversation.userAnswers, textToSend]
    };

    // If in SMS mode, handle sending messages via SMS
    if (conversationMode === "sms") {
      // In a real implementation, this would send the message to the SMS edge function
      handleSmsResponse(
        textToSend, 
        draftConversation, 
        conversation, 
        setMessages, 
        setConversation, 
        setIsTyping, 
        phoneNumber
      );
      return;
    }

    // Function to handle AI response and update UI
    const handleContinue = (aiResponse: string) => {
      // Add error checking for empty or invalid responses
      if (!aiResponse || aiResponse.trim() === "") {
        console.error("Empty AI response received");
        setIsTyping(false);
        toast({
          title: "Connection issue",
          description: "We're having trouble connecting to our AI. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const newAiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai",
      };

      const updatedConversation: Conversation = {
        messages: [
          ...conversation.messages,
          { role: "user" as ChatRole, content: textToSend },
          { role: "assistant" as ChatRole, content: aiResponse }
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };

      setMessages(prev => [...prev, newAiMessage]);
      setConversation(updatedConversation);
      setIsTyping(false);
    };

    // Removing coverage checks as requested, but keeping a simplified approach
    // to determine when to end the conversation
    const updatedUserMessageCount = draftConversation.userAnswers.length;
    
    // If we've had a substantial conversation and it's time to wrap up
    if (updatedUserMessageCount >= 15 && updatedUserMessageCount % 5 === 0 && updatedUserMessageCount >= MESSAGE_CAP - 10) {
      // There's a chance we should end the conversation here
      const shouldEnd = Math.random() > 0.7; // 30% chance to end if we're in the range
      
      if (shouldEnd) {
        // Handle conversation completion
        const closingMessage: Message = {
          id: messages.length + 2,
          text: "Thanks for sharing all that 🙏 Building your personal dashboard now...",
          sender: "ai",
        };

        setMessages(prev => [...prev, closingMessage]);
        setIsTyping(false);
        setIsGeneratingProfile(true);

        try {
          generateAIProfile(draftConversation)
            .then(profile => {
              // Profile is now guaranteed to have all fields with default values from the edge function
              setUserProfile(profile);
              setIsGeneratingProfile(false);
              setIsComplete(true);
              
              // Update final conversation state with closing message
              const finalConversation = {
                messages: [...draftConversation.messages, { role: "assistant" as ChatRole, content: closingMessage.text }],
                userAnswers: draftConversation.userAnswers
              };
              setConversation(finalConversation);
              
              // Save conversation to Supabase using the extracted function
              saveOnboardingData(profile, finalConversation, promptMode, user, clearNewUserFlag);
            })
            .catch(error => {
              console.error("Error in profile generation:", error);
              // Handle error with fallback
              setIsGeneratingProfile(false);
              toast({
                title: "Error generating profile",
                description: "We encountered an issue creating your profile. Let's continue our conversation.",
                variant: "destructive",
              });
              // Continue conversation instead
              getAIResponse(conversation, textToSend)
                .then(handleContinue)
                .catch(error => {
                  console.error("Failed to get AI response after profile error:", error);
                  setIsTyping(false);
                });
            });
        } catch (error) {
          console.error("Error in profile generation:", error);
          setIsGeneratingProfile(false);
          getAIResponse(conversation, textToSend)
            .then(handleContinue)
            .catch(error => {
              console.error("Failed to get AI response:", error);
              setIsTyping(false);
            });
        }
      } else {
        // Continue normal conversation
        getAIResponse(conversation, textToSend)
          .then(handleContinue)
          .catch(error => {
            console.error("Failed to get AI response:", error);
            setIsTyping(false);
            handleContinue("I'm having a moment. Could you share that thought again?");
          });
      }
    } else {
      // Standard conversation flow
      getAIResponse(conversation, textToSend)
        .then(handleContinue)
        .catch(error => {
          console.error("Failed to get AI response:", error);
          setIsTyping(false);
          handleContinue("Sorry for the hiccup. Please continue - I'm listening.");
        });
    }
  };

  // Get progress percent based on conversation length
  const getProgress = (): number => {
    // Start at 10%, increase based on number of messages
    // Cap at 90% until final profile generation
    if (isComplete) return 100;
    if (isGeneratingProfile) return 95;
    
    const baseProgress = 10;
    // We count only user messages
    const userMessageCount = conversation.userAnswers.length;
    
    // Progress increases with each message, but at a decreasing rate
    // This creates the feeling of progress without giving exact timing
    const progressPerMessage = Math.max(5, 70 / Math.max(1, userMessageCount + 5));
    
    // Calculate progress but cap it at 90%
    const calculatedProgress = Math.min(90, baseProgress + (userMessageCount * progressPerMessage));
    
    return calculatedProgress;
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
    isInitializing,
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
    showPromptSelection,
    setShowPromptSelection,
    promptMode,
    setPromptMode,
    handlePromptModeChange,
    phoneNumber,
    setPhoneNumber,
    isSmsVerified,
    getProgress,
    handleModeSelection,
    getNameInitial,
    handleSend,
    startSmsConversation,
    userName
  };
};
