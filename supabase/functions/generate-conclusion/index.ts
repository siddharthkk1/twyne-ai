
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversation } = await req.json();
    
    if (!conversation || !conversation.messages) {
      throw new Error('Conversation data is required');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create a prompt to generate a concluding message
    const conclusionPrompt = `
Based on the conversation below, generate a warm, thoughtful concluding message that:
1. Reflects on what you've learned about the person
2. Acknowledges the connection you've built
3. Feels like a natural wrap-up to the conversation
4. Is 1-2 sentences maximum
5. Sets up transitioning to creating their profile/mirror
6. Uses the same conversational tone as the rest of the chat

Format your response as a single message that feels personal and genuine, not generic.

Conversation:
${conversation.messages.filter(msg => msg.role !== 'system').map(msg => 
  `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`
).join('\n')}
`;

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
            content: 'You are Twyne, a warm and thoughtful AI that helps people connect. Generate a personalized concluding message based on the conversation. Keep it brief, warm, and natural.'
          },
          {
            role: 'user',
            content: conclusionPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const conclusion = data.choices[0]?.message?.content;

    if (!conclusion) {
      throw new Error('No conclusion generated');
    }

    console.log('Generated conclusion:', conclusion);

    return new Response(
      JSON.stringify({ 
        content: conclusion.trim(),
        success: true 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-conclusion function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
