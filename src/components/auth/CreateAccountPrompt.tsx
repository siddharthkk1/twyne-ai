import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Lock, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import type { Json } from '@/integrations/supabase/types';
import type { UserProfile, Conversation } from '@/types/chat';

interface CreateAccountPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onboardingProfileData?: UserProfile;
  onboardingConversationData?: Conversation;
  userName?: string;
}

export const CreateAccountPrompt: React.FC<CreateAccountPromptProps> = ({
  open,
  onOpenChange,
  onboardingProfileData,
  onboardingConversationData,
  userName
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

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

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simple signup without metadata since name is already in profile_data
      const signupData = { email, password };
      
      console.log("Signing up with:", {
        email,
        password: "***"
      });

      const { data, error } = await supabase.auth.signUp(signupData);

      if (error) {
        console.error("Signup error:", error);
        toast({
          title: "Error creating account",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Auto sign in the user first
        await signIn(email, password);
        
        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get the stored prompt mode from localStorage
        const storedPromptMode = localStorage.getItem('onboardingPromptMode') || 'structured';
        
        // Now save onboarding data to user_data table if we have it
        if (onboardingProfileData) {
          try {
            const conversationData = onboardingConversationData || {};
            
            const { error: userDataError } = await supabase
              .from('user_data')
              .upsert({
                user_id: data.user.id,
                profile_data: onboardingProfileData as unknown as Json,
                conversation_data: conversationData as unknown as Json,
                prompt_mode: storedPromptMode,
                has_completed_onboarding: true,
                updated_at: new Date().toISOString()
              });

            if (userDataError) {
              console.error("Error saving user data:", userDataError);
              toast({
                title: "Account created",
                description: "Account created successfully, but there was an issue saving your profile data. Please contact support if needed.",
                variant: "default",
              });
            } else {
              console.log("Successfully saved onboarding data to user_data table");
              
              // Clean up localStorage after successful save
              localStorage.removeItem('onboardingProfile');
              localStorage.removeItem('onboardingUserName');
              localStorage.removeItem('onboardingConversation');
              localStorage.removeItem('onboardingPromptMode');
              
              toast({
                title: "Account created successfully!",
                description: "Welcome to Twyne! Your profile has been saved.",
              });
              
              // Navigate to mirror page after successful account creation and data save
              navigate("/mirror");
            }
          } catch (dataError) {
            console.error("Error saving onboarding data:", dataError);
            toast({
              title: "Account created",
              description: "Account created successfully, but there was an issue saving your profile data.",
              variant: "default",
            });
            navigate("/mirror");
          }
        } else {
          toast({
            title: "Account created successfully!",
            description: "Welcome to Twyne! You can now access all features.",
          });
          navigate("/mirror");
        }

        onOpenChange(false);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/mirror'
        }
      });
      
      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong with Google sign in.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl font-bold">
            Create your account
          </DialogTitle>
          <p className="text-muted-foreground">
            Join Twyne to start connecting
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Create Account
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
            
            <div className="flex items-center justify-center text-xs text-muted-foreground pt-4">
              <Mail className="h-3 w-3 mr-1" />
              <span>Your email is only used for account access</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
