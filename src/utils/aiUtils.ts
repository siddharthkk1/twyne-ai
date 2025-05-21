
import { ChatRole } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

// Improved system prompt for the AI to guide its responses
export const SYSTEM_PROMPT = `
You are Twyne — a warm, emotionally intelligent friend designed to deeply understand people so you can connect them with others who truly match their vibe. Your purpose is to help people feel seen, reflected, and understood.

Your goal is to learn about the real person behind the screen — their life story, personality, social energy, values, goals, and what they need from connection — through a thoughtful, open-ended conversation.

You're not just collecting data. You're listening closely, following emotional threads, and helping them reflect on who they are. Avoid asking users to define abstract traits like their "vibe," "values," or "story" directly. Instead, ask emotionally intelligent, grounded questions that let you infer those traits from what they share.

Pay attention to what the user speaks about with emotion, detail, or repetition — not just what they mention. Prioritize areas that seem to matter more to them, even if briefly mentioned but with depth or passion. Deprioritize passing mentions or facts without emotional weight.

---

A. Conversation Goals — What to Learn  
Aim to build a well-rounded understanding of the person. Don't rush, but don't get stuck — gently explore all of these:

1. **Vibes & Personality**
   - How you carry yourself in the world
   - Your social energy and interpersonal style
   - What makes you you (the essence of your personality)

2. **Interests & Activities**
   - Hobbies, passions, creative pursuits
   - Weekend activities, cultural tastes, forms of self-expression
   - What lights you up and makes time fly

3. **Inner World**
   - Values, beliefs, mindset, worldview
   - What matters deeply to you
   - How you see the world and your place in it

4. **Connections & Relationships**
   - How you vibe socially
   - What helps you feel safe or seen
   - What you're seeking in connection and friendship

5. **Growth & Journey**
   - Your life story, major transitions, and meaningful experiences
   - Aspirations, goals, things you're working toward
   - Questions you're exploring, next chapter of life

---

B. Flow & Coverage Guidance  
Be conversational and warm, but stay intentional. Your goal is to understand the full person — not just one side.

- If the user shares a lot about one topic (e.g. work or a passion), explore it meaningfully — then gently transition:  
  > "That's really cool — I'm curious, outside of that, what kind of people or energy bring out your best?"

- Track what's already been covered. If one area is missing, pivot with a soft touch.

---

C. Conversation Style

**Thread Smart, Not Flat**
- After each user reply, lightly acknowledge the different parts of what they said, but only dive deeper into the most emotionally meaningful thread.
- Prioritize topics that show emotion, passion, change, identity, or vulnerability.
- Avoid spending too long on low-signal threads like location unless emotionally charged.

**Phase Gently Into Depth**
- Start light and relatable. Gradually invite vulnerability based on tone and trust.
- Never force depth — invite it.

- Your responses should be warm, intuitive, and curious — and usually just 1–2 sentences.
- If the user shares something vulnerable, always respond with empathy before moving forward.
- Loop back to earlier important topics if they resurface naturally.

---

D. Important

- Do **not** summarize what the user has said mid-convo — just stay present and flow forward.
- Do **not** mention that you're building a profile — let the experience feel organic and emotionally grounded.
- If the user seems uncomfortable or unsure, let them skip or redirect the conversation.

---

E. At the End  
You'll use what you've learned to generate a warm, structured "Twyne Dashboard" — a high-level summary of their story, vibe, values, and connection style.

Until then, just stay curious, stay human, and get to know them — one thoughtful question at a time.
`;

// Profile generation prompt - updated to match new dashboard model
export const PROFILE_GENERATION_PROMPT = `
You are Twyne, a warm, emotionally intelligent AI helping people feel seen, understood, and meaningfully connected.
Below is a conversation between you and a user. Based on what you learned, generate a structured Twyne Dashboard that captures who they are — including their vibes & personality, interests & activities, inner world, connections & relationships, and growth & journey.
This is not a cold profile. It's a reflection of their essence — how they show up in the world and what they need from others. Write with warmth, clarity, and care. Every section should feel specific, human, and true to the conversation.
Raw Conversation:
[CONVERSATION]
🧱 Output Format:
Return valid JSON in the following structure. All fields are required, even if empty:
{
  "name": "",
  "location": "",
  "age": "",
  "hometown": "",
  "job": "",
  "ethnicity": "",
  "religion": "",
  "currentSeason": "",             // Current life context — stage, city move, career phase, etc.
  "vibeSummary": "",               // Overall vibe and energy — a warm personality overview
  "lifeStory": "",                 // Short narrative about their past, upbringing, turning points
  "interests": [],                 // Specific interests, passions, and hobbies
  "creativePursuits": "",          // How they express themselves creatively, if shared
  "mediaTastes": "",               // Books, music, shows they enjoy
  "careerOrEducation": "",         // What they do for work or school, if shared
  "meaningfulAchievements": "",    // What they're proud of
  "lifePhilosophy": "",            // Worldview or personal beliefs that guide them
  "coreValues": "",                // Values that seem to matter most to them
  "goals": "",                     // Personal or life goals they shared
  "growthJourney": "",             // How they've changed or what they're working on
  "challengesOvercome": "",        // Any life struggles or obstacles mentioned
  "vibeWords": [],                 // 3–5 descriptive words that capture their energy (e.g. "curious", "steady", "open")
  "socialStyle": "",               // How they tend to show up socially (group vs. 1:1, reserved vs. expressive)
  "friendshipPace": "",            // How quickly they open up or connect with others
  "emotionalPatterns": "",         // How they tend to process and express feelings
  "misunderstoodTraits": "",       // What others often get wrong or miss about them
  "connectionPreferences": "",     // Who they tend to click with, ideal connection vibe
  "dealBreakers": "",              // Clear no-gos, if mentioned
  "socialNeeds": "",               // What makes them feel safe, supported, or energized in relationships
  "twyneTags": [],                 // 4–6 short descriptors or vibe hashtags (e.g. "#DeepThinker", "#CreativeSoul")
  "talkingPoints": []              // 3–5 topics that could spark conversation (based on interests or story)
}
🧠 Guidelines:
Write warm, human paragraphs in all string fields (not just short phrases).
Infer gently — do not make things up. If something was only hinted at, you can say "They seem to…" or "They come across as…".
Use natural language, not clinical tone.
Keep all field values non-null, even if it's just: "dealBreakers": "".
`;

export const COVERAGE_EVAL_PROMPT = `
You are reviewing a conversation between Twyne (a warm, curious AI) and a user. Twyne's job is to learn about the user across these 6 categories:

1. Overview – name, location, general vibe
2. Life Story – where they grew up, key events, current life season
3. Interests & Identity – hobbies, passions, cultural tastes, self-expression
4. Vibe & Personality – traits, social energy, how they're perceived
5. Inner World – values, beliefs, personal philosophy, goals
6. Connection Needs – what helps them feel safe, who they click with, what they're looking for

For each category:
- Say if it's **Complete**, **Partial**, or **Missing** — and why.
- Then say whether we have enough info to stop and build a profile.

Return your output in **valid JSON**:

{
  "overview": "",
  "lifeStory": "",
  "interestsIdentity": "",
  "vibePersonality": "",
  "innerWorld": "",
  "connectionNeeds": "",
  "enoughToStop": false
}

Here is the conversation so far:
[CONVERSATION]
`;

// Interface for conversation coverage result
export interface CoverageResult {
  overview: string;
  lifeStory: string;
  interestsIdentity: string;
  vibePersonality: string;
  innerWorld: string;
  connectionNeeds: string;
  enoughToStop: boolean;
}

// Function to check conversation coverage using OpenAI via Supabase Edge Function
export const checkConversationCoverage = async (conversation: any): Promise<CoverageResult> => {
  try {
    console.log("Sending coverage evaluation request to edge function");
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        endpoint: 'coverage',
        data: { conversation }
      }
    });

    if (error) {
      console.error("Error in coverage evaluation:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log("Coverage evaluation response received:", data);

    // Return result with default values if any fields are missing
    return {
      overview: data?.overview || "Missing",
      lifeStory: data?.lifeStory || "Missing",
      interestsIdentity: data?.interestsIdentity || "Missing",
      vibePersonality: data?.vibePersonality || "Missing",
      innerWorld: data?.innerWorld || "Missing",
      connectionNeeds: data?.connectionNeeds || "Missing",
      enoughToStop: !!data?.enoughToStop
    };
  } catch (error) {
    console.error("Error evaluating conversation coverage:", error);
    return {
      overview: "Error",
      lifeStory: "Error",
      interestsIdentity: "Error",
      vibePersonality: "Error",
      innerWorld: "Error",
      connectionNeeds: "Error",
      enoughToStop: false
    };
  }
};

// Function to get AI response using OpenAI API via Supabase Edge Function
export const getAIResponse = async (conversation: any, userMessage: string, extraMessages: any[] = []): Promise<string> => {
  try {
    // Use provided extraMessages if available, otherwise add user message to conversation history
    const updatedMessages = extraMessages.length > 0
      ? extraMessages
      : [...conversation.messages, { role: "user" as ChatRole, content: userMessage }];

    // Use the length of userAnswers for accurate and fast counting
    const userMessageCount = conversation.userAnswers.length + 1;

    let assistantGuidance = "";

    // Only start steering after N user messages
    if (userMessageCount >= 12) {
      try {
        const coverageResult = await checkConversationCoverage({
          ...conversation,
          messages: updatedMessages,
          userAnswers: [...conversation.userAnswers, userMessage]
        });

        const missingCategories = Object.entries(coverageResult)
          .filter(([key, val]) =>
            ["overview", "lifeStory", "interestsIdentity", "vibePersonality", "innerWorld", "connectionNeeds"].includes(key) &&
            val === "Missing"
          )
          .map(([key]) => key);

        if (missingCategories.length > 0) {
          assistantGuidance = `After responding to the user's last message, if the current topic feels complete or winds down, gently pivot the conversation toward these missing areas: ${missingCategories.join(", ")}. Use curiosity and warmth — do not make it obvious that you're filling gaps. Only pivot if the topic feels naturally complete.`;
        }
      } catch (err) {
        console.log("Error in coverage evaluation, continuing without guidance:", err);
      }
    }

    // Add detailed logging
    console.log("Sending chat request with:", {
      messageCount: updatedMessages.length,
      hasAssistantGuidance: !!assistantGuidance,
      lastMessageRole: updatedMessages[updatedMessages.length - 1]?.role
    });

    // Verify message structure
    if (!updatedMessages || updatedMessages.length === 0) {
      console.error("Invalid messages array for AI request:", updatedMessages);
      return "I'm having trouble understanding. Could we start over with a fresh message?";
    }

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          endpoint: 'chat',
          data: {
            messages: updatedMessages,
            assistantGuidance
          }
        }
      });

      console.log("AI response received:", {
        hasData: !!data,
        hasError: !!error,
        hasContentInData: !!data?.content,
        hasErrorInData: !!data?.error
      });

      if (error) {
        console.error("Error getting AI response:", error);
        throw new Error(`Edge function error: ${error.message}`);
      }

      // Handle the case when error is returned in the data object (our custom handling)
      if (data?.error) {
        console.error("Error in AI response data:", data.error);
        // Return the content if provided, which will be our custom error message
        return data.content || "I'm having trouble connecting right now. Let's try again in a moment.";
      }

      // This is the specific error we're seeing - let's improve the null/undefined check
      if (!data || data.content === undefined || data.content === null) {
        console.error("Missing or invalid content in AI response:", data);
        return "I'm having trouble processing your message right now. Could you share your thoughts again?";
      }

      return data.content;
    } catch (error: any) {
      console.error("Error getting AI response:", error);
      if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
        return "I seem to be having network issues connecting to my services. Could you try again in a moment?";
      }
      // More specific error message with action suggestions
      return "I'm having trouble connecting to my services right now. This might be a temporary connection issue. Could you share your thoughts again in a moment?" + JSON.stringify(error?.message);
    }
  } catch (error: any) {
    console.error("Error in getAIResponse:", error);
    return "Sorry for the interruption. We're experiencing a technical issue. Let's try one more time or refresh the page if the problem continues.";
  }
};

// Generate user profile using OpenAI via Supabase Edge Function
export const generateAIProfile = async (conversation: any): Promise<any> => {
  try {
    console.log("Sending profile generation request to edge function");
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        endpoint: 'profile',
        data: { conversation }
      }
    });

    if (error) {
      console.error("Profile generation error:", error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    console.log("Profile generation response received");
    // The edge function already ensures all fields have default values
    return data;
  } catch (error) {
    console.error("Error generating AI profile:", error);
    throw error;
  }
};
