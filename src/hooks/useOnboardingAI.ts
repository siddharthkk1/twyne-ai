
import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { Message, Conversation, UserProfile, ChatRole } from '@/types/chat';
import { getAIResponse, generateAIProfile, getRandomSeedMessage } from '@/utils/aiUtils';

export const useOnboardingAI = () => {
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation>({
    messages: [],
    userAnswers: []
  });
  const [isTyping, setIsTyping] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);

  // Initialize chat with AI greeting
  const initializeChat = async (systemPrompt: string, userName?: string, promptMode?: string): Promise<{ aiGreeting: string; updatedConversation: Conversation }> => {
    setIsInitializing(true);
    
    try {
      let aiGreeting = "";
      
      // Create initial conversation with system prompt
      const initialConversation: Conversation = {
        messages: [
          {
            role: "system" as ChatRole,
            content: systemPrompt
          }
        ],
        userAnswers: []
      };
      
      // Use seed message for playful mode, otherwise get AI greeting
      if (promptMode === "playful") {
        aiGreeting = getRandomSeedMessage();
      } else {
        // Get AI greeting for other modes
        const response = await getAIResponse(initialConversation);
        aiGreeting = response;
      }
      
      // Add AI greeting to conversation
      const updatedConversation: Conversation = {
        messages: [
          ...initialConversation.messages,
          {
            role: "assistant" as ChatRole,
            content: aiGreeting
          }
        ],
        userAnswers: []
      };
      
      setConversation(updatedConversation);
      setIsInitializing(false);
      
      return { aiGreeting, updatedConversation };
    } catch (error) {
      console.error("Error initializing chat:", error);
      setIsInitializing(false);
      
      // Fallback greeting
      const fallbackGreeting = userName ? 
        `Hey ${userName}! I'm Twyne. Ready to chat and get to know you better?` :
        "Hey there! I'm Twyne. Ready to chat and get to know you better?";
      
      const fallbackConversation: Conversation = {
        messages: [
          {
            role: "system" as ChatRole,
            content: "You are Twyne, a friendly AI assistant."
          },
          {
            role: "assistant" as ChatRole,
            content: fallbackGreeting
          }
        ],
        userAnswers: []
      };
      
      return { aiGreeting: fallbackGreeting, updatedConversation: fallbackConversation };
    }
  };

  // Generate user profile from conversation
  const generateProfile = async (finalConversation: Conversation, userName?: string): Promise<UserProfile> => {
    setIsGeneratingProfile(true);
    
    try {
      console.log("Generating profile from conversation:", finalConversation);
      
      // Call the profile generation edge function
      const profileData = await generateAIProfile(finalConversation);
      
      console.log("Generated profile data:", profileData);
      
      // Ensure the profile has required fields and add legacy compatibility
      const completeProfile: UserProfile = {
        // Core required fields
        name: profileData.name || userName || "",
        location: profileData.location || "",
        
        // New AI-generated fields
        vibeSummary: profileData.vibeSummary || "",
        oneLiner: profileData.oneLiner || "",
        twyneTags: profileData.twyneTags || [],
        age: profileData.age || "",
        job: profileData.job || "",
        school: profileData.school || "",
        ethnicity: profileData.ethnicity || "",
        religion: profileData.religion || "",
        hometown: profileData.hometown || "",
        lifestyle: profileData.lifestyle || "",
        favoriteProducts: profileData.favoriteProducts || "",
        style: profileData.style || "",
        interestsAndPassions: profileData.interestsAndPassions || "",
        favoriteMoviesAndShows: profileData.favoriteMoviesAndShows || "",
        favoriteMusic: profileData.favoriteMusic || "",
        favoriteBooks: profileData.favoriteBooks || "",
        favoritePodcastsOrYouTube: profileData.favoritePodcastsOrYouTube || "",
        talkingPoints: profileData.talkingPoints || [],
        favoriteActivities: profileData.favoriteActivities || "",
        favoriteSpots: profileData.favoriteSpots || "",
        coreValues: profileData.coreValues || "",
        lifePhilosophy: profileData.lifePhilosophy || "",
        goals: profileData.goals || "",
        personalitySummary: profileData.personalitySummary || "",
        bigFiveTraits: profileData.bigFiveTraits || {
          openness: "",
          conscientiousness: "",
          extraversion: "",
          agreeableness: "",
          neuroticism: ""
        },
        quirks: profileData.quirks || "",
        communicationStyle: profileData.communicationStyle || "",
        upbringing: profileData.upbringing || "",
        majorTurningPoints: profileData.majorTurningPoints || "",
        recentLifeContext: profileData.recentLifeContext || "",
        socialStyle: profileData.socialStyle || "",
        loveLanguageOrFriendStyle: profileData.loveLanguageOrFriendStyle || "",
        socialNeeds: profileData.socialNeeds || "",
        connectionPreferences: profileData.connectionPreferences || "",
        dealBreakers: profileData.dealBreakers || "",
        boundariesAndPetPeeves: profileData.boundariesAndPetPeeves || "",
        connectionActivities: profileData.connectionActivities || "",
        
        // Legacy compatibility fields - derive from new fields where possible
        interests: profileData.talkingPoints || [profileData.interestsAndPassions || ""],
        personalInsights: [
          profileData.vibeSummary || "",
          profileData.personalitySummary || "",
          profileData.coreValues || ""
        ].filter(insight => insight.trim() !== "")
      };
      
      setIsGeneratingProfile(false);
      return completeProfile;
    } catch (error) {
      console.error("Error generating profile:", error);
      setIsGeneratingProfile(false);
      
      // Return a basic profile structure with required fields
      const fallbackProfile: UserProfile = {
        name: userName || "",
        location: "",
        vibeSummary: "",
        oneLiner: "",
        twyneTags: [],
        interests: [],
        personalInsights: []
      };
      
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
