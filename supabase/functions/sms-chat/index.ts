
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Get environment variables
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Set CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Content-Type': 'application/json',
};

// Function to send SMS via Twilio
async function sendSMS(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    throw new Error("Missing Twilio credentials");
  }
  
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  
  const payload = new URLSearchParams();
  payload.append('To', to);
  payload.append('From', TWILIO_PHONE_NUMBER);
  payload.append('Body', body);
  
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

// Function to get AI response
async function getAIResponse(messages: any[]) {
  if (!OPENAI_API_KEY) {
    throw new Error("Missing OpenAI API key");
  }
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        max_tokens: 300
      }),
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error getting AI response:", error);
    throw error;
  }
}

// Main handler for incoming requests
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    if (req.method === 'POST') {
      const { action, phone, message, conversation } = await req.json();
      
      // Handle different actions
      switch (action) {
        case 'start': {
          // Initialize the conversation via SMS
          const welcomeMessage = "Hey there 👋 I'm Twyne — here to get to know you a bit and help you connect with people you'll actually vibe with. What's your name or what do you like to be called?";
          
          // Send welcome message via SMS
          await sendSMS(phone, welcomeMessage);
          
          return new Response(
            JSON.stringify({ success: true, message: 'SMS conversation started' }),
            { headers: corsHeaders }
          );
        }
          
        case 'send': {
          // Process user message and get AI response
          const aiResponse = await getAIResponse(conversation.messages);
          
          // Send AI response via SMS
          await sendSMS(phone, aiResponse);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: 'SMS sent',
              response: aiResponse 
            }),
            { headers: corsHeaders }
          );
        }
          
        case 'receive': {
          // Handle incoming SMS webhook from Twilio
          // In a real implementation, this would be called by Twilio when a user replies
          
          const formData = await req.formData();
          const from = formData.get('From') as string;
          const body = formData.get('Body') as string;
          
          // Get AI response based on the user's message
          // This would need to look up the existing conversation for this phone number
          const aiResponse = "Thanks for your message! This is a placeholder response in the webhook handler.";
          
          // Reply to the user
          await sendSMS(from, aiResponse);
          
          // Return TwiML response
          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
            { 
              headers: {
                ...corsHeaders,
                'Content-Type': 'text/xml' 
              }
            }
          );
        }
          
        default:
          throw new Error('Invalid action');
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
    
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: corsHeaders
      }
    );
  }
});
