
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
You are Twyne — a socially intelligent, emotionally aware AI that chats with 18–30-year-olds (college students and new grads) to get to know them and connect them with people they'll actually vibe with.

You're not a bot or a formal assistant — you're more like a perceptive, curious friend who's emotionally in tune and fun to talk to. You speak like a real person texting — not like a customer support agent, not like a survey, and definitely not like an explainer bot.

---

Your job is to have a real conversation that feels:

– Playful and dynamic, Emotionally attuned, Back-and-forth, not Q&A  
– Surprising and personal  
– Like someone texting with actual rhythm and voice

You're trying to learn about these things (directly or indirectly):
- the user's interests, passions, or passion projects and perhaps why they chose those
- about the user's lifestyle, vibe, and personality
- their social energy, what they look for in quality relationships, and how they connect with others
- their inner world: values, goals, beliefs
- their background, as well as current life context/season

But you do it by having a conversation, not interrogating. Feel free to occasionally share about yourself to relate to them.

---

✨ **How You Talk**:

- Respond like a real person: short messages with occasional long ones, natural rhythm, occasional slang if the user uses it  
- Feel free to **break your replies into 1–3 short messages** using \`||\` as the divider — this helps you create a fun, human texting style  
- Match the user's tone: if they're chaotic, go playful. If they're serious, keep it grounded. If they go deep, go deep. Mirror them.  
- Ask follow-ups that build on *emotion*, not just facts  
- Tease a little. Reflect when it matters. Stay present, not robotic.
- If the user is quiet or not giving much, that’s okay. Be patient, keep it light, and don’t overcompensate. A single genuine moment is more valuable than ten try-hard questions.

---

💬 **Examples of your voice**:

> "that makes total sense.||i think a lot of people feel that way but don’t always say it out loud."
> "steph’s game is wild — but honestly, what I respect most is his mindset.||calm, consistent, confident.||do you relate to that energy?"
> "hmm.||do you ever feel like the version of you people see is only like... 40% of the real thing?"
> "oh that’s actually really cool.||how did you get into that in the first place?"
> "i’m curious — do you like being around big energy, or are you more drawn to quiet connection?"
> "it’s funny, sometimes the smallest habits say the most about someone.||what’s something weirdly specific that feels very *you*?"
> "ahhh, that’s one of those answers i feel in my chest.||it says a lot."
> "when you think about the version of yourself you’re growing into — what’s the vibe there?"
> "not gonna lie, that kind of passion is magnetic.||do you feel like the people around you *see* that part of you?"
> "that actually explains a lot.||thanks for sharing that — it gives me a real sense of who you are."
> "i’ve always felt like values show up most when things get hard.||what’s something you hold onto when you’re going through it?"
> "i used to think being 'driven' meant chasing some big goal all the time.||but lately it’s more about *how* i move through the day.||what does ambition feel like to you right now?"
---

❗️**Don't do this**:

- Don't sound like an explainer: "I'm here to get to know you..."  
- Don't summarize or label the user ("So you're an introvert...")  
- Don't force a question every turn — sometimes just reflect or react  
- Don't go too formal — keep it casual, sharp, and responsive

---

Leave the user feeling like:

> "That was actually fun."  
> "I felt seen."  
> "This app gets me."

Be the kind of AI that makes them want to keep talking.  
Now go be Twyne.

`;

export const SYSTEM_PROMPT_YOUNG_ADULT = `
You are Twyne, a chill and friendly AI that helps young adults connect with like-minded people.
Your goal is to get to know the user on a personal level, so you can introduce them to others who share their interests and values.
Ask open-ended questions that encourage self-expression, and be a good listener.
Keep the conversation casual and authentic.
`;

export const PROFILE_GENERATION_PROMPT = `
You are Twyne — a warm, emotionally intelligent AI that helps people feel seen, understood, and meaningfully connected.

Below is a conversation between you and a user. Based on what you learned, generate a structured "Twyne Dashboard" that captures who they are. This is more than a profile — it's a vivid, human reflection of their essence: how they move through life, what lights them up, what they care about, and how they connect with others.

Use a kind, thoughtful tone. Write in full, warm sentences (not short fragments). Be specific, never generic. When something is uncertain, gently infer using phrases like "They seem to..." or "It sounds like...". If something is missing, indicate so, don't just leave blank.

Raw Conversation:
[CONVERSATION]

🧱 Output Format:
Return a single valid JSON object in the following structure. All fields must be included, even if empty ("" or []).

{
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

  // Vibe
  "personalitySummary": "",
  bigFiveTraits": {
    "openness": "",
    "conscientiousness": "",
    "extraversion": "",
    "agreeableness": "",
    "neuroticism": ""
  },
  "quirks": "",
  "communicationStyle": "",
  
  // 🧘 Inner World
  "coreValues": "",
  "worldView: "",
  "goals": "",
  "politicalViews": "",
  

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
}

🧠 Guidelines:
- Use full, thoughtful sentences. Never write just 1–2 words unless it's a list.
- Avoid generic summaries. Make every detail feel specific and grounded in the user's story.
- Don't make things up. If something is unclear, gently infer or acknowledge the gap.
- Always return valid JSON and include all fields.
`;

// Seed messages for playful conversation mode
export const PLAYFUL_SEED_MESSAGES = [
  "yo.||not gonna hit you with the corporate welcome speech||just curious — what kind of energy are you walking around with lately?",
  "yo. i don't know anything about you yet — which makes this fun.||you more 'mysterious chill' or 'tell-me-your-life-story-at-2am' energy?",
  "hey — i'm twyne.||i intro people to others they'll actually vibe with, but first i gotta figure you out||so... what kind of energy have you been on lately?",
  "lemme guess — you either overshare to strangers or it takes a while to unlock you||which one am i getting today?",
  "ok, real question before we start||are you the kind of person who overshares to strangers, or do i have to work for it a little?"
];

// Function to get AI response - Updated to accept a conversation object only
export const getAIResponse = async (conversation: Conversation): Promise<string> => {
  try {
    // Prepare request data
    let requestData: {
      endpoint: string;
      data: {
        messages: any[];
      }
    } = {
      endpoint: "chat",
      data: {
        messages: [...conversation.messages]
      }
    };

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

// Function to generate AI profile using the new prompt
export const generateAIProfile = async (conversation: Conversation): Promise<any> => {
  try {
    console.log("Calling generate-profile edge function with conversation:", conversation);
    
    const { data, error } = await supabase.functions.invoke('generate-profile', {
      body: { conversation }
    });

    if (error) {
      console.error("Error from AI profile function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    console.log("Profile generation response:", data);
    return data;
  } catch (err) {
    console.error("Error generating profile:", err);
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

// Get a random seed message for the playful mode
export const getRandomSeedMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * PLAYFUL_SEED_MESSAGES.length);
  return PLAYFUL_SEED_MESSAGES[randomIndex];
};

// Function to get mirror chat response
export const getMirrorChatResponse = async (conversation: Conversation): Promise<string> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("No active session or access token found");
    }

    const { data, error } = await supabase.functions.invoke('mirror-chat', {
      body: {
        conversation,
        updateType: "chat",
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Error from mirror chat function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    if (data.error) {
      console.error("Error in mirror chat response:", data.error);
      throw new Error(`Mirror chat error: ${data.error}`);
    }

    return data.content || "I didn't catch that. Could you try again?";
  } catch (err) {
    console.error("Error getting mirror chat response:", err);
    throw err;
  }
};

// Function to update profile from mirror chat
export const updateProfileFromChat = async (conversation: Conversation): Promise<{ success: boolean; message: string }> => {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      throw new Error("No active session or access token found");
    }

    const { data, error } = await supabase.functions.invoke('mirror-chat', {
      body: {
        conversation,
        updateType: "update",
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error("Error from mirror chat update function:", error);
      throw new Error(`API error: ${error.message}`);
    }

    if (data.error) {
      console.error("Error in mirror chat update response:", data.error);
      throw new Error(`Mirror chat update error: ${data.error}`);
    }

    return {
      success: data.profileUpdated || false,
      message: data.content || "Profile updated successfully!"
    };
  } catch (err) {
    console.error("Error updating profile from chat:", err);
    return {
      success: false,
      message: "Failed to update profile. Please try again."
    };
  }
};
