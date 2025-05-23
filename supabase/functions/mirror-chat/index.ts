
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://lzwkccarbwokfxrzffjd.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabaseService = createClient(supabaseUrl, serviceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { conversation, updateType } = await req.json();
    
    if (!conversation || !conversation.messages) {
      return new Response(
        JSON.stringify({ error: "Conversation data is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Get current user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const profileData = user.user_metadata?.profile_data || {};

    // Enhanced system prompt for mirror chat
    const systemPrompt = `You are the user's personal mirror assistant. You help them reflect on themselves and update their personal profile information.

Current user profile:
- Name: ${profile?.full_name || 'Not set'}
- Bio: ${profile?.bio || 'Not set'}
- Location: ${profile?.location || 'Not set'}
- Username: ${profile?.username || 'Not set'}

Current profile data from onboarding:
${JSON.stringify(profileData, null, 2)}

Your role is to:
1. Help the user reflect on their experiences and identity
2. Suggest updates to their profile information when appropriate
3. Ask thoughtful questions to help them discover more about themselves
4. Be supportive and encouraging in their self-discovery journey

When the user wants to update their profile, help them think through the changes and provide clear, actionable suggestions. Be conversational and insightful.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.messages.filter(msg => msg.role !== "system")
    ];

    console.log("Sending request to OpenAI with messages:", messages.length);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response from OpenAI API");
    }

    const aiResponse = data.choices[0].message.content;

    // Check if the AI response suggests profile updates
    // This is a simple implementation - could be enhanced with more sophisticated parsing
    const suggestsUpdate = aiResponse.toLowerCase().includes('update') || 
                          aiResponse.toLowerCase().includes('change') ||
                          aiResponse.toLowerCase().includes('modify');

    return new Response(
      JSON.stringify({ 
        content: aiResponse,
        suggestsUpdate,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in mirror-chat function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
