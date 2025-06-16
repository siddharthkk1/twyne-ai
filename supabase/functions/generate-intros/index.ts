
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

    // Enhanced prompt for maximum specificity and personalization
    const prompt = `You are an expert at creating hyper-specific, deeply personalized introductions between people who share meaningful connections. Your goal is to create introductions that feel like they were written by someone who truly knows both people intimately.

COMPLETE USER PROFILE DATA:
${JSON.stringify(profileData, null, 2)}

CRITICAL REQUIREMENTS FOR MAXIMUM SPECIFICITY:
1. Reference SPECIFIC details from the profile - exact book titles, specific shows, particular activities, named places, etc.
2. Mention concrete shared interests, not general categories
3. Use the person's actual personality traits, communication style, and values
4. Reference specific life situations, goals, or recent experiences mentioned in the profile
5. Include quirky details, specific preferences, or unique characteristics that make the person memorable
6. Use natural, conversational language that shows genuine understanding of who they are
7. Each intro should feel completely unique and impossible to generate for someone else

EXAMPLES OF SPECIFICITY LEVELS:

❌ TOO GENERAL: "You both love reading and have similar values about growth."
❌ TOO GENERAL: "You both enjoy creative projects and exploring new ideas."

Generate 3 distinct, specific introduction scenarios. Each should:
- 1-2 sentences
- start with "You and {Name}"
- Feel like it was written by a mutual friend who knows both people well
- Include at least 2-3 specific details from the user's profile
- Reference exact interests, activities, books, shows, places, or experiences
- Capture the person's unique personality and communication style
- Sound completely natural and conversational
- Be impossible to generate for any other person

Return ONLY a valid JSON array with this structure:
[
  {
    "introText": "[Specific, personalized intro that references exact details from their profile]",
    "name": "[Realistic first name]", 
    "tags": ["[Specific personality trait]", "[Unique characteristic]", "[Specific interest or value]"]
  },
  {
    "introText": "[Another completely unique, specific intro]",
    "name": "[Different realistic first name]",
    "tags": ["[Different specific traits that match the intro]", "[Unique quality]", "[Specific shared interest]"]
  },
  {
    "introText": "[Third unique, deeply personalized intro]",
    "name": "[Third realistic first name]",
    "tags": ["[Matching personality traits]", "[Specific characteristic]", "[Unique shared quality]"]
  },
]

Examples:
[
  {
    "introText": "You and Marcus both get excited about 3am creative bursts, working on products that aim to bring in the big bucks. You both also love any debate over the NBA goat - MJ or Bron? You've got takes.",
    "name": "Marcus", 
    "tags": ["deep thinker", "startups", "#BronGuy"]
  },
  {
    "introText": "[You and Sarah both devour Colleen Hoover novels (you've probably both cried over It Ends With Us), annotate your favorite passages in different colored pens, and believe that vulnerability is the key to real connection.",
    "name": "Sarah"",
    "tags": ["introvert", "#bookworm", "social activism"]
  },
  {
    "introText": "You and David both value authenticity and growth over fakeness and comfort; you spend many hours thinking about how to become the best versions of yourselves and chasae after your goals.",
    "name": "David",
    "tags": ["ambitious", "#seekdiscomfort", "authenticity"]
  },
]

Focus on creating introductions that make the user think "Wow, this person really gets me and would actually want to hang out with someone like this."`;

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
            content: 'You are an expert at warm, personalized introductions that reference exact details from user profiles. Every intro will be 1-2 sentences with detail. Should start with "You and {Name}..." Always return valid JSON only.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
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
