
import { useState } from 'react';
import { Message, Conversation, UserProfile } from '@/types/chat';
import { 
  getAIResponse,
  generateAIProfile,
  getRandomSeedMessage,
  SYSTEM_PROMPT_STRUCTURED,
  SYSTEM_PROMPT_PLAYFUL,
  SYSTEM_PROMPT_YOUNG_ADULT
} from '@/utils/aiUtils';

export const useOnboardingAI = () => {
  const [conversation, setConversation] = useState<Conversation>({
    messages: [],
    userAnswers: []
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  
  // Initialize chat with proper error handling and timeout protection
  const initializeChat = async (
    systemPrompt: string, 
    userName: string, 
    promptMode: string
  ): Promise<{ aiGreeting: string; updatedConversation: Conversation }> => {
    console.log('🚀 initializeChat: Starting chat initialization', { promptMode, userName });
    
    try {
      // Set up timeout protection for initialization (20 seconds)
      const initTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Chat initialization timed out after 20 seconds'));
        }, 20000);
      });
      
      // Create initial conversation with system prompt
      const initialConversation: Conversation = {
        messages: [
          { role: "system", content: systemPrompt }
        ],
        userAnswers: []
      };
      
      console.log('🔄 initializeChat: Getting AI greeting');
      
      // Race between the AI call and timeout
      const aiGreeting = await Promise.race([
        getAIResponse(initialConversation),
        initTimeout
      ]);
      
      console.log('✅ initializeChat: Received AI greeting', { greeting: aiGreeting.substring(0, 100) + '...' });
      
      // For playful mode, use a random seed message instead of API response
      let finalGreeting = aiGreeting;
      if (promptMode === "playful") {
        finalGreeting = getRandomSeedMessage();
        console.log('🎲 initializeChat: Using random seed message for playful mode');
      }
      
      // Update conversation with AI greeting
      const updatedConversation: Conversation = {
        messages: [
          ...initialConversation.messages,
          { role: "assistant", content: finalGreeting }
        ],
        userAnswers: []
      };
      
      console.log('✅ initializeChat: Chat initialization completed successfully');
      
      return {
        aiGreeting: finalGreeting,
        updatedConversation
      };
      
    } catch (error) {
      console.error('❌ initializeChat: Error during initialization:', error);
      
      // Provide fallback greeting based on mode
      let fallbackGreeting = "Hi! I'm Twyne. I'd love to get to know you better. What's been on your mind lately?";
      
      if (promptMode === "playful") {
        fallbackGreeting = getRandomSeedMessage();
      } else if (promptMode === "young-adult") {
        fallbackGreeting = "Hey! I'm Twyne, and I'm here to get to know the real you. What's something you're excited about right now?";
      }
      
      console.log('🔄 initializeChat: Using fallback greeting due to error');
      
      // Create conversation with fallback greeting
      const fallbackConversation: Conversation = {
        messages: [
          { role: "system", content: systemPrompt },
          { role: "assistant", content: fallbackGreeting }
        ],
        userAnswers: []
      };
      
      return {
        aiGreeting: fallbackGreeting,
        updatedConversation: fallbackConversation
      };
    }
  };
  
  // Generate profile with proper error handling and timeout protection
  const generateProfile = async (
    finalConversation: Conversation, 
    userName: string
  ): Promise<UserProfile> => {
    console.log('🔄 generateProfile: Starting profile generation');
    
    setIsGeneratingProfile(true);
    
    try {
      // Set up timeout protection for profile generation (45 seconds)
      const profileTimeout = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Profile generation timed out after 45 seconds'));
        }, 45000);
      });
      
      console.log('🤖 generateProfile: Calling generateAIProfile API');
      
      // Race between the profile generation and timeout
      const profile = await Promise.race([
        generateAIProfile(finalConversation),
        profileTimeout
      ]);
      
      console.log('✅ generateProfile: Profile generated successfully');
      
      // Ensure the name is set if not already present
      if (!profile.name && userName) {
        profile.name = userName;
        console.log('🔄 generateProfile: Added userName to profile');
      }
      
      setIsGeneratingProfile(false);
      return profile;
      
    } catch (error) {
      console.error('❌ generateProfile: Error generating profile:', error);
      
      setIsGeneratingProfile(false);
      
      // Return fallback profile with basic structure
      const fallbackProfile: UserProfile = {
        // 🪞 Overview
        "vibeSummary": "A thoughtful person looking to make meaningful connections.",
        "oneLiner": "Someone who values authentic conversations and genuine relationships.",
        "twyneTags": ["Authentic", "Thoughtful", "Connection-Oriented"],

        // 📌 Key Facts / Background
        "name": userName || "",
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
      };
      
      console.log('🔄 generateProfile: Using fallback profile due to error');
      return fallbackProfile;
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
