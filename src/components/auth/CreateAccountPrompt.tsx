
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Mail, Loader2, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import type { Json } from "@/integrations/supabase/types";

interface CreateAccountPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onboardingProfileData?: any;
}

export const CreateAccountPrompt = ({ open, onOpenChange, onboardingProfileData }: CreateAccountPromptProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, don't show the dialog
  if (user) {
    return null;
  }

  const saveOnboardingDataToUserTable = async (userId: string) => {
    if (!onboardingProfileData) return;

    try {
      console.log("Saving onboarding data to user_data table:", onboardingProfileData);
      
      const { error } = await supabase
        .from('user_data')
        .insert({
          user_id: userId,
          profile_data: onboardingProfileData as unknown as Json,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Error saving onboarding data to user_data:", error);
        toast({
          title: "Warning",
          description: "Account created but profile data couldn't be saved. You can complete onboarding again.",
          variant: "destructive",
        });
      } else {
        console.log("Successfully saved onboarding data to user_data table");
        toast({
          title: "Account created & Profile saved",
          description: "Your account has been created and your profile data has been saved!",
        });
      }
    } catch (error) {
      console.error("Error saving onboarding data:", error);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
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
      // Simplified signup without metadata that was causing issues
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        // Save onboarding data to user_data table immediately
        await saveOnboardingDataToUserTable(data.user.id);
        
        toast({
          title: "Account created successfully",
          description: "Welcome to Twyne! Your profile has been saved.",
        });
        
        // Redirect to mirror page
        navigate("/mirror");
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    
    try {
      // Store onboarding data in localStorage temporarily for Google OAuth flow
      if (onboardingProfileData) {
        localStorage.setItem('onboarding_profile_data', JSON.stringify(onboardingProfileData));
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/mirror',
          queryParams: onboardingProfileData ? {
            from_onboarding: 'true'
          } : undefined
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

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Create your account</DialogTitle>
          <DialogDescription className="text-center">
            Save your profile and unlock all Twyne features
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSignUp} className="space-y-4">
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
              placeholder="******" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input 
              id="confirmPassword" 
              type="password" 
              placeholder="******" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col space-y-2">
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
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
              onClick={handleGoogleSignUp} 
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
            
            <Button type="button" variant="outline" onClick={handleSkip} className="w-full mt-4">
              Skip for now
            </Button>

            <div className="text-center text-xs text-muted-foreground pt-2">
              <p>Already have an account? 
                <Button variant="link" className="p-0 h-auto ml-1" onClick={() => onOpenChange(false)}>
                  Log in instead
                </Button>
              </p>
            </div>
          </div>
        </form>
        
        <DialogFooter className="flex justify-center pt-2">
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail className="h-3 w-3 mr-1" />
            <span>Your email is only used for account access</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
