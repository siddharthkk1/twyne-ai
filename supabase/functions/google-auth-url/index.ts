
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
    let redirect_uri: string;
    
    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url)
      redirect_uri = url.searchParams.get('redirect_uri') || `${req.headers.get('origin')}/auth/callback`
    } else {
      const body = await req.json()
      redirect_uri = body.redirect_uri || `${req.headers.get('origin')}/auth/callback`
    }
    
    console.log('Google Auth - Using redirect URI:', redirect_uri)
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    
    if (!clientId) {
      throw new Error('Google client ID not configured')
    }
    
    // Build proper Google OAuth URL with correct scopes for YouTube
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/youtube.readonly'
    ].join(' ');
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirect_uri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    
    const finalAuthUrl = authUrl.toString();
    console.log('Google Auth URL generated:', finalAuthUrl)
    
    // For GET requests, redirect directly
    if (req.method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': finalAuthUrl
        }
      })
    }
    
    // For POST requests, return the auth URL
    return new Response(
      JSON.stringify({ authUrl: finalAuthUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Google auth URL error:', error)
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
