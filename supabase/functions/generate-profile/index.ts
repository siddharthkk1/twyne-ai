
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROFILE_GENERATION_PROMPT = `
You are Twyne — a warm, emotionally intelligent AI that helps people feel seen, understood, and meaningfully connected.

Below is a conversation between you and a user. Based on what you learned, generate a structured "Twyne Dashboard" that captures who they are. This is more than a profile — it's a vivid, human reflection of their essence: how they move through life, what lights them up, what they care about, and how they connect with others.

Use a kind, thoughtful tone. Write in full, warm sentences (not short fragments). Be specific, never generic. When something is uncertain, gently infer using phrases like "They seem to..." or "It sounds like...".

Raw Conversation:
[CONVERSATION]

🧱 Output Format:
Return a single valid JSON object in the following structure. All fields must be included, even if empty ("" or []).

{
  "vibeSummary": "",
  "oneLiner": "",
  "twyneTags": [],
  "name": "",
  "age": "",
  "location": "",
  "job": "",
  "school": "",
  "ethnicity": "",
  "religion": "",
  "hometown": "",
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
  "upbringing": "",
  "majorTurningPoints": "",
  "recentLifeContext": "",
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation } = await req.json();

    if (!conversation) {
      throw new Error('Conversation data is required');
    }

    // Format conversation for the prompt
    let conversationText = '';
    conversation.messages.forEach((msg: any) => {
      if (msg.role === 'user') {
        conversationText += `User: ${msg.content}\n`;
      } else if (msg.role === 'assistant') {
        conversationText += `Assistant: ${msg.content}\n`;
      }
    });

    const promptWithConversation = PROFILE_GENERATION_PROMPT.replace('[CONVERSATION]', conversationText);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: promptWithConversation
          },
          {
            role: 'user',
            content: 'Generate the profile based on our conversation above.'
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const profileContent = data.choices[0].message.content;

    // Try to parse the JSON response
    let profileData;
    try {
      profileData = JSON.parse(profileContent);
    } catch (parseError) {
      console.error('Failed to parse profile JSON:', parseError);
      console.error('Raw content:', profileContent);
      throw new Error('Failed to parse profile data as JSON');
    }

    return new Response(JSON.stringify(profileData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-profile function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
