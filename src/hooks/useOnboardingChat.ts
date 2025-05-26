import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Message, Conversation, UserProfile, ChatRole } from '@/types/chat';
import { PromptModeType, usePromptMode } from './usePromptMode';
import { ConversationModeType, useConversationMode } from './useConversationMode';
import { useSmsConversation } from './useSmsConversation';
import { useSupabaseSync } from './useSupabaseSync';
import { useOnboardingAI } from './useOnboardingAI';
import { useOnboardingMessages } from './useOnboardingMessages';
import { useChatScroll } from './useChatScroll';
import { useNavigate } from 'react-router-dom';
import { 
  SYSTEM_PROMPT_STRUCTURED,
  SYSTEM_PROMPT_PLAYFUL,
  SYSTEM_PROMPT_YOUNG_ADULT
} from '@/utils/aiUtils';

// Maximum number of user messages before asking for name and completing
const MESSAGE_CAP = 15;

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
  const [showGuidanceInfo, setShowGuidanceInfo] = useState(true);
  const [showNameCollection, setShowNameCollection] = useState(true);
  const [askingForName, setAskingForName] = useState(false);
  
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
  
  // Use the new chat scroll system
  const {
    scrollContainerRef,
    isUserNearBottom,
    hasUserScrolled,
    isScrolling,
    handleScroll,
    handleUserMessage,
    handleAIMessagePart,
    scrollToBottomInstant
  } = useChatScroll();

  // Hide guidance info after user sends first message
  useEffect(() => {
    if (messages.length > 1) {
      const hasUserMessages = messages.some(msg => msg.sender === "user");
      if (hasUserMessages && showGuidanceInfo) {
        setShowGuidanceInfo(false);
      }
    }
  }, [messages, showGuidanceInfo]);

  // Handle name submission from the name collection step
  const handleNameSubmit = (name: string) => {
    console.log("Name submitted:", name);
    setUserName(name);
    setUserProfile(prev => ({ ...prev, name }));
    setShowNameCollection(false);
  };

  // Reset conversation when prompt mode changes and initialize with AI greeting
  useEffect(() => {
    if (isComplete || isGeneratingProfile) {
      // If no userName is set or still collecting name, don't initialize the chat yet
      return;
    }

    setIsInitializing(true);

    let systemPrompt = SYSTEM_PROMPT_STRUCTURED;
    
    if (promptMode === "playful") {
      systemPrompt = SYSTEM_PROMPT_PLAYFUL;
    } else if (promptMode === "young-adult") {
      systemPrompt = SYSTEM_PROMPT_YOUNG_ADULT;
    }

    const initialMessage: { role: ChatRole; content: string } = {
      role: "system" as ChatRole,
      content: systemPrompt
    };
    
    setMessages([]);
    setConversation({
      messages: [initialMessage],
      userAnswers: []
    });

    setCurrentQuestionIndex(0);

    const effectiveName = userName || "friend";
    initializeChat(systemPrompt, effectiveName, promptMode).then(({ aiGreeting, updatedConversation }) => {
      setIsInitializing(false);
      setMessages([{ id: 1, text: aiGreeting, sender: "ai" }]);
      setConversation(updatedConversation);
    });
  }, [promptMode, userName, showNameCollection, isComplete, isGeneratingProfile]);

  // Complete onboarding and generate profile
  const completeOnboarding = async (finalConversation: Conversation) => {
    try {
      console.log("Completing onboarding with userName:", userName);
      console.log("Final conversation:", finalConversation);
      
      setUserProfile(prev => ({ ...prev, name: userName }));
      
      const profile = await generateProfile(finalConversation, userName);
      console.log("Generated profile:", profile);
      
      if (userName) {
        profile.name = userName;
      } else if (profile.name && !userName) {
        setUserName(profile.name);
      }
      
      if (!profile.name && userName) {
        profile.name = userName;
      }
      
      console.log("Final profile with name:", profile);
      
      setUserProfile(profile);
      setIsComplete(true);
      
      localStorage.setItem('onboardingProfile', JSON.stringify(profile));
      localStorage.setItem('onboardingUserName', userName || profile.name || '');
      localStorage.setItem('onboardingConversation', JSON.stringify(finalConversation));
      
      await saveOnboardingData(profile, finalConversation, promptMode, user, clearNewUserFlag);
      
      if (user) {
        navigate("/mirror");
      } else {
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

    const userMessageCount = conversation.userAnswers.length;
    
    // Check if we've reached the message cap and need to ask for name
    if (userMessageCount >= MESSAGE_CAP - 1 && !askingForName) {
      // Use handleUserMessage for seamless scrolling
      handleUserMessage(() => {
        const newUserMessage: Message = {
          id: messages.length + 1,
          text: textToSend,
          sender: "user",
        };

        setMessages((prev) => [...prev, newUserMessage]);
        setInput("");
      });
      
      const nameRequestMessage: Message = {
        id: messages.length + 2,
        text: "Ok I think I have enough to create your initial mirror. || Last question, what's your name?",
        sender: "ai",
      };

      setMessages(prev => [...prev, nameRequestMessage]);
      setIsTyping(false);
      setAskingForName(true);

      const userMessageObj: { role: ChatRole; content: string } = { 
        role: "user" as ChatRole, 
        content: textToSend 
      };
      
      const assistantMessageObj: { role: ChatRole; content: string } = { 
        role: "assistant" as ChatRole, 
        content: nameRequestMessage.text 
      };

      const updatedConversation = {
        messages: [
          ...conversation.messages, 
          userMessageObj,
          assistantMessageObj
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };
      
      setConversation(updatedConversation);
      return;
    }

    // If we're asking for name, this is the final message
    if (askingForName) {
      // Use handleUserMessage for seamless scrolling
      handleUserMessage(() => {
        const nameMessage: Message = {
          id: messages.length + 1,
          text: textToSend,
          sender: "user",
        };

        setMessages((prev) => [...prev, nameMessage]);
        setInput("");
      });
      
      console.log("Setting userName from final response:", textToSend);
      setUserName(textToSend);
      setUserProfile(prev => ({ ...prev, name: textToSend }));
      
      setIsTyping(false);

      const userNameObj: { role: ChatRole; content: string } = { 
        role: "user" as ChatRole, 
        content: textToSend 
      };

      const finalConversation = {
        messages: [
          ...conversation.messages, 
          userNameObj,
        ],
        userAnswers: [...conversation.userAnswers, textToSend]
      };
      
      console.log("Final conversation before completion:", finalConversation);
      setConversation(finalConversation);
      
      completeOnboarding(finalConversation);
      return;
    }

    // Use handleUserMessage for seamless scrolling
    handleUserMessage(() => {
      const newUserMessage: Message = {
        id: messages.length + 1,
        text: textToSend,
        sender: "user",
      };

      setMessages((prev) => [...prev, newUserMessage]);
      setInput("");
      setIsTyping(true);
    });

    // Scroll to show the user message immediately after it's added
    setTimeout(() => {
      scrollToBottomInstant();
    }, 50);

    if (currentQuestionIndex === 0) {
      setUserProfile(prev => ({ ...prev, location: textToSend.trim() }));
    } else if (currentQuestionIndex === 1) {
      setUserProfile(prev => ({ ...prev, interests: [textToSend.trim()] }));
    }

    const newIndex = currentQuestionIndex + 1;
    setCurrentQuestionIndex(newIndex);

    const userMessageObj: { role: ChatRole; content: string } = { 
      role: "user" as ChatRole, 
      content: textToSend 
    };
    
    const draftConversation: Conversation = {
      messages: [...conversation.messages, userMessageObj],
      userAnswers: [...conversation.userAnswers, textToSend]
    };

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

    handleAIResponse(textToSend, draftConversation, conversation, setIsTyping, setConversation);
  };

  // Get progress percent based on conversation length
  const getProgress = (): number => {
    if (isComplete) return 100;
    if (isGeneratingProfile) return 95;
    
    const baseProgress = 10;
    const userMessageCount = conversation.userAnswers.length;
    
    const progressPerMessage = Math.max(5, 70 / Math.max(1, userMessageCount + 5));
    
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
    scrollContainerRef,
    handleScroll,
    handleAIMessagePart,
    isScrolling
  };
};
