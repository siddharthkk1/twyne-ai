
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
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log("User authenticated:", user.id);

    const { conversation } = await req.json();
    
    if (!conversation || !conversation.messages) {
      return new Response(
        JSON.stringify({ error: "Conversation data is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log("Processing conversation with", conversation.messages.length, "messages");

    // Get current user profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const profileData = user.user_metadata?.profile_data || {};

    // Enhanced system prompt for mirror chat
    const systemPrompt = `You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values.

Current user profile:
- Name: ${profile?.full_name || 'Not set'}
- Bio: ${profile?.bio || 'Not set'}
- Location: ${profile?.location || 'Not set'}
- Username: ${profile?.username || 'Not set'}

Current profile insights from onboarding:
${JSON.stringify(profileData, null, 2)}

The user will tell you what they want to change or update. Your job is to:

1. Listen carefully and understand the essence of what they're saying
2. Interpret their message and map it to structured Mirror updates (e.g., personality traits, preferences, goals, values, lifestyle changes)
3. Reflect back a concise summary of the proposed changes and ask for confirmation before applying them
4. Ask a clarifying follow-up only if necessary to make the update accurate

Keep your tone kind, casual, and respectful. You are here to help them feel seen. Prioritize clarity and consent.`;

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversation.messages.filter(msg => msg.role !== "system")
    ];

    console.log("Sending request to OpenAI with messages:", messages.length);

    if (!openAIApiKey) {
      console.error("OpenAI API key not found");
      return new Response(JSON.stringify({ error: "OpenAI API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid OpenAI response:", data);
      return new Response(JSON.stringify({ error: "Invalid response from OpenAI API" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const aiResponse = data.choices[0].message.content;
    console.log("OpenAI response received successfully");

    return new Response(
      JSON.stringify({ 
        content: aiResponse,
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
