
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
import { storeOnboardingDataSecurely } from '@/utils/onboardingStorage';
import { useNavigate } from 'react-router-dom';
import { 
  SYSTEM_PROMPT_STRUCTURED,
  SYSTEM_PROMPT_PLAYFUL,
  SYSTEM_PROMPT_YOUNG_ADULT
} from '@/utils/aiUtils';

// Maximum number of user messages before asking for name and completing
const MESSAGE_CAP = 6;

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
    handleScroll,
    handleUserMessage,
    handleAIMessagePart,
    scrollToBottomInstant
  } = useChatScroll();

  // ENHANCED: Store prompt mode AND conversation data in localStorage immediately when they change
  useEffect(() => {
    console.log('🔄 useOnboardingChat: Prompt mode changed to:', promptMode);
    
    // Store prompt mode in localStorage immediately for both manual sign-up and OAuth flows
    localStorage.setItem('onboarding_prompt_mode', promptMode);
    localStorage.setItem('onboardingPromptMode', promptMode); // Legacy key for compatibility
    localStorage.setItem('prompt_mode', promptMode); // Additional fallback key
    
    console.log('💾 useOnboardingChat: Stored prompt mode in localStorage:', promptMode);
  }, [promptMode]);

  // ENHANCED: Store conversation data in localStorage whenever it changes for OAuth preservation
  useEffect(() => {
    if (conversation && (conversation.messages.length > 0 || conversation.userAnswers.length > 0)) {
      console.log('🔄 useOnboardingChat: Conversation changed, storing in localStorage for OAuth preservation');
      
      // Store conversation data with validation
      const conversationToStore = {
        messages: conversation.messages || [],
        userAnswers: conversation.userAnswers || []
      };
      
      localStorage.setItem('onboardingConversation', JSON.stringify(conversationToStore));
      localStorage.setItem('onboarding_conversation', JSON.stringify(conversationToStore)); // Additional key
      
      console.log('💾 useOnboardingChat: Stored conversation data:', {
        messageCount: conversationToStore.messages.length,
        userAnswerCount: conversationToStore.userAnswers.length
      });
    }
  }, [conversation]);

  // ENHANCED: Store profile data whenever it changes for OAuth preservation
  useEffect(() => {
    if (userProfile && Object.keys(userProfile).some(key => userProfile[key as keyof UserProfile])) {
      console.log('🔄 useOnboardingChat: Profile changed, storing in localStorage for OAuth preservation');
      localStorage.setItem('onboardingProfile', JSON.stringify(userProfile));
      localStorage.setItem('onboarding_profile', JSON.stringify(userProfile)); // Additional key
      
      console.log('💾 useOnboardingChat: Stored profile data with keys:', Object.keys(userProfile));
    }
  }, [userProfile]);

  // ENHANCED: Store userName whenever it changes for OAuth preservation with improved timing
  useEffect(() => {
    if (userName && userName.trim()) {
      console.log('🔄 useOnboardingChat: UserName changed, storing in localStorage for OAuth preservation');
      localStorage.setItem('onboardingUserName', userName);
      localStorage.setItem('onboarding_user_name', userName); // Additional key
      
      // ALSO update the profile immediately to ensure consistency
      setUserProfile(prev => ({ ...prev, name: userName }));
      
      console.log('💾 useOnboardingChat: Stored userName and updated profile:', userName);
    }
  }, [userName]);

  // RESTORED: Auto-hide guidance info after first user message is sent
  useEffect(() => {
    if (messages.length > 1) {
      const hasUserMessages = messages.some(msg => msg.sender === "user");
      if (hasUserMessages && showGuidanceInfo) {
        console.log('🔄 useOnboardingChat: Auto-hiding guidance info after first user message');
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
      
      setTimeout(() => {
        scrollToBottomInstant();
      }, 100);
    });
  }, [promptMode, userName, showNameCollection, isComplete, isGeneratingProfile, scrollToBottomInstant]);

  // Complete onboarding and generate profile
  const completeOnboarding = async (finalConversation: Conversation) => {
    try {
      console.log("🔄 useOnboardingChat: Completing onboarding with userName:", userName);
      console.log("📊 useOnboardingChat: Final conversation:", finalConversation);
      
      // ENHANCED: Ensure userName is properly set in profile before generation
      let finalUserName = userName;
      if (!finalUserName && userProfile.name) {
        finalUserName = userProfile.name;
        setUserName(userProfile.name);
      }
      
      // Update profile with final userName
      const updatedProfile = { ...userProfile, name: finalUserName };
      setUserProfile(updatedProfile);
      
      const profile = await generateProfile(finalConversation, finalUserName);
      console.log("✅ useOnboardingChat: Generated profile:", profile);
      
      // ENHANCED: Ensure name consistency across all data
      if (finalUserName) {
        profile.name = finalUserName;
      } else if (profile.name && !finalUserName) {
        finalUserName = profile.name;
        setUserName(profile.name);
      }
      
      if (!profile.name && finalUserName) {
        profile.name = finalUserName;
      }
      
      console.log("📊 useOnboardingChat: Final profile with consistent name:", profile);
      
      setUserProfile(profile);
      setIsComplete(true);
      
      // Use v1-playful mode and skip storage utility for authenticated users
      const promptModeToUse = 'v1-playful';
      
      // Skip storage utility for authenticated users in signup-first flow
      if (!user) {
        console.log("💾 useOnboardingChat: Storing comprehensive onboarding data using shared utility");
        
        try {
          const storageResult = await storeOnboardingDataSecurely(profile, finalConversation, promptModeToUse);
          
          if (storageResult.success) {
            console.log("✅ useOnboardingChat: Data stored successfully with session ID:", storageResult.sessionId);
          } else {
            console.error("❌ useOnboardingChat: Storage failed:", storageResult.error);
          }
        } catch (storageError) {
          console.error("❌ useOnboardingChat: Storage failed:", storageError);
        }
      } else {
        console.log("✅ useOnboardingChat: User authenticated, skipping storage utility for signup-first flow");
      }
      
      await saveOnboardingData(profile, finalConversation, promptModeToUse, user, clearNewUserFlag);
      
      if (user) {
        navigate("/mirror");
      } else {
        navigate("/onboarding-results", { 
          state: { 
            userProfile: profile, 
            userName: finalUserName || profile.name,
            conversation: finalConversation 
          } 
        });
      }
      
      return true;
    } catch (error) {
      console.error("❌ useOnboardingChat: Error in profile generation:", error);
      return false;
    }
  };

  const handleSend = (message?: string) => {
    const textToSend = message || input;
    if (!textToSend.trim()) return;

    const userMessageCount = conversation.userAnswers.length;
    
    // Check if we've reached the message cap and need to ask for name
    if (userMessageCount >= MESSAGE_CAP - 1 && !askingForName) {
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
      
      const nameRequestMessage: Message = {
        id: messages.length + 2,
        text: "Ok I think I have enough to create your initial mirror. || Last question, what's your name?",
        sender: "ai",
      };

      setTimeout(() => {
        setMessages(prev => [...prev, nameRequestMessage]);
        setIsTyping(false);
      }, 1000);
      
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
      handleUserMessage(() => {
        const nameMessage: Message = {
          id: messages.length + 1,
          text: textToSend,
          sender: "user",
        };

        setMessages((prev) => [...prev, nameMessage]);
        setInput("");
      });
      
      console.log("ENHANCED: Setting userName from final response:", textToSend);
      
      // ENHANCED: Set userName immediately and update profile synchronously
      setUserName(textToSend);
      setUserProfile(prev => ({ ...prev, name: textToSend }));
      
      // ENHANCED: Also store immediately in localStorage for consistency
      localStorage.setItem('onboardingUserName', textToSend);
      localStorage.setItem('onboarding_user_name', textToSend);
      
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
      
      console.log("ENHANCED: Final conversation before completion with userName:", textToSend, finalConversation);
      setConversation(finalConversation);
      
      completeOnboarding(finalConversation);
      return;
    }

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
    handleAIMessagePart
  };
};
