
import { useState, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Message, Conversation, UserProfile, ChatRole } from '@/types/chat';
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

// Maximum number of messages before automatically completing the onboarding
const MESSAGE_CAP = 28;

export const useOnboardingChat = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [conversation, setConversation] = useState<Conversation>({
    messages: [{ role: "system" as ChatRole, content: SYSTEM_PROMPT }],
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
  const [conversationMode, setConversationMode] = useState<"text" | "voice" | "sms">("text");
  const [showModeSelection, setShowModeSelection] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSmsVerified, setIsSmsVerified] = useState(false);

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

    // Update basic profile info for first two questions
    if (currentQuestionIndex === 0) {
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

    const userMessageCount = draftConversation.userAnswers.length;
    const shouldRunCheck = userMessageCount >= 8;
    const isCompletionTurn = userMessageCount % 3 === 0;

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

    // Evaluate conversation completeness if enough messages exchanged
    if (shouldRunCheck) {
      checkConversationCoverage(draftConversation)
        .then(async (result) => {
          // Added null safety check with optional chaining
          if (result?.enoughToStop && isCompletionTurn) {
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
              const profile = await generateAIProfile(draftConversation);
              
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
              getAIResponse(conversation, textToSend)
                .then(handleContinue)
                .catch(error => {
                  console.error("Failed to get AI response after profile error:", error);
                  setIsTyping(false);
                });
            }
          } else {
            // Continue normal conversation with guidance based on missing fields
            const missingCategories = result ? Object.entries(result)
              .filter(([key, val]) =>
                ["overview", "lifeStory", "interestsIdentity", "vibePersonality", "innerWorld", "connectionNeeds"].includes(key) &&
                val === "Missing"
              )
              .map(([key]) => key) : [];

            let assistantGuidance = "";
            if (missingCategories.length > 0) {
              assistantGuidance = `After responding to the user's last message, if the topic feels complete or winds down, gently pivot the conversation toward these areas: ${missingCategories.join(", ")}. Be subtle and natural — don't make it obvious.`;
            }

            const updatedMessages: { role: ChatRole; content: string; }[] = [
              ...draftConversation.messages,
              ...(assistantGuidance
                ? [{ role: "system" as ChatRole, content: assistantGuidance }]
                : [])
            ];

            getAIResponse(conversation, textToSend, updatedMessages)
              .then(handleContinue)
              .catch(error => {
                console.error("Failed to get AI response:", error);
                setIsTyping(false);
                handleContinue("I'm having a moment. Could you share that thought again?");
              });
          }
        }).catch(error => {
          console.error("Error checking conversation coverage:", error);
          // Fallback to continuing the conversation
          getAIResponse(conversation, textToSend)
            .then(handleContinue)
            .catch(error => {
              console.error("Failed to get AI response after coverage check error:", error);
              setIsTyping(false);
              handleContinue("I seem to be having connection issues. Let's keep going though - what else would you like to share?");
            });
        });
    } else {
      getAIResponse(conversation, textToSend)
        .then(handleContinue)
        .catch(error => {
          console.error("Failed to get AI response:", error);
          setIsTyping(false);
          handleContinue("Sorry for the hiccup. Please continue - I'm listening.");
        });
    }
  };

  // New function to save onboarding data to Supabase
  const saveOnboardingData = async (profile: UserProfile, convoData: Conversation) => {
    try {
      // Get a unique ID for anonymous users
      const anonymousId = localStorage.getItem('anonymous_twyne_id') || crypto.randomUUID();
      
      // If this is a new anonymous user, save the ID
      if (!localStorage.getItem('anonymous_twyne_id')) {
        localStorage.setItem('anonymous_twyne_id', anonymousId);
      }
      
      // If user is logged in, save with user ID, otherwise use anonymous ID
      const userId = user?.id || anonymousId;
      
      // Insert onboarding data into Supabase
      const { error } = await supabase
        .from('onboarding_data')
        .insert({
          user_id: userId,
          is_anonymous: !user,
          profile_data: profile,
          conversation_data: convoData,
        });
      
      if (error) {
        console.error("Error saving onboarding data:", error);
        toast({
          title: "Error",
          description: "Failed to save your onboarding data, but your profile has been created.",
          variant: "destructive",
        });
      } else {
        console.log("Onboarding data saved successfully");
        
        // If user is logged in, update their metadata
        if (user) {
          markUserAsOnboarded(profile);
        }
      }
    } catch (error) {
      console.error("Error in saveOnboardingData:", error);
    }
  };

  // New function to handle SMS conversation
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
      
      // Here you would typically store the phone number and SMS conversation state
      // For the demo, we'll just set the phone number in the state
      setPhoneNumber(phoneNumber);
      
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
    phoneNumber,
    setPhoneNumber,
    isSmsVerified,
    getProgress,
    handleModeSelection,
    getNameInitial,
    handleSend,
    startSmsConversation
  };
};
