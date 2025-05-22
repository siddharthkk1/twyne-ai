
import { supabase } from "@/integrations/supabase/client";
import { Conversation, UserProfile } from '@/types/chat';

// System prompts for different modes
export const SYSTEM_PROMPT_STRUCTURED = `
You are Twyne, a warm, curious AI that helps people reflect on their lives and connect with others.
Your goal is to get to know the user well, so you can connect them with people they'll genuinely vibe with.
Ask one question at a time, and wait for the user to respond before asking another.
Keep your questions short, sweet, and open-ended.
Be conversational, not robotic.
`;

export const SYSTEM_PROMPT_PLAYFUL = `
You are Twyne, a fun and playful AI that helps people discover themselves and find their tribe.
Your goal is to get to know the user through lighthearted conversation, so you can match them with kindred spirits.
Ask fun, creative questions, and don't be afraid to be a little quirky.
Keep the vibe upbeat and positive.
`;

export const SYSTEM_PROMPT_YOUNG_ADULT = `
You are Twyne, a chill and friendly AI that helps young adults connect with like-minded people.
Your goal is to get to know the user on a personal level, so you can introduce them to others who share their interests and values.
Ask open-ended questions that encourage self-expression, and be a good listener.
Keep the conversation casual and authentic.
`;

// Function to get AI response
export const getAIResponse = async (conversation: Conversation, userMessage: string, assistantGuidance?: string): Promise<string> => {
  try {
    // Prepare request data
    let requestData: {
      endpoint: string;
      data: {
        messages: any[];
        assistantGuidance?: string;
      }
    } = {
      endpoint: "chat",
      data: {
        messages: [...conversation.messages]
      }
    };

    // Add user message if provided (for normal conversation flow)
    if (userMessage.trim()) {
      requestData.data.messages.push({ role: "user", content: userMessage });
    }

    // Add assistant guidance if provided
    if (assistantGuidance) {
      requestData.data.assistantGuidance = assistantGuidance;
    }

    // Make API request to Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: requestData
    });

    // Handle API response errors
    if (error) {
      console.error("Error from AI chat function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    if (data.error) {
      console.error("Error in AI response:", data.error);
      throw new Error(`AI error: ${data.error}`);
    }

    // Return AI response or fallback text
    return data.content || "I didn't catch that. Could you try again?";
  } catch (err) {
    console.error("Error getting AI response:", err);
    throw err;
  }
};

// Function to evaluate conversation coverage
export const evaluateCoverage = async (conversation: Conversation): Promise<any> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        endpoint: "coverage",
        data: { conversation }
      }
    });

    if (error) {
      console.error("Error from AI coverage function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error("Error evaluating coverage:", err);
    throw err;
  }
};

// Function to generate AI profile
export const generateAIProfile = async (conversation: Conversation): Promise<UserProfile> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        endpoint: "profile",
        data: { conversation }
      }
    });

    if (error) {
      console.error("Error from AI profile function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    // Ensure personalityTraits exist
    if (!data.personalityTraits) {
      data.personalityTraits = {
        extroversion: 50,
        openness: 50,
        empathy: 50,
        structure: 50
      };
    }

    return data;
  } catch (err) {
    console.error("Error generating AI profile:", err);
    throw err;
  }
};

// Function to transcribe audio
export const transcribeAudio = async (audioBlob: string, language?: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        endpoint: "transcribe",
        data: { audioBlob, language }
      }
    });

    if (error) {
      console.error("Error from AI transcribe function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    return data.text;
  } catch (err) {
    console.error("Error transcribing audio:", err);
    throw err;
  }
};
