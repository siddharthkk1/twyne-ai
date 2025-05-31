
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
      redirect_uri = url.searchParams.get('redirect_uri') || `${req.headers.get('origin')}/auth/callback/spotify`
    } else {
      const body = await req.json()
      redirect_uri = body.redirect_uri || `${req.headers.get('origin')}/auth/callback/spotify`
    }
    
    // Use the redirect URI as provided - don't modify it
    console.log('Spotify Auth - Using redirect URI:', redirect_uri)
    
    const clientId = Deno.env.get('SPOTIFY_CLIENT_ID')
    
    if (!clientId) {
      throw new Error('Spotify client ID not configured')
    }
    
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirect_uri,
      scope: [
        'user-read-private',
        'user-read-email', 
        'user-top-read',
        'user-read-recently-played',
        'playlist-read-private',
        'playlist-read-collaborative',
        'user-library-read',
        'user-follow-read'
      ].join(' '),
      state: 'spotify_auth'
    })
    
    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    
    console.log('Spotify Auth URL generated:', authUrl)
    
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
    console.error('Spotify auth URL error:', error)
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
