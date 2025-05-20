
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY");
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, data } = await req.json();

    if (endpoint === "chat") {
      return handleChatRequest(data);
    } else if (endpoint === "coverage") {
      return handleCoverageRequest(data);
    } else if (endpoint === "profile") {
      return handleProfileRequest(data);
    } else if (endpoint === "transcribe") {
      return handleTranscribeRequest(data);
    } else {
      throw new Error(`Unknown endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error("Error in AI chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handleChatRequest(data) {
  const { messages, userMessage, assistantGuidance } = data;
  
  const finalMessages = [
    ...messages,
    { role: "user", content: userMessage },
    ...(assistantGuidance ? [{ role: "system", content: assistantGuidance }] : [])
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

  const result = await response.json();
  return new Response(
    JSON.stringify({ content: result.choices[0].message.content }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function handleCoverageRequest(data) {
  const { conversation } = data;
  
  // Format conversation for the coverage evaluation prompt
  const formattedConversation = conversation.messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");
  
  const prompt = `
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
${formattedConversation}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are evaluating conversation coverage." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const responseData = await response.json();
  const resultText = responseData.choices[0].message.content;
  
  try {
    // Extract JSON from response
    const jsonMatch = resultText.match(/(\{[\s\S]*\})/);
    const jsonString = jsonMatch ? jsonMatch[0] : "{}";
    const result = JSON.parse(jsonString);
    
    // Return result with default values if any fields are missing
    return new Response(
      JSON.stringify({
        overview: result.overview || "Missing",
        lifeStory: result.lifeStory || "Missing",
        interestsIdentity: result.interestsIdentity || "Missing",
        vibePersonality: result.vibePersonality || "Missing",
        innerWorld: result.innerWorld || "Missing",
        connectionNeeds: result.connectionNeeds || "Missing",
        enoughToStop: !!result.enoughToStop
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error parsing coverage evaluation:", error);
    return new Response(
      JSON.stringify({
        overview: "Error",
        lifeStory: "Error",
        interestsIdentity: "Error",
        vibePersonality: "Error",
        innerWorld: "Error",
        connectionNeeds: "Error",
        enoughToStop: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleProfileRequest(data) {
  const { conversation } = data;

  // Format conversation for the profile generation prompt
  const formattedConversation = conversation.messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");
  
  const prompt = `
You are Twyne, a warm, emotionally intelligent AI helping people feel seen, understood, and meaningfully connected.
Below is a conversation between you and a user. Based on what you learned, generate a structured Twyne Dashboard that captures who they are — including their vibes & personality, interests & activities, inner world, connections & relationships, and growth & journey.
This is not a cold profile. It's a reflection of their essence — how they show up in the world and what they need from others. Write with warmth, clarity, and care. Every section should feel specific, human, and true to the conversation.
Raw Conversation:
${formattedConversation}
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

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You analyze conversations and create personality profiles." },
        { role: "user", content: prompt }
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

  const resultData = await response.json();
  const profileText = resultData.choices[0].message.content;
  
  try {
    // Extract the JSON part from the response
    const jsonMatch = profileText.match(/(\{[\s\S]*\})/);
    const jsonString = jsonMatch ? jsonMatch[0] : profileText;
    
    const profile = JSON.parse(jsonString);

    // Ensure all fields have default values
    const completeProfile = {
      name: profile.name || "",
      location: profile.location || "",
      age: profile.age || "",
      hometown: profile.hometown || "",
      job: profile.job || "",
      ethnicity: profile.ethnicity || "",
      religion: profile.religion || "", 
      currentSeason: profile.currentSeason || "",
      vibeSummary: profile.vibeSummary || "",
      lifeStory: profile.lifeStory || "",
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      creativePursuits: profile.creativePursuits || "",
      mediaTastes: profile.mediaTastes || "",
      careerOrEducation: profile.careerOrEducation || "",
      meaningfulAchievements: profile.meaningfulAchievements || "",
      lifePhilosophy: profile.lifePhilosophy || "",
      coreValues: profile.coreValues || "",
      goals: profile.goals || "",
      growthJourney: profile.growthJourney || "",
      challengesOvercome: profile.challengesOvercome || "",
      vibeWords: Array.isArray(profile.vibeWords) ? profile.vibeWords : [],
      socialStyle: profile.socialStyle || "",
      friendshipPace: profile.friendshipPace || "",
      emotionalPatterns: profile.emotionalPatterns || "",
      misunderstoodTraits: profile.misunderstoodTraits || "",
      connectionPreferences: profile.connectionPreferences || "",
      dealBreakers: profile.dealBreakers || "",
      socialNeeds: profile.socialNeeds || "",
      twyneTags: Array.isArray(profile.twyneTags) ? profile.twyneTags : [],
      talkingPoints: Array.isArray(profile.talkingPoints) ? profile.talkingPoints : [],
      personalInsights: Array.isArray(profile.personalInsights) ? profile.personalInsights : []
    };
    
    return new Response(
      JSON.stringify(completeProfile),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error parsing AI profile:", error, profileText);
    throw new Error("Failed to parse AI-generated profile");
  }
}

async function handleTranscribeRequest(data) {
  const { audioBlob } = data;
  
  try {
    // Convert base64 to blob
    const byteString = atob(audioBlob.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('file', new Blob([ab], {type: 'audio/webm'}), 'audio.webm');
    formData.append('model', 'whisper-1');
    
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message || response.status}`);
    }
    
    const result = await response.json();
    
    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in transcription:", error);
    throw new Error(`Transcription error: ${error.message}`);
  }
}
