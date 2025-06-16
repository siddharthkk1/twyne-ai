import { useState, useEffect, useRef } from 'react';
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
  SYSTEM_PROMPT_YOUNG_ADULT,
  getAIResponse
} from '@/utils/aiUtils';
import { generateConcludingMessage } from '@/utils/conclusionUtils';

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
  
  // Add ref to track if guidance has been auto-hidden to prevent feedback loop
  const hasAutoHiddenGuidance = useRef(false);
  
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

  // FIXED: Auto-hide guidance info after first user message is sent - prevent feedback loop
  useEffect(() => {
    if (messages.length > 1 && !hasAutoHiddenGuidance.current) {
      const hasUserMessages = messages.some(msg => msg.sender === "user");
      if (hasUserMessages && showGuidanceInfo) {
        console.log('🔄 useOnboardingChat: Auto-hiding guidance info after first user message');
        setShowGuidanceInfo(false);
        hasAutoHiddenGuidance.current = true; // Mark as auto-hidden to prevent re-triggering
      }
    }
  }, [messages]); // Removed showGuidanceInfo from dependency array to prevent feedback loop

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
      console.log("🔄 useOnboardingChat: Starting completion with userName:", userName);
      console.log("📊 useOnboardingChat: Final conversation:", finalConversation);
      
      // ENHANCED: Capture userName with multiple fallbacks and ensure consistency
      let finalUserName = userName;
      if (!finalUserName && userProfile.name) {
        finalUserName = userProfile.name;
        console.log("🔄 useOnboardingChat: Using userName from userProfile:", finalUserName);
      }
      
      // Additional fallback: check localStorage
      if (!finalUserName) {
        const storedUserName = localStorage.getItem('onboardingUserName') || localStorage.getItem('onboarding_user_name');
        if (storedUserName) {
          finalUserName = storedUserName;
          console.log("🔄 useOnboardingChat: Using userName from localStorage:", finalUserName);
        }
      }
      
      // Last resort: check conversation for user answers that might be the name
      if (!finalUserName && finalConversation.userAnswers.length > 0) {
        const lastAnswer = finalConversation.userAnswers[finalConversation.userAnswers.length - 1];
        if (lastAnswer && lastAnswer.trim()) {
          finalUserName = lastAnswer.trim();
          console.log("🔄 useOnboardingChat: Using userName from last conversation answer:", finalUserName);
        }
      }
      
      console.log("✅ useOnboardingChat: Final userName resolved to:", finalUserName);
      
      // Update both userName state and profile with final name
      if (finalUserName) {
        setUserName(finalUserName);
        setUserProfile(prev => ({ ...prev, name: finalUserName }));
        
        // Store in localStorage immediately for navigation fallback
        localStorage.setItem('onboardingUserName', finalUserName);
        localStorage.setItem('onboarding_user_name', finalUserName);
      }
      
      const profile = await generateProfile(finalConversation, finalUserName);
      console.log("✅ useOnboardingChat: Generated profile:", profile);
      
      // ENHANCED: Ensure name consistency across all data structures
      if (finalUserName && !profile.name) {
        profile.name = finalUserName;
      } else if (profile.name && !finalUserName) {
        finalUserName = profile.name;
        setUserName(profile.name);
      }
      
      console.log("📊 useOnboardingChat: Final profile with consistent name:", { 
        profileName: profile.name, 
        finalUserName, 
        userNameState: userName 
      });
      
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
        // ENHANCED: Pass both profile and userName explicitly in navigation state
        console.log("🚀 useOnboardingChat: Navigating to results with state:", {
          userProfile: profile,
          userName: finalUserName,
          conversationData: finalConversation
        });
        
        navigate("/onboarding-results", { 
          state: { 
            userProfile: profile, 
            userName: finalUserName,
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

  const handleSend = async (message?: string) => {
    // ENHANCED: Add input validation and logging for debugging
    console.log('🔄 handleSend called with:', { message, input, inputType: typeof input });
    
    // Ensure input is always a string
    const sanitizedInput = typeof input === 'string' ? input : String(input || '');
    const textToSend = message || sanitizedInput;
    
    console.log('🔄 Final textToSend:', { textToSend, textType: typeof textToSend });
    
    if (!textToSend || typeof textToSend !== 'string' || !textToSend.trim()) {
      console.warn('⚠️ handleSend: Invalid or empty text, aborting');
      return;
    }

    const userMessageCount = conversation.userAnswers.length;
    
    // IMPROVED: Check if we've reached the message cap and need to transition naturally to name collection
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
      
      // Add user message to conversation for AI response
      const userMessageObj: { role: ChatRole; content: string } = { 
        role: "user" as ChatRole, 
        content: textToSend 
      };
      
      const conversationForConclusion: Conversation = {
        messages: [...conversation.messages, userMessageObj],
        userAnswers: [...conversation.userAnswers, textToSend]
      };

      try {
        // ENHANCED: Generate personalized concluding message using OpenAI
        console.log('🤖 Generating personalized concluding message...');
        const concludingMessage = await generateConcludingMessage(conversationForConclusion);
        
        // Create the concluding message
        const concludingAIMessage: Message = {
          id: messages.length + 2,
          text: concludingMessage,
          sender: "ai",
        };

        const mirrorMessage: Message = {
          id: messages.length + 3,
          text: "i think i have enough to create your initial mirror.",
          sender: "ai",
        };

        const nameRequestMessage: Message = {
          id: messages.length + 4,
          text: "last question, what's your name?",
          sender: "ai",
        };

        // Send the messages with proper timing
        setTimeout(() => {
          setMessages(prev => [...prev, concludingAIMessage]);
          setIsTyping(false);
          
          // After a delay, send the mirror message
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setMessages(prev => [...prev, mirrorMessage]);
              setIsTyping(false);
              
              // After another delay, send the name request
              setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                  setMessages(prev => [...prev, nameRequestMessage]);
                  setIsTyping(false);
                }, 1000);
              }, 1500);
            }, 1000);
          }, 1500);
        }, 1000);
        
        setAskingForName(true);

        const concludingResponseObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: concludingMessage 
        };
        
        const mirrorResponseObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: mirrorMessage.text 
        };
        
        const nameRequestResponseObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: nameRequestMessage.text 
        };

        const updatedConversation = {
          messages: [
            ...conversationForConclusion.messages,
            concludingResponseObj,
            mirrorResponseObj,
            nameRequestResponseObj
          ],
          userAnswers: [...conversation.userAnswers, textToSend]
        };
        
        setConversation(updatedConversation);
      } catch (error) {
        console.error("Error generating concluding message:", error);
        
        // Fallback to the previous behavior if the conclusion generation fails
        const fallbackConcludingMessage: Message = {
          id: messages.length + 2,
          text: "thanks for sharing all of that with me.",
          sender: "ai",
        };

        const mirrorMessage: Message = {
          id: messages.length + 3,
          text: "i think i have enough to create your initial mirror.",
          sender: "ai",
        };

        const nameRequestMessage: Message = {
          id: messages.length + 4,
          text: "last question, what's your name?",
          sender: "ai",
        };

        setTimeout(() => {
          setMessages(prev => [...prev, fallbackConcludingMessage]);
          setIsTyping(false);
          
          setTimeout(() => {
            setIsTyping(true);
            setTimeout(() => {
              setMessages(prev => [...prev, mirrorMessage]);
              setIsTyping(false);
              
              setTimeout(() => {
                setIsTyping(true);
                setTimeout(() => {
                  setMessages(prev => [...prev, nameRequestMessage]);
                  setIsTyping(false);
                }, 1000);
              }, 1500);
            }, 1000);
          }, 1500);
        }, 1000);
        
        setAskingForName(true);

        const fallbackResponseObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: fallbackConcludingMessage.text 
        };
        
        const mirrorResponseObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: mirrorMessage.text 
        };
        
        const nameRequestResponseObj: { role: ChatRole; content: string } = { 
          role: "assistant" as ChatRole, 
          content: nameRequestMessage.text 
        };

        const updatedConversation = {
          messages: [
            ...conversationForConclusion.messages,
            fallbackResponseObj,
            mirrorResponseObj,
            nameRequestResponseObj
          ],
          userAnswers: [...conversation.userAnswers, textToSend]
        };
        
        setConversation(updatedConversation);
      }
      
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
      
      // ENHANCED: Set userName immediately and update profile synchronously with additional debugging
      setUserName(textToSend);
      setUserProfile(prev => ({ ...prev, name: textToSend }));
      
      // ENHANCED: Store immediately in localStorage for consistency with detailed logging
      localStorage.setItem('onboardingUserName', textToSend);
      localStorage.setItem('onboarding_user_name', textToSend);
      
      console.log("✅ useOnboardingChat: UserName set and stored:", {
        textToSend,
        userNameState: userName,
        localStorage: localStorage.getItem('onboardingUserName')
      });
      
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

  // FIXED: Get progress percent based on conversation length with linear calculation
  const getProgress = (): number => {
    if (isComplete) return 100;
    if (isGeneratingProfile) return 95;
    
    const userMessageCount = conversation.userAnswers.length;
    
    // Linear progress calculation: 10% base + 75% based on message progress
    const progress = 10 + (userMessageCount / MESSAGE_CAP) * 75;
    
    return Math.min(90, progress);
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
