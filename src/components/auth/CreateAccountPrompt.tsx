
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
import { GoogleAuthService } from "@/services/googleAuthService";
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
      console.log("🔄 CreateAccountPrompt: Starting manual sign-up process");
      
      // Get the prompt mode from multiple sources with fallback logic
      let promptMode = 'structured'; // default fallback
      
      // Try to get from localStorage first (most reliable for chat flow)
      const storedPromptMode = localStorage.getItem('onboarding_prompt_mode') || 
                               localStorage.getItem('onboardingPromptMode') ||
                               localStorage.getItem('prompt_mode');
      
      if (storedPromptMode) {
        promptMode = storedPromptMode;
        console.log("✅ CreateAccountPrompt: Found prompt mode in localStorage:", promptMode);
      } else {
        // Check URL parameters as backup (for paste flow)
        const urlParams = new URLSearchParams(window.location.search);
        const urlPromptMode = urlParams.get('prompt_mode') || urlParams.get('mode');
        if (urlPromptMode) {
          promptMode = urlPromptMode;
          console.log("✅ CreateAccountPrompt: Found prompt mode in URL:", promptMode);
        } else {
          console.log("⚠️ CreateAccountPrompt: No prompt mode found, using default:", promptMode);
        }
      }
      
      // Store the prompt mode in localStorage for consistency
      localStorage.setItem('onboarding_prompt_mode', promptMode);
      localStorage.setItem('onboardingPromptMode', promptMode); // Legacy key for compatibility
      
      console.log("📊 CreateAccountPrompt: Final onboarding data:", {
        hasProfileData: !!onboardingProfileData,
        hasConversationData: !!onboardingConversationData,
        userName: userName,
        promptMode: promptMode,
        profileDataKeys: onboardingProfileData ? Object.keys(onboardingProfileData) : [],
        conversationMessageCount: onboardingConversationData?.messages?.length || 0,
        conversationUserAnswerCount: onboardingConversationData?.userAnswers?.length || 0
      });

      // Simple signup without metadata since name is already in profile_data
      const signupData = { email, password };
      
      console.log("🔄 CreateAccountPrompt: Creating account with Supabase");

      const { data, error } = await supabase.auth.signUp(signupData);

      if (error) {
        console.error("❌ CreateAccountPrompt: Signup error:", error);
        toast({
          title: "Error creating account",
          description: error.message || "Failed to create account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        console.log("✅ CreateAccountPrompt: Account created successfully, auto-signing in");
        
        // Auto sign in the user first
        await signIn(email, password);
        
        // Wait a moment for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Now save onboarding data to user_data table if we have it
        if (onboardingProfileData) {
          try {
            console.log("🔄 CreateAccountPrompt: Saving onboarding data to user_data table");
            
            const conversationData = onboardingConversationData || {};
            
            const updateData = {
              user_id: data.user.id,
              profile_data: onboardingProfileData as unknown as Json,
              conversation_data: conversationData as unknown as Json,
              prompt_mode: promptMode,
              has_completed_onboarding: true,
              updated_at: new Date().toISOString()
            };
            
            console.log("📊 CreateAccountPrompt: Data being saved:", {
              userId: data.user.id,
              hasProfileData: !!updateData.profile_data,
              hasConversationData: !!updateData.conversation_data,
              promptMode: updateData.prompt_mode,
              conversationMessageCount: conversationData.messages?.length || 0,
              conversationUserAnswerCount: conversationData.userAnswers?.length || 0
            });

            const { error: userDataError } = await supabase
              .from('user_data')
              .upsert(updateData);

            if (userDataError) {
              console.error("❌ CreateAccountPrompt: Error saving user data:", userDataError);
              toast({
                title: "Account created",
                description: "Account created successfully, but there was an issue saving your profile data. Please contact support if needed.",
                variant: "default",
              });
            } else {
              console.log("✅ CreateAccountPrompt: Successfully saved onboarding data to user_data table");
              
              // Enhanced cleanup of localStorage after successful save
              const keysToRemove = [
                'onboardingProfile',
                'onboardingUserName', 
                'onboardingConversation',
                'onboardingPromptMode',
                'onboarding_profile',
                'onboarding_user_name',
                'onboarding_conversation',
                'onboarding_prompt_mode',
                'prompt_mode',
                'temp_onboarding_id',
                'onboarding_timestamp'
              ];
              
              keysToRemove.forEach(key => {
                if (localStorage.getItem(key)) {
                  localStorage.removeItem(key);
                  console.log(`🧹 CreateAccountPrompt: Removed localStorage key: ${key}`);
                }
              });
              
              toast({
                title: "Account created successfully!",
                description: "Welcome to Twyne! Your profile has been saved.",
              });
              
              // Navigate to mirror page after successful account creation and data save
              navigate("/mirror");
            }
          } catch (dataError) {
            console.error("❌ CreateAccountPrompt: Error saving onboarding data:", dataError);
            toast({
              title: "Account created",
              description: "Account created successfully, but there was an issue saving your profile data.",
              variant: "default",
            });
            navigate("/mirror");
          }
        } else {
          console.log("ℹ️ CreateAccountPrompt: No onboarding data to save");
          toast({
            title: "Account created successfully!",
            description: "Welcome to Twyne! You can now access all features.",
          });
          navigate("/mirror");
        }

        onOpenChange(false);
      }
    } catch (error) {
      console.error("❌ CreateAccountPrompt: Signup error:", error);
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
    console.log('🔄 CreateAccountPrompt: Starting Google OAuth with enhanced data preservation');
    
    setIsGoogleLoading(true);
    
    try {
      // Get the prompt mode with fallback logic
      let promptMode = 'structured';
      
      const storedPromptMode = localStorage.getItem('onboarding_prompt_mode') || 
                               localStorage.getItem('onboardingPromptMode') ||
                               localStorage.getItem('prompt_mode');
      
      if (storedPromptMode) {
        promptMode = storedPromptMode;
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const urlPromptMode = urlParams.get('prompt_mode') || urlParams.get('mode');
        if (urlPromptMode) {
          promptMode = urlPromptMode;
        }
      }
      
      // Prepare onboarding data for OAuth with enhanced preservation
      const onboardingData = {
        profile: onboardingProfileData,
        conversation: onboardingConversationData,
        userName: userName || onboardingProfileData?.name || '',
        promptMode: promptMode
      };
      
      console.log('📊 CreateAccountPrompt: Onboarding data to preserve for OAuth:', {
        hasProfile: !!onboardingData.profile,
        userName: onboardingData.userName,
        hasConversation: !!onboardingData.conversation,
        promptMode: onboardingData.promptMode,
        conversationMessageCount: onboardingData.conversation?.messages?.length || 0,
        conversationUserAnswerCount: onboardingData.conversation?.userAnswers?.length || 0
      });
      
      // Store context for callback page
      localStorage.setItem('oauth_context', 'onboarding_results');
      
      // Use the Google auth service for OAuth flow
      await GoogleAuthService.initiateGoogleAuth(onboardingData);
      
      // The OAuth flow will handle the redirect automatically
      
    } catch (error: any) {
      console.error('❌ CreateAccountPrompt: Error in Google OAuth:', error);
      toast({
        title: "Google sign in failed",
        description: error.message || "Something went wrong with Google sign in.",
        variant: "destructive",
      });
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
