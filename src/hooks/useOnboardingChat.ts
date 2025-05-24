import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Message, Conversation, UserProfile, ChatRole } from '@/types/chat';
import { PromptModeType, usePromptMode } from './usePromptMode';
import { ConversationModeType, useConversationMode } from './useConversationMode';
import { useSmsConversation } from './useSmsConversation';
import { useSupabaseSync } from './useSupabaseSync';
import { useOnboardingAI } from './useOnboardingAI';
import { useOnboardingMessages } from './useOnboardingMessages';
import { useOnboardingScroll } from './useOnboardingScroll';
import { useNavigate } from 'react-router-dom';
import { 
  SYSTEM_PROMPT_STRUCTURED,
  SYSTEM_PROMPT_PLAYFUL,
  SYSTEM_PROMPT_YOUNG_ADULT
} from '@/utils/aiUtils';

// Maximum number of messages before automatically completing the onboarding
const MESSAGE_CAP = 8; // Count only user messages, not AI messages

export const useOnboardingChat = () => {
  const navigate = useNavigate();
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
  
  const [isComplete, setIsComplete] = useState(false);
  const { user, clearNewUserFlag } = useAuth();
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(true);
  const [showGuidanceInfo, setShowGuidanceInfo] = useState(false);
  const [showNameCollection, setShowNameCollection] = useState(true);
  
  // Initialize userProfile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    // 🪞 Overview
    "vibeSummary": "",
    "oneLiner": "",
    "twyneTags": [],

    // 📌 Key Facts / Background
    "name": "",
    "age": "",
    "location": "",
    "job": "",
    "school": "",
    "ethnicity": "",
    "religion": "",
    "hometown": "",

    // 🌱 Interests & Lifestyle
    "lifestyle": "",
    "favoriteProducts": "",
    "style": "",
    "interestsAndPassions": "",
    "favoriteMoviesAndShows": "",
    "favoriteMusic": "",
    "favoriteBooks": "",
    "favoritePodcastsOrYouTube": "",
    "talkingPoints": [],
    "favoriteActivities": "",
    "favoriteSpots": "",

    // 🧘 Inner World
    "coreValues": "",
    "lifePhilosophy": "",
    "goals": "",
    "personalitySummary": "",
    "bigFiveTraits": {
      "openness": "",
      "conscientiousness": "",
      "extraversion": "",
      "agreeableness": "",
      "neuroticism": ""
    },
    "quirks": "",
    "communicationStyle": "",

    // 📖 Story
    "upbringing": "",
    "majorTurningPoints": "",
    "recentLifeContext": "",

    // 🤝 Connection
    "socialStyle": "",
    "loveLanguageOrFriendStyle": "",
    "socialNeeds": "",
    "connectionPreferences": "",
    "dealBreakers": "",
    "boundariesAndPetPeeves": "",
    "connectionActivities": ""
  });
  
  // Import all the refactored hooks
  const { 
    conversation, 
    setConversation, 
    isTyping, 
    setIsTyping, 
    isInitializing,
    setIsInitializing,
    isGeneratingProfile, 
    initializeChat,
    generateProfile
  } = useOnboardingAI();
  
  // Expose userName and setUserName from the messages hook
  const {
    messages,
    setMessages,
    input,
    setInput,
    handleAIResponse,
    userName,
    setUserName,
    currentQuestionIndex,
    setCurrentQuestionIndex
  } = useOnboardingMessages(
    (name: string) => setUserProfile(prev => ({ ...prev, name })),
    MESSAGE_CAP
  );
  
  const {
    messagesEndRef,
    scrollViewportRef,
    dashboardRef,
    userHasScrolledUp,
    setUserHasScrolledUp,
    scrollToBottom,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible
  } = useOnboardingScroll(isComplete);

  // Handle name submission from the name collection step
  const handleNameSubmit = (name: string) => {
    setUserName(name);
    setUserProfile(prev => ({ ...prev, name }));
    setShowNameCollection(false);
  };

  // Reset conversation when prompt mode changes and initialize with AI greeting
  useEffect(() => {
    if (!userName || showNameCollection) {
      // If no userName is set or still collecting name, don't initialize the chat yet
      return;
    }

    let systemPrompt = SYSTEM_PROMPT_STRUCTURED;
    
    if (promptMode === "playful") {
      systemPrompt = SYSTEM_PROMPT_PLAYFUL;
    } else if (promptMode === "young-adult") {
      systemPrompt = SYSTEM_PROMPT_YOUNG_ADULT;
    }
    
    // Reset messages and conversation
    setMessages([]);
    
    // Fix: Create a properly typed message object
    const initialMessage: { role: ChatRole; content: string } = {
      role: "system" as ChatRole,
      content: systemPrompt
    };

    // Add assistant guidance with user's name
    const assistantGuidance = `The user's name is ${userName}. Make sure to use their name occasionally in your responses to personalize the conversation.`;
    
    // Use the properly typed message object
    setConversation({
      messages: [
        initialMessage,
        { role: "assistant" as ChatRole, content: assistantGuidance }
      ],
      userAnswers: []
    });
    
    setCurrentQuestionIndex(0);
    
    // Initialize chat with AI greeting, passing the promptMode
    initializeChat(systemPrompt, userName, promptMode).then(({ aiGreeting, updatedConversation }) => {
      // Add AI greeting to messages
      const greetingMessage: Message = {
        id: 1,
        text: aiGreeting,
        sender: "ai"
      };
      
      setMessages([greetingMessage]);
      setConversation(updatedConversation);
    });
  }, [promptMode, userName, showNameCollection]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Complete onboarding and generate profile
  const completeOnboarding = async (finalConversation: Conversation) => {
    try {
      // Update user profile with name before generating profile
      setUserProfile(prev => ({ ...prev, name: userName }));
      
      const profile = await generateProfile(finalConversation, userName);
      console.log("Generated profile:", profile);
      
      // Update userName in case we have it in the profile
      if (profile.name && !userName) {
        setUserName(profile.name);
      } else if (userName && !profile.name) {
        // Make sure the profile has the name if userName is available
        profile.name = userName;
      }
      
      setUserProfile(profile);
      setIsComplete(true);
      
      // Save profile data to localStorage for persistence across navigation
      localStorage.setItem('onboardingProfile', JSON.stringify(profile));
      localStorage.setItem('onboardingUserName', userName || profile.name || '');
      localStorage.setItem('onboardingConversation', JSON.stringify(finalConversation));
      
      // Save conversation to Supabase with user's name
      await saveOnboardingData(profile, finalConversation, promptMode, user, clearNewUserFlag);
      
      // Updated redirect logic based on authentication status
      if (user) {
        // If user is logged in, go directly to mirror
        navigate("/mirror");
      } else {
        // If not logged in, go to onboarding results page with profile data
        navigate("/onboarding-results", { 
          state: { 
            userProfile: profile, 
            userName: userName || profile.name,
            conversation: finalConversation 
          } 
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error in profile generation:", error);
      return false;
    }
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

      // Update conversation with user's final message - Fix typing here
      const userMessageObj: { role: ChatRole; content: string } = { 
        role: "user" as ChatRole, 
        content: textToSend 
      };
      
      const assistantMessageObj: { role: ChatRole; content: string } = { 
        role: "assistant" as ChatRole, 
        content: closingMessage.text 
      };

      const finalConversation = {
        messages: [
          ...conversation.messages, 
          userMessageObj,
          assistantMessageObj
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };
      
      setConversation(finalConversation);
      
      // Complete the onboarding process
      completeOnboarding(finalConversation);
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
    
    // Reset scroll state when user sends a message
    resetScrollState();

    // Update basic profile info for first user messages
    if (currentQuestionIndex === 0) {
      // Don't update name from first question anymore since we're collecting it separately
      setUserProfile(prev => ({ ...prev, location: textToSend.trim() }));
    } else if (currentQuestionIndex === 1) {
      setUserProfile(prev => ({ ...prev, interests: [textToSend.trim()] }));
    }

    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);

    // Prepare conversation data for API request - Fix typing here
    const userMessageObj: { role: ChatRole; content: string } = { 
      role: "user" as ChatRole, 
      content: textToSend 
    };
    
    const draftConversation: Conversation = {
      messages: [...conversation.messages, userMessageObj],
      userAnswers: [...conversation.userAnswers, textToSend]
    };

    // If in SMS mode, handle sending messages via SMS
    if (conversationMode === "sms") {
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

    // Check if we should complete the conversation based on message count
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

        // Update final conversation state with closing message - Fix typing here
        const assistantMessageObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: closingMessage.text 
        };
        
        const finalConversation = {
          messages: [...draftConversation.messages, assistantMessageObj],
          userAnswers: draftConversation.userAnswers
        };
        
        setConversation(finalConversation);
        
        // Complete the onboarding process
        completeOnboarding(finalConversation);
      } else {
        // Continue normal conversation flow
        handleAIResponse(textToSend, draftConversation, conversation, setIsTyping, setConversation);
      }
    } else {
      // Standard conversation flow
      handleAIResponse(textToSend, draftConversation, conversation, setIsTyping, setConversation);
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
    const progressPerMessage = Math.max(5, 70 / Math.max(1, userMessageCount + 5));
    
    // Calculate progress but cap it at 90%
    const calculatedProgress = Math.min(90, baseProgress + (userMessageCount * progressPerMessage));
    
    return calculatedProgress;
  };

  // Function to get the first letter of the user's name for avatar
  const getNameInitial = () => {
    return userName ? userName.charAt(0).toUpperCase() : "?";
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
    handlePromptModeChange,
    phoneNumber,
    setPhoneNumber,
    isSmsVerified,
    getProgress,
    handleModeSelection,
    getNameInitial,
    handleSend,
    startSmsConversation,
    userName,
    setUserName,
    showNameCollection,
    handleNameSubmit,
    // Scroll-related
    scrollViewportRef,
    dashboardRef,
    handleScroll,
    resetScrollState,
    handleMessagePartVisible
  };
};
