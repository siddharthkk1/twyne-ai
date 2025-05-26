
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
    
    // Ensure we're using the exact redirect URI format for Supabase auth
    console.log('Google Auth - Using redirect URI:', redirect_uri)
    
    const clientId = Deno.env.get('GOOGLE_CLIENT_ID')
    
    if (!clientId) {
      throw new Error('Google client ID not configured')
    }
    
    // Use Supabase auth URL for proper token handling
    const supabaseUrl = req.headers.get('origin')?.replace('localhost:3000', 'lzwkccarbwokfxrzffjd.supabase.co') || ''
    const supabaseAuthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google`
    
    console.log('Google Auth URL generated:', supabaseAuthUrl)
    
    // For GET requests, redirect directly to Supabase auth
    if (req.method === 'GET') {
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          'Location': supabaseAuthUrl
        }
      })
    }
    
    // For POST requests, return the Supabase auth URL
    return new Response(
      JSON.stringify({ authUrl: supabaseAuthUrl }),
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
