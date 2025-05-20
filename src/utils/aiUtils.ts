
import { ChatRole } from "@/types/chat";

// OpenAI API key - in a real app, this would be stored securely in environment variables or backend
// For this demo, we're using it directly (not recommended for production)
const OPENAI_API_KEY = "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";

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

// Function to check conversation coverage using OpenAI
export const checkConversationCoverage = async (conversation: any): Promise<CoverageResult> => {
  try {
    // Format conversation for the coverage evaluation prompt
    const formattedConversation = conversation.messages
      .filter((msg: any) => msg.role !== "system")
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
    
    // Create prompt for coverage evaluation
    const prompt = COVERAGE_EVAL_PROMPT.replace("[CONVERSATION]", formattedConversation);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system" as ChatRole, content: "You are evaluating conversation coverage." },
          { role: "user" as ChatRole, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    
    try {
      // Extract JSON from response
      const jsonMatch = resultText.match(/(\{[\s\S]*\})/);
      const jsonString = jsonMatch ? jsonMatch[0] : "{}";
      const result = JSON.parse(jsonString);
      
      // Return result with default values if any fields are missing
      return {
        overview: result.overview || "Missing",
        lifeStory: result.lifeStory || "Missing",
        interestsIdentity: result.interestsIdentity || "Missing",
        vibePersonality: result.vibePersonality || "Missing",
        innerWorld: result.innerWorld || "Missing",
        connectionNeeds: result.connectionNeeds || "Missing",
        enoughToStop: !!result.enoughToStop
      };
    } catch (error) {
      console.error("Error parsing coverage evaluation:", error);
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

// Function to get AI response using OpenAI API
export const getAIResponse = async (conversation: any, userMessage: string, extraMessages: any[] = []): Promise<string> => {
  try {
    // Add user message to conversation history
    const updatedMessages = extraMessages.length > 0
      ? extraMessages
      : [...conversation.messages, { role: "user" as ChatRole, content: userMessage }];

    // Use the length of userAnswers for accurate and fast counting
    const userMessageCount = conversation.userAnswers.length + 1;

    let assistantGuidance = "";

    // Only start steering after N user messages
    if (userMessageCount >= 12) {
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
    }

    const finalMessages: { role: ChatRole; content: string; }[] = [
      ...updatedMessages,
      ...(assistantGuidance
        ? [{ role: "system" as ChatRole, content: assistantGuidance }]
        : [])
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: finalMessages,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API error:", errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting AI response:", error);
    return "Sorry, something went wrong. Can we try that again?";
  }
};

// Generate user profile using OpenAI
export const generateAIProfile = async (conversation: any): Promise<any> => {
  try {
    // Format conversation for the profile generation prompt
    const formattedConversation = conversation.messages
      .filter((msg: any) => msg.role !== "system")
      .map((msg: any) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join("\n\n");
    
    // Create prompt for profile generation
    const prompt = PROFILE_GENERATION_PROMPT.replace("[CONVERSATION]", formattedConversation);

    console.log("Sending profile generation prompt to OpenAI");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system" as ChatRole, content: "You analyze conversations and create personality profiles." },
          { role: "user" as ChatRole, content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI profile generation error:", errorData);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const profileText = data.choices[0].message.content;
    
    console.log("Raw profile from OpenAI:", profileText);
    
    // Extract the JSON part from the response
    const jsonMatch = profileText.match(/(\{[\s\S]*\})/);
    const jsonString = jsonMatch ? jsonMatch[0] : profileText;
    
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error parsing AI profile:", error, profileText);
      throw new Error("Failed to parse AI-generated profile");
    }
  } catch (error) {
    console.error("Error generating AI profile:", error);
    throw error;
  }
};
