
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Enhanced redirect logic for authenticated users
  useEffect(() => {
    if (!authLoading && user) {
      console.log("Auth page: User authenticated, determining redirect destination");
      
      // Check if user has completed onboarding by examining their profile
      const checkUserOnboarding = async () => {
        try {
          const { data: userData, error } = await supabase
            .from('user_data')
            .select('has_completed_onboarding, profile_data, sso_data')
            .eq('user_id', user.id)
            .single();

          if (error) {
            console.warn("Auth page: Could not fetch user data, redirecting to onboarding:", error);
            navigate("/onboarding", { replace: true });
            return;
          }

          if (userData?.has_completed_onboarding) {
            console.log("Auth page: User has completed onboarding, redirecting to mirror");
            navigate("/mirror", { replace: true });
          } else {
            console.log("Auth page: User has not completed onboarding, redirecting to onboarding");
            navigate("/onboarding", { replace: true });
          }
        } catch (error) {
          console.error("Auth page: Error checking user onboarding status:", error);
          // Default to onboarding if we can't determine status
          navigate("/onboarding", { replace: true });
        }
      };

      // Small delay to allow auth context to fully load user profile
      setTimeout(checkUserOnboarding, 100);
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing information",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Clean up any OAuth-related localStorage before standard auth
      console.log("Auth page: Cleaning up OAuth state before standard auth flow");
      const oauthKeys = [
        'oauth_context', 'oauth_onboardingProfile', 'oauth_onboardingUserName',
        'oauth_onboardingConversation', 'oauth_onboardingPromptMode', 'oauth_temp_onboarding_id'
      ];
      oauthKeys.forEach(key => localStorage.removeItem(key));
      
      if (isLogin) {
        console.log("Auth page: Starting standard sign-in flow");
        const { error } = await signIn(email, password);
        if (error) {
          console.error("Auth page: Sign-in error:", error);
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        // Redirect is handled by useEffect above
      } else {
        console.log("Auth page: Starting standard sign-up flow");
        // Use the auth context's signUp function
        const emailPrefix = email.split('@')[0];
        
        const userData = {
          username: emailPrefix.trim() || 'user',
          fullName: emailPrefix.trim() || 'User',
          avatarUrl: '',
          has_onboarded: false,
          profile_data: {}
        };

        console.log("Auth page: Signing up with auth context:", {
          email,
          password: "***",
          userData
        });

        // Use signInWithPassword options to control redirect behavior
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            // Use proper redirect URL for email confirmation
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) {
          console.error("Auth page: Signup error:", error);
          toast({
            title: "Sign up failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          console.log("Auth page: Signup successful, user will be authenticated automatically");
          // Show success message for email/password signup
          toast({
            title: "Account created successfully!",
            description: "Welcome to Twyne! Please check your email to verify your account.",
          });
        }
        // Redirect is handled by useEffect above
      }
    } catch (error: any) {
      console.error("Auth page: Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    
    try {
      console.log("Auth page: Starting Google OAuth flow...");
      
      // Clean up OAuth-related localStorage before starting new flow
      const cleanupKeys = [
        'oauth_context', 'oauth_onboardingProfile', 'oauth_onboardingUserName',
        'oauth_onboardingConversation', 'oauth_onboardingPromptMode', 'oauth_temp_onboarding_id',
        'temp_onboarding_id', 'onboarding_profile', 'onboarding_user_name',
        'onboarding_conversation', 'onboarding_prompt_mode'
      ];
      cleanupKeys.forEach(key => localStorage.removeItem(key));
      
      // Set OAuth context marker for AuthCallback detection
      localStorage.setItem('oauth_context', 'standard_auth');
      
      // Use Supabase's built-in OAuth with proper authorization code flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            state: 'standard_auth', // Add state parameter to distinguish from other OAuth flows
          },
        }
      });
      
      if (error) {
        console.error("Auth page: Google OAuth error:", error);
        // Clean up OAuth context on error
        localStorage.removeItem('oauth_context');
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        setIsGoogleLoading(false);
      }
      // Don't set loading to false here if no error - user will be redirected
    } catch (error: any) {
      console.error("Auth page: Google OAuth exception:", error);
      // Clean up OAuth context on error
      localStorage.removeItem('oauth_context');
      toast({
        title: "Error",
        description: error.message || "Something went wrong with Google sign in.",
        variant: "destructive",
      });
      setIsGoogleLoading(false);
    }
  };

  // Show loading state while auth is being processed
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Setting up your account</p>
        </div>
      </div>
    );
  }

  // If user is already authenticated, don't show auth form
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Setting up your account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Welcome back" : "Create your account"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="your@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {isLogin ? "Sign In" : "Create Account"}
                  </>
                )}
              </Button>
              
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleAuth} 
                disabled={isGoogleLoading}
                className="w-full"
              >
                {isGoogleLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FcGoogle className="mr-2 h-5 w-5" />
                )}
                Google
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
