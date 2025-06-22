
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    )

    // Get user from auth
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('🚀 Generating intros for user:', user.id)

    // Get user's profile data
    const { data: userData, error: userError } = await supabaseClient
      .from('user_data')
      .select('profile_data')
      .eq('user_id', user.id)
      .single()

    if (userError || !userData?.profile_data) {
      console.error('Error fetching user profile:', userError)
      return new Response(JSON.stringify({ error: 'Profile not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const profileData = userData.profile_data as any
    console.log('📊 User profile data keys:', Object.keys(profileData))

    // Enhanced prompt for more authentic intros
    const prompt = `You are creating warm, authentic introductions between people who would genuinely connect. Your goal is to identify ONE meaningful connection point that would make two people excited to meet.

PHILOSOPHY:
- Focus on deeper resonance: shared values, life philosophy, personality alignment, or meaningful experiences
- Look for authentic compatibility, not surface-level similarities
- Write as if you're a thoughtful friend making an introduction
- Emphasize WHY this connection would be meaningful, not just WHAT they have in common

USER PROFILE CONTEXT:
${JSON.stringify(profileData, null, 2)}

GUIDELINES:
1. Find AT LEAST ONE core connection point that demonstrates genuine compatibility. Focus on values, mindset, life approach, or meaningful shared experiences
3. Occasionally, add some personal detail, 1 or 2 specific interests, quirks, or traits if it fits the rest of the intro.
4. Use natural, conversational language - avoid lists or bullet points
5. Write 2 sentences or 1 longer sentence maximum per intro
6. Make it feel like a warm recommendation from a mutual friend
7. Avoid many over-specific details that feel forced or researched

AUTHENTICITY CHECKS:
- Would this intro make both people curious to meet?
- Does it highlight meaningful compatibility beyond surface interests?
- Does it sound like something a thoughtful friend would say?
- Is it specific enough to be genuine but not so specific it feels researched?

Create 3 warm introduction scenarios. Each should feel authentic and focus on one meaningful connection point.

Format as JSON:
{
  "scenarios": [
    {
      "name": "First Name",
      "introText": "Natural introduction focusing on one meaningful connection",
      "tags": ["3-4 authentic connection descriptors"]
    }
  ]
}

EXAMPLE GOOD INTROS:
- "You and Maya both believe in following your curiosity over having a fixed plan, and you're both in that exciting phase of figuring out what really matters to you."
- "You and Jordan share that rare combination of being deeply thoughtful but also action-oriented - you both think carefully but aren't afraid to take meaningful risks."
- "You and Alex both value authentic connections and have that gift of making others feel truly heard in conversation."

Generate 3 scenarios now:`

    console.log('🤖 Calling OpenAI API...')
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    })

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error('OpenAI API error:', errorText)
      throw new Error(`OpenAI API error: ${openAIResponse.status}`)
    }

    const openAIData = await openAIResponse.json()
    console.log('✅ OpenAI response received')

    let scenarios
    try {
      const content = openAIData.choices[0].message.content
      console.log('📝 OpenAI raw content:', content)
      
      // Try to parse the JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        scenarios = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('❌ Error parsing OpenAI response:', parseError)
      
      // Fallback scenarios with improved authenticity
      scenarios = {
        scenarios: [
          {
            name: "Alex",
            introText: "You and Alex both believe growth happens outside your comfort zone, and you're both navigating that balance between ambition and staying true to yourselves.",
            tags: ["Growth-minded", "Authentic", "Ambitious", "Self-aware"]
          },
          {
            name: "Sam",
            introText: "You and Sam share that thoughtful approach to life where you value deep conversations and meaningful connections over surface-level interactions.",
            tags: ["Deep thinker", "Meaningful connections", "Thoughtful", "Authentic"]
          },
          {
            name: "Jordan",
            introText: "You and Jordan both have that creative energy where you're drawn to projects that feel personally meaningful rather than just professionally smart.",
            tags: ["Creative", "Purpose-driven", "Project-oriented", "Passionate"]
          }
        ]
      }
    }

    console.log('🎯 Generated scenarios:', scenarios.scenarios?.length || 0)
    
    return new Response(JSON.stringify(scenarios), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('💥 Function error:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
