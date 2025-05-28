
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
    
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/');
    let redirect_uri = `${origin}/auth/callback`;
    
    // Ensure we normalize the redirect URI format
    if (!redirect_uri.endsWith('/auth/callback')) {
      redirect_uri = `${origin}/auth/callback`
    }
    
    console.log('Google Auth - Exchanging code for token with redirect URI:', redirect_uri)
    console.log('Google Auth - Request origin:', origin)
    console.log('Google Auth - Request headers origin:', req.headers.get('origin'))
    console.log('Google Auth - Request headers referer:', req.headers.get('referer'))
    
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
      console.error('Google token exchange failed:', errorText)
      throw new Error('Failed to exchange code for token')
    }
    
    const tokenData = await tokenResponse.json()
    console.log('Google token exchange successful')
    
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
