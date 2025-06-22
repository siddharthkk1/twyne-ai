
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the current user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    // Get user profile data
    const { data: userData, error: userError } = await supabaseClient
      .from('user_data')
      .select('profile_data')
      .eq('user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User profile data not found');
    }

    const profileData = userData.profile_data || {};

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prompt tuned for emotionally intelligent, real-feeling match intros
    const prompt = ` 
You are an expert at creating emotionally intelligent, authentic-feeling introductions between people. Your goal is to make intros that sound like a mutual friend is saying, “Hey, you two would vibe—here’s why.”

COMPLETE USER PROFILE DATA:
${JSON.stringify(profileData, null, 2)}

GUIDELINES:
- Make each intro feel *real*, like you're introducing two distinct people who would have meaningful chemistry.
- Don't just copy 2–3 traits from the user. Instead, create a *new person* whose vibe, lifestyle, worldview, or social energy resonates naturally with the user.
- Some intros can focus on shared lifestyle (e.g. both love early morning hikes); others might connect values (e.g. both are introspective, growth-oriented), or contrast in a way that complements (e.g. one playful, one grounded).
- Vary tone and rhythm. Not every intro needs to follow the same pattern. Make it sound like a friend telling a story.
- Avoid making the new person sound like a clone of the user.
- Keep each intro short (1–2 sentences max) and warm. Start with "You and {Name}..."
- Make sure each intro includes at least one trait, interest, or energy that would genuinely connect with the user's own vibe—even if it's subtle.

EXAMPLES:

✅ BETTER:
- You and Marcus both find clarity in motion—he’s the kind of guy who talks out his wild startup ideas while pacing the park, playlist in one hand, La Croix in the other.
- You and Sarah would skip the small talk—she's a Colleen Hoover die-hard who annotates her books like a therapist, and you'd probably get into your life philosophies by page 2.

❌ WORSE:
- You and Marcus both love walking 10K steps daily and working on AI-based products that help people. You both also listen to Drake and brainstorm business ideas.
- You and Sarah both annotate Colleen Hoover novels and value emotional vulnerability.

FORMAT:

Return ONLY a valid JSON array in this structure:
[
  {
    "introText": "[Intro that shows resonance, warmth, and real chemistry]",
    "name": "[Realistic first name]", 
    "tags": ["[Meaningful trait]", "[Unique trait]", "[Shared or complementary vibe]"]
  },
  ...
]
- Return exactly 3 introductions—no more, no fewer. 2 should be same gender (male or female) as the user. Determine this from their name. 1 should be opposite gender.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are a perceptive, emotionally intelligent matchmaker. You introduce people like a mutual friend—highlighting subtle resonance, complementary energy, or values that would spark real curiosity and connection. Every intro starts with "You and {Name}...". Return valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 1200
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    let scenarios;
    try {
      // Handle markdown-wrapped JSON responses
      let cleanContent = generatedContent.trim();
      
      // Remove markdown code block formatting if present
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Cleaned content for parsing:', cleanContent);
      scenarios = JSON.parse(cleanContent);
      
      // Validate the structure
      if (!Array.isArray(scenarios) || scenarios.length === 0) {
        throw new Error('Invalid scenarios format');
      }
      
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      console.error('Parse error:', parseError);
      
      // Enhanced fallback scenarios with more specificity
      scenarios = [
        {
          "introText": "You both get lost in Target for hours (especially the home decor section), have strong opinions about which Taylor Swift era is underrated, and believe the best friendships start with oversharing about your latest life revelations.",
          "name": "Alex",
          "tags": ["Target enthusiast", "Swiftie with opinions", "Deep conversation lover"]
        },
        {
          "introText": "You and Sam both read with highlighters in hand, can debate the merits of different coffee brewing methods for an hour, and think the most interesting people are the ones asking 'but why?' about everything.",
          "name": "Sam", 
          "tags": ["Analytical reader", "Coffee connoisseur", "Perpetually curious"]
        },
        {
          "introText": "You both have that specific energy of someone who's moved cities recently and is intentionally building the life they actually want - plus you both think the best way to get to know someone is through their Spotify Wrapped.",
          "name": "Jordan",
          "tags": ["Recent life optimizer", "Music taste revealer", "Intentional friend-maker"]
        },
        {
          "introText": "You and Riley both collect experiences like other people collect things, have at least three creative projects going at once, and genuinely believe that vulnerability and authenticity are the foundation of every good relationship.",
          "name": "Riley",
          "tags": ["Experience collector", "Multi-project creator", "Authenticity advocate"]
        }
      ];
    }

    return new Response(JSON.stringify({ scenarios }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-intros function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
