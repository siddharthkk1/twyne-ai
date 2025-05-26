
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Auth callback - current URL:', window.location.href);
        console.log('Location search:', window.location.search);
        console.log('Location hash:', window.location.hash);

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/auth?error=' + encodeURIComponent(error));
          return;
        }

        if (code) {
          console.log('Google OAuth code received, handling YouTube connection');
          // This is a Google OAuth callback for YouTube
          try {
            // Store the code in localStorage for the YouTube service to pick up
            localStorage.setItem('youtube_auth_code', code);
            // Redirect to mirror page where YouTube connection will be completed
            navigate('/mirror?youtube_auth=true');
            return;
          } catch (error) {
            console.error('Error handling YouTube auth:', error);
            navigate('/mirror?youtube_error=true');
            return;
          }
        }

        // Handle Supabase auth session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError);
          navigate('/auth?error=' + encodeURIComponent(sessionError.message));
          return;
        }

        if (data.session) {
          console.log('Supabase auth callback successful, session found:', data.session);
          navigate('/mirror');
        } else {
          console.log('No session found in auth callback');
          navigate('/auth');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Processing Authentication...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <p className="text-center text-muted-foreground">
            Please wait while we complete your sign-in...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;
