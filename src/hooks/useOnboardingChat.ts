import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

// Maximum number of messages before automatically completing the onboarding
const MESSAGE_CAP = 34;

export type PromptModeType = "structured" | "playful" | "young-adult";

export const useOnboardingChat = () => {
  const [promptMode, setPromptMode] = useState<PromptModeType>("playful"); // Default to playful
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
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(true);
  const [showGuidanceInfo, setShowGuidanceInfo] = useState(false);
  const [conversationMode, setConversationMode] = useState<"text" | "voice" | "sms">("text");
  const [showModeSelection, setShowModeSelection] = useState(false);
  const [showPromptSelection, setShowPromptSelection] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSmsVerified, setIsSmsVerified] = useState(false);
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

  const handlePromptModeChange = (mode: PromptModeType) => {
    // Only change the prompt mode if we're at the beginning of the conversation
    if (currentQuestionIndex === 0) {
      setPromptMode(mode);
      toast({
        title: "Conversation style changed",
        description: `You've switched to ${mode === "structured" ? "Guided Conversation" : mode === "playful" ? "Playful Chat" : "Chill Talk"} mode.`,
        duration: 3000,
      });
    } else {
      // If conversation already started, show warning
      toast({
        title: "Cannot change conversation style",
        description: "You can only change the conversation style at the beginning of the chat.",
        variant: "destructive",
      });
    }
  };

  const handleSend = (message?: string) => {
    const textToSend = message || input;
    if (!textToSend.trim()) return;

    // Check if we've reached the message cap
    if (messages.length >= MESSAGE_CAP - 1) { // -1 to account for the new user message we're about to add
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
          saveOnboardingData(profile, finalConversation);
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
      handleSmsResponse(textToSend, draftConversation);
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
    const userMessageCount = draftConversation.userAnswers.length;
    
    // If we've had a substantial conversation and it's time to wrap up
    if (userMessageCount >= 15 && userMessageCount % 5 === 0 && userMessageCount >= MESSAGE_CAP - 10) {
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
              
              // Save conversation to Supabase
              saveOnboardingData(profile, finalConversation);
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
    // We subtract 2 to account for the initial AI messages
    const userMessageCount = messages.filter(msg => msg.sender === "user").length;
    
    // Progress increases with each message, but at a decreasing rate
    // This creates the feeling of progress without giving exact timing
    const progressPerMessage = Math.max(5, 70 / Math.max(1, userMessageCount + 5));
    
    // Calculate progress but cap it at 90%
    const calculatedProgress = Math.min(90, baseProgress + (userMessageCount * progressPerMessage));
    
    return calculatedProgress;
  };

  // Function to handle conversation mode selection (text, voice, or sms)
  const handleModeSelection = (mode: "text" | "voice" | "sms", phoneNumberInput?: string) => {
    setConversationMode(mode);
    
    if (mode === "sms" && phoneNumberInput) {
      setPhoneNumber(phoneNumberInput);
      
      // In a real implementation, we would verify the phone number here
      // and send an initial message to start the conversation
      toast({
        title: "SMS conversation started",
        description: `We've sent an initial message to ${phoneNumberInput}. Reply to continue the conversation.`,
      });
    }
    
    setShowModeSelection(false);
  };

  // Function to get the first letter of the user's name for avatar
  const getNameInitial = () => {
    return userProfile.name ? userProfile.name.charAt(0).toUpperCase() : "?";
  };

  // New function to handle SMS verification
  const startSmsConversation = async (phoneNumberInput: string) => {
    try {
      setIsTyping(true);
      
      // In a real implementation, this would:
      // 1. Validate the phone number format
      // 2. Send a verification code via SMS
      // 3. Wait for the user to enter the code
      // 4. Start the conversation
      
      // For now, we'll simulate success
      setPhoneNumber(phoneNumberInput);
      setIsSmsVerified(true);
      setConversationMode("sms");
      setShowModeSelection(false);
      setIsTyping(false);
      
      toast({
        title: "SMS conversation started",
        description: "You can now continue the conversation via SMS. Replies will appear here as well.",
      });
    } catch (error) {
      console.error("Error starting SMS conversation:", error);
      setIsTyping(false);
      
      toast({
        title: "Error",
        description: "Failed to start SMS conversation. Please try again or choose a different option.",
        variant: "destructive",
      });
    }
  };

  // Handling SMS response (simplified for this implementation)
  const handleSmsResponse = async (userMessage: string, draftConversation: Conversation) => {
    try {
      // In a real implementation, this would call the SMS edge function
      console.log(`Would send SMS to ${phoneNumber} with message: ${userMessage}`);
      
      // For the demo, we'll simulate the SMS flow with the regular AI response
      const aiResponse = await getAIResponse(conversation, userMessage);
      
      // Log the simulated SMS response
      console.log(`Would receive SMS response: ${aiResponse}`);
      
      // Update UI as if we got the response via SMS
      const newAiMessage: Message = {
        id: messages.length + 2,
        text: aiResponse,
        sender: "ai",
      };

      const updatedConversation: Conversation = {
        messages: [
          ...conversation.messages,
          { role: "user" as ChatRole, content: userMessage },
          { role: "assistant" as ChatRole, content: aiResponse }
        ],
        userAnswers: [...conversation.userAnswers, userMessage]
      };

      setMessages(prev => [...prev, newAiMessage]);
      setConversation(updatedConversation);
      setIsTyping(false);
      
    } catch (error) {
      console.error("Error in SMS conversation:", error);
      setIsTyping(false);
      
      // Show error toast
      toast({
        title: "SMS service error",
        description: "We encountered an issue with the SMS service. Please try again or choose a different conversation mode.",
        variant: "destructive",
      });
    }
  };

  // Save onboarding data
  const saveOnboardingData = async (profile: UserProfile, convoData: Conversation) => {
    try {
      console.log("Starting saveOnboardingData function");
      console.log("User auth state:", user ? "Logged in" : "Anonymous");
      
      // Get a unique ID for anonymous users
      const anonymousId = localStorage.getItem('anonymous_twyne_id') || crypto.randomUUID();
      
      // If this is a new anonymous user, save the ID
      if (!localStorage.getItem('anonymous_twyne_id')) {
        localStorage.setItem('anonymous_twyne_id', anonymousId);
      }
      
      // If user is logged in, save with user ID, otherwise use anonymous ID
      const userId = user?.id || anonymousId;
      console.log("Using ID for save:", userId);
      console.log("Is anonymous:", !user);
      
      // Extract name - use the first user message or "N/A"
      const extractedName = userName || "N/A";
      console.log("Extracted name for saving:", extractedName);
      
      // Debug profile and conversation data
      console.log("Profile data to save:", profile);
      console.log("Conversation data length:", convoData.messages.length);
      
      try {
        // First attempt - Using direct REST API approach to avoid type issues
        console.log("Attempting to save data with REST API to onboarding_test_data table");
        const response = await fetch(`https://lzwkccarbwokfxrzffjd.supabase.co/rest/v1/onboarding_test_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE`,
            'apikey': `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            user_id: userId,
            is_anonymous: !user,
            profile_data: profile,
            conversation_data: convoData,
            prompt_mode: promptMode,
            name: extractedName
          })
        });
        
        console.log("REST API response status:", response.status);
        
        if (!response.ok) {
          const errorData = await response.text();
          console.error("Error saving with REST API:", errorData);
          
          // Create a custom error message without trying another Supabase client approach
          throw new Error(`Failed to save data: ${errorData}`);
        } else {
          console.log("Data saved successfully with REST API");
        }
        
        // If user is logged in, update their metadata
        if (user) {
          markUserAsOnboarded(profile);
        }
        
        // Show success message to user
        toast({
          title: "Profile Saved",
          description: "Your profile has been saved successfully!",
        });
      } catch (innerError) {
        console.error("Error in save operation:", innerError);
        
        // Show error toast for save operation failure
        toast({
          title: "Error",
          description: "Failed to save your profile data. Please try again or contact support.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
      
      // Show generic error message for uncaught exceptions
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving your data.",
        variant: "destructive",
      });
    }
  };

  const markUserAsOnboarded = async (profile: UserProfile) => {
    if (user) {
      try {
        console.log("Attempting to mark user as onboarded");
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
