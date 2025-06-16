
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

    // Generate 3 different intro scenarios using the full profile data
    const prompt = `You are an AI that creates warm, personal introductions between people who might genuinely connect. Based on the user's complete profile, generate 3 different introduction scenarios for potential connections.

Complete User Profile:
${JSON.stringify(profileData, null, 2)}

Generate 3 distinct introduction scenarios. Each should:
1. Feel personal and specific (not generic)
2. Highlight shared values, interests, or life situations based on the rich profile data
3. Be 1-2 sentences explaining why they might connect
4. Sound natural and warm
5. Use "You both" or "You share" language

Also suggest realistic names and personality tags for each person.

Return ONLY a valid JSON array with this structure:
[
  {
    "introText": "You and Alex recently moved to a new city, love debating who the NBA goat is, and care deeply about growth over comfort.",
    "name": "Alex", 
    "tags": ["Big dreamer", "Recently moved", "Growth mindset"]
  },
  {
    "introText": "YYou and Amara both read spicy books faster than your TBR can handle. Sarah J. Maas? Colleen Hoover? You've got annotated paperbacks and a lot of opinions.",
    "name": "Sam",
    "tags": ["Introspective extrovert", "Deep thinker", "Authentic"]
  },
  {
    "introText": "You and Bryton are both getting married in a month and feeling all the chaos and excitement. You both also love over-analyzing movies and deep convos.",
    "name": "Jordan",
    "tags": ["Creative soul", "Curious explorer", "Project lover"]
  }
]`;

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
            content: 'You generate personalized introduction scenarios for people who might connect. Always return valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    let scenarios;
    try {
      scenarios = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', generatedContent);
      // Fallback scenarios
      scenarios = [
        {
          "introText": "You both value authentic connections and enjoy meaningful conversations over small talk.",
          "name": "Alex",
          "tags": ["Deep thinker", "Authentic", "Good listener"]
        },
        {
          "introText": "You share similar interests and both believe in following your curiosity wherever it leads.",
          "name": "Sam", 
          "tags": ["Curious explorer", "Creative", "Open-minded"]
        },
        {
          "introText": "You both prioritize personal growth and enjoy connecting with like-minded people.",
          "name": "Jordan",
          "tags": ["Growth-focused", "Thoughtful", "Supportive"]
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
