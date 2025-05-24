
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation } = await req.json();
    
    if (!conversation || !conversation.messages) {
      throw new Error('Conversation data is required');
    }

    console.log('Generating profile for conversation with', conversation.messages.length, 'messages');

    // Prepare the conversation text for the prompt
    const conversationText = conversation.messages
      .filter((msg: any) => msg.role !== 'system')
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const profilePrompt = `You are Twyne — a warm, emotionally intelligent AI that helps people feel seen, understood, and meaningfully connected.

Below is a conversation between you and a user. Based on what you learned, generate a structured "Twyne Dashboard" that captures who they are. This is more than a profile — it's a vivid, human reflection of their essence: how they move through life, what lights them up, what they care about, and how they connect with others.

Use a kind, thoughtful tone. Write in full, warm sentences (not short fragments). Be specific, never generic. When something is uncertain, gently infer using phrases like "They seem to..." or "It sounds like...".

Raw Conversation:
${conversationText}

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
- Always return valid JSON and include all fields.`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: profilePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const profileContent = openAIData.choices[0]?.message?.content;

    if (!profileContent) {
      throw new Error('No profile content generated');
    }

    console.log('Generated profile content:', profileContent);

    // Try to parse the JSON response
    let profileData;
    try {
      profileData = JSON.parse(profileContent);
    } catch (parseError) {
      console.error('Error parsing profile JSON:', parseError);
      console.error('Raw content:', profileContent);
      
      // Return a basic profile structure if parsing fails
      profileData = {
        vibeSummary: "They seem like someone with a unique perspective on life.",
        oneLiner: "An interesting person worth getting to know.",
        twyneTags: [],
        name: "",
        age: "",
        location: "",
        job: "",
        school: "",
        ethnicity: "",
        religion: "",
        hometown: "",
        lifestyle: "",
        favoriteProducts: "",
        style: "",
        interestsAndPassions: "",
        favoriteMoviesAndShows: "",
        favoriteMusic: "",
        favoriteBooks: "",
        favoritePodcastsOrYouTube: "",
        talkingPoints: [],
        favoriteActivities: "",
        favoriteSpots: "",
        coreValues: "",
        lifePhilosophy: "",
        goals: "",
        personalitySummary: "",
        bigFiveTraits: {
          openness: "",
          conscientiousness: "",
          extraversion: "",
          agreeableness: "",
          neuroticism: ""
        },
        quirks: "",
        communicationStyle: "",
        upbringing: "",
        majorTurningPoints: "",
        recentLifeContext: "",
        socialStyle: "",
        loveLanguageOrFriendStyle: "",
        socialNeeds: "",
        connectionPreferences: "",
        dealBreakers: "",
        boundariesAndPetPeeves: "",
        connectionActivities: ""
      };
    }

    return new Response(JSON.stringify(profileData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-profile function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
