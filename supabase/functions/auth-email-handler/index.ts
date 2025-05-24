
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://lzwkccarbwokfxrzffjd.supabase.co";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6d2tjY2FyYndva2Z4cnpmZmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NzgyMjUsImV4cCI6MjA2MjI1NDIyNX0.dB8yx1yF6aF6AqSRxzcn5RIgMZpA1mkzN3jBeoG1FeE";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client with the service role key
const supabaseService = createClient(supabaseUrl, serviceRoleKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Parse the request body
    const { email, type } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Processing ${type} request for ${email}`);
    
    let result;
    
    if (type === "signup" || type === "invite") {
      // Generate a signup link
      result = await supabaseService.auth.admin.generateLink({
        type: "signup",
        email,
        options: {
          redirectTo: `${req.headers.get("origin") || "https://twyne-mirror.lovable.dev"}/auth`
        }
      });
    } else {
      // Default to magic link
      result = await supabaseService.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: {
          redirectTo: `${req.headers.get("origin") || "https://twyne-mirror.lovable.dev"}/auth`
        }
      });
    }
    
    console.log("Link generation result:", result);

    if (result.error) {
      throw new Error(result.error.message);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in auth-email-handler:", error);
    
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
