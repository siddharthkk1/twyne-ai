
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
    const url = new URL(req.url)
    const redirect_uri = url.searchParams.get('redirect_uri') || `${req.headers.get('origin')}/connections`
    
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
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': authUrl
      }
    })
  } catch (error) {
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
