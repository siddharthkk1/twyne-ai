
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code } = await req.json()
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET')
    
    if (!clientId || !clientSecret) {
      throw new Error('Google credentials not configured')
    }
    
    // Get the origin from the request headers with better fallback handling
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   'https://preview--twyne-ai.lovable.app';
    
    // FIXED: Support both standard auth callback and YouTube-specific callback
    // The redirect_uri should match what was used in the original OAuth request
    // For YouTube, this will be /auth/callback/youtube
    // For standard auth, this will be /auth/callback
    const redirect_uri = `${origin}/auth/callback/youtube`;
    
    console.log('Google Auth - Token exchange attempt');
    console.log('Google Auth - Using redirect URI:', redirect_uri);
    console.log('Google Auth - Request origin:', origin);
    console.log('Google Auth - Client ID configured:', !!clientId);
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri
      })
    })
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Google token exchange failed with status:', tokenResponse.status)
      console.error('Google token exchange error response:', errorText)
      throw new Error(`Token exchange failed: ${tokenResponse.status}`)
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Google token exchange successful')
    console.log('Google token data keys:', Object.keys(tokenData))
    
    return new Response(
      JSON.stringify(tokenData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Google auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
