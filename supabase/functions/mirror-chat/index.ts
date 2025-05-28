
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://lzwkccarbwokfxrzffjd.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseService = createClient(supabaseUrl, serviceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

// Helper function to safely parse JSON from OpenAI
function safeParseJSON(jsonString: string) {
  try {
    // First, try direct parsing
    return JSON.parse(jsonString);
  } catch (error) {
    console.log("Direct JSON parse failed, attempting to clean the string:", error);
    
    try {
      // Clean the string by removing markdown code blocks if present
      let cleaned = jsonString.trim();
      
      // Remove markdown code blocks
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try parsing the cleaned string
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.log("Cleaned JSON parse also failed:", secondError);
      
      try {
        // Last resort: try to extract JSON from the response
        const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error("No valid JSON found in response");
      } catch (finalError) {
        console.error("All JSON parsing attempts failed:", finalError);
        throw new Error("Failed to parse JSON response from OpenAI");
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  try {
    console.log("Mirror chat function called");
    
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.log("No authorization header");
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

    console.log("Processing conversation with", conversation.messages.length, "messages");

    // Get current user profile data from user_data table first, then fallback to profiles
    let profileData = {};
    let profileName = 'Not set';
    let profileBio = 'Not set';
    let profileLocation = 'Not set';
    let profileUsername = 'Not set';

    const { data: userData } = await supabase
      .from('user_data')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (userData?.profile_data) {
      profileData = userData.profile_data;
      profileName = userData.profile_data.name || profileName;
      profileLocation = userData.profile_data.location || profileLocation;
    }

    if (updateType === "update") {
      // Profile update mode
      const updatePrompt = `You are Twyne, an AI assistant that helps users update their personal profiles based on new conversations.

Current user profile data:
${JSON.stringify(profileData, null, 2)}

The user has had the following conversation with you in their Mirror chat:
${conversation.messages.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Your task is to analyze this conversation and update the existing profile data with any new information shared by the user. Follow these guidelines:

1. Only update fields where the user has explicitly shared new information
2. Keep existing data that wasn't contradicted or updated
3. If the user corrects existing information, update it accordingly
4. Don't make assumptions - only use information directly stated by the user
5. Maintain the same JSON structure as the current profile
6. Ensure all JSON strings are properly escaped and valid

Return ONLY a valid JSON object with the updated profile data. Do not include any explanations, markdown formatting, or additional text. The response must be parseable JSON.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: "system", content: updatePrompt }
          ],
          temperature: 0.1, // Lower temperature for more consistent JSON output
          max_tokens: 2000,
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
      const updatedProfileText = data.choices[0].message.content;
      
      console.log("Raw OpenAI response for profile update:", updatedProfileText);
      
      try {
        const updatedProfile = safeParseJSON(updatedProfileText);
        console.log("Successfully parsed updated profile:", updatedProfile);
        
        // Update the user's profile data
        const { error: updateError } = await supabaseService
          .from('user_data')
          .update({ 
            profile_data: updatedProfile,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('id', userData.id);

        if (updateError) {
          console.error("Profile update error:", updateError);
          return new Response(JSON.stringify({ error: "Failed to update profile" }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(
          JSON.stringify({ 
            content: "Perfect! I've updated your mirror with the new information from our conversation. Your profile has been refreshed.",
            profileUpdated: true
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      } catch (parseError) {
        console.error("Failed to parse updated profile:", parseError);
        console.error("Raw response that failed to parse:", updatedProfileText);
        return new Response(JSON.stringify({ error: "Failed to process profile update - invalid JSON response from AI" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    } else {
      // Regular chat mode
      const systemPrompt = `You are Twyne, a warm, emotionally intelligent assistant who helps users update their Mirror — a structured profile that captures their personality, social needs, life context, and values.

Current user profile:
- Name: ${profileName}
- Bio: ${profileBio}
- Location: ${profileLocation}
- Username: ${profileUsername}

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
    }
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
