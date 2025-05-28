
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
    
    // Get the origin from the request headers
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/');
    
    // Handle both GET and POST requests
    if (req.method === 'GET') {
      const url = new URL(req.url)
      redirect_uri = url.searchParams.get('redirect_uri') || `${origin}/auth/callback`
    } else {
      const body = await req.json()
      redirect_uri = body.redirect_uri || `${origin}/auth/callback`
    }
    
    // Ensure we normalize the redirect URI format
    if (!redirect_uri.endsWith('/auth/callback')) {
      redirect_uri = `${origin}/auth/callback`
    }
    
    console.log('Google Auth - Using redirect URI:', redirect_uri)
    console.log('Google Auth - Request origin:', origin)
    console.log('Google Auth - Full request URL:', req.url)
    console.log('Google Auth - Request headers origin:', req.headers.get('origin'))
    console.log('Google Auth - Request headers referer:', req.headers.get('referer'))
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    
    if (!clientId) {
      throw new Error('Google client ID not configured')
    }
    
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
    
    console.log('Google Auth URL generated:', authUrl)
    
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
