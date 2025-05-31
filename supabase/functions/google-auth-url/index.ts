
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
    // Get the origin from the request headers with better fallback
    const origin = req.headers.get('origin') || 
                   req.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
                   'https://preview--twyne-ai.lovable.app';
    
    let redirect_uri: string;
    
    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url)
      redirect_uri = url.searchParams.get('redirect_uri') || `${origin}/auth/callback`
    } else {
      const body = await req.json()
      redirect_uri = body.redirect_uri || `${origin}/auth/callback`
    }
    
    console.log('Google Auth URL - Request details:');
    console.log('Google Auth URL - Method:', req.method);
    console.log('Google Auth URL - Origin:', origin);
    console.log('Google Auth URL - Using redirect URI:', redirect_uri);
    console.log('Google Auth URL - Request URL:', req.url);
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    
    if (!clientId) {
      throw new Error('Google client ID not configured')
    }
    
    console.log('Google Auth URL - Client ID configured:', !!clientId);
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirect_uri,
      scope: [
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: 'youtube_auth'
    })
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
    
    console.log('Google Auth URL generated successfully');
    console.log('Google Auth URL length:', authUrl.length);
    
    // For GET requests, redirect directly
    if (req.method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': authUrl
        }
      })
    }
    
    // For POST requests, return the auth URL
    return new Response(
      JSON.stringify({ authUrl }),
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
