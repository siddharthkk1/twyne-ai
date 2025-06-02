
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
import { useSupabaseSync } from "@/hooks/useSupabaseSync";
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
  const { cleanupOnboardingData } = useSupabaseSync();
  const navigate = useNavigate();

  // Helper function to retrieve comprehensive onboarding data
  const getComprehensiveOnboardingData = () => {
    console.log("📊 CreateAccountPrompt: Retrieving comprehensive onboarding data");
    
    // Get prompt mode from multiple sources
    let promptMode = 'structured';
    const storedPromptMode = localStorage.getItem('onboarding_prompt_mode') || 
                             localStorage.getItem('onboardingPromptMode') ||
                             localStorage.getItem('prompt_mode');
    if (storedPromptMode) {
      promptMode = storedPromptMode;
    }

    // Get profile data with fallback to localStorage
    let profileData = onboardingProfileData;
    if (!profileData) {
      const storedProfile = localStorage.getItem('onboardingProfile') || localStorage.getItem('onboarding_profile');
      if (storedProfile) {
        try {
          profileData = JSON.parse(storedProfile);
        } catch (error) {
          console.warn("⚠️ CreateAccountPrompt: Failed to parse stored profile data");
        }
      }
    }

    // Get conversation data with enhanced validation
    let conversationData: Conversation = { messages: [], userAnswers: [] };
    
    // Try props first, then localStorage
    if (onboardingConversationData && onboardingConversationData.messages && onboardingConversationData.userAnswers) {
      conversationData = onboardingConversationData;
      console.log("✅ CreateAccountPrompt: Using conversation data from props");
    } else {
      const storedConversation = localStorage.getItem('onboardingConversation') || localStorage.getItem('onboarding_conversation');
      if (storedConversation) {
        try {
          const parsed = JSON.parse(storedConversation);
          if (parsed && parsed.messages && Array.isArray(parsed.messages) && parsed.userAnswers && Array.isArray(parsed.userAnswers)) {
            conversationData = parsed;
            console.log("✅ CreateAccountPrompt: Using conversation data from localStorage");
          } else {
            console.warn("⚠️ CreateAccountPrompt: Invalid conversation structure in localStorage");
          }
        } catch (error) {
          console.warn("⚠️ CreateAccountPrompt: Failed to parse stored conversation data");
        }
      }
    }

    // Get userName with fallback
    let finalUserName = userName;
    if (!finalUserName) {
      finalUserName = localStorage.getItem('onboardingUserName') || localStorage.getItem('onboarding_user_name') || '';
    }

    console.log("📊 CreateAccountPrompt: Final comprehensive data:", {
      hasProfileData: !!profileData,
      hasConversationData: !!(conversationData.messages.length > 0 || conversationData.userAnswers.length > 0),
      conversationMessageCount: conversationData.messages.length,
      conversationUserAnswerCount: conversationData.userAnswers.length,
      userName: finalUserName,
      promptMode: promptMode
    });

    return {
      profile: profileData,
      conversation: conversationData,
      userName: finalUserName,
      promptMode: promptMode
    };
  };

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
      console.log("🔄 CreateAccountPrompt: Starting enhanced manual sign-up process");
      
      // Get comprehensive onboarding data
      const { profile, conversation, userName: finalUserName, promptMode } = getComprehensiveOnboardingData();
      
      console.log("📊 CreateAccountPrompt: Final onboarding data for manual signup:", {
        hasProfileData: !!profile,
        hasConversationData: !!(conversation.messages.length > 0 || conversation.userAnswers.length > 0),
        userName: finalUserName,
        promptMode: promptMode,
        conversationMessageCount: conversation.messages.length,
        conversationUserAnswerCount: conversation.userAnswers.length
      });

      // Create account
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

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
        
        // Wait for auth state to update
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Save onboarding data if we have profile data
        if (profile && Object.keys(profile).length > 0) {
          try {
            console.log("🔄 CreateAccountPrompt: Saving comprehensive onboarding data to user_data table");
            
            // Check for existing user_data record first
            const { data: existingUserData, error: fetchError } = await supabase
              .from('user_data')
              .select('*')
              .eq('user_id', data.user.id)
              .maybeSingle();
            
            if (fetchError) {
              console.error("❌ CreateAccountPrompt: Error checking existing user data:", fetchError);
            }
            
            const updateData = {
              profile_data: profile as unknown as Json,
              onboarding_conversation: conversation as unknown as Json,
              onboarding_mode: promptMode,
              has_completed_onboarding: true,
              updated_at: new Date().toISOString()
            };
            
            console.log("📊 CreateAccountPrompt: Data being saved:", {
              userId: data.user.id,
              hasProfileData: !!updateData.profile_data,
              hasConversationData: !!updateData.onboarding_conversation,
              onboardingMode: updateData.onboarding_mode,
              conversationMessageCount: conversation.messages.length,
              conversationUserAnswerCount: conversation.userAnswers.length,
              hasExistingRecord: !!existingUserData
            });

            if (existingUserData) {
              // Update existing record
              const { error: updateError } = await supabase
                .from('user_data')
                .update(updateData)
                .eq('user_id', data.user.id);
              
              if (updateError) {
                console.error("❌ CreateAccountPrompt: Error updating user data:", updateError);
                throw updateError;
              }
            } else {
              // Create new record
              const { error: insertError } = await supabase
                .from('user_data')
                .insert({
                  user_id: data.user.id,
                  ...updateData
                });
              
              if (insertError) {
                console.error("❌ CreateAccountPrompt: Error inserting user data:", insertError);
                throw insertError;
              }
            }
            
            console.log("✅ CreateAccountPrompt: Successfully saved comprehensive onboarding data");
            
            // Clean up onboarding data after successful save
            await cleanupOnboardingData();
            
            toast({
              title: "Account created successfully!",
              description: "Welcome to Twyne! Your profile has been saved.",
            });
            
            navigate("/mirror");
            
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
          console.log("ℹ️ CreateAccountPrompt: No comprehensive onboarding data to save");
          
          // Still clean up any partial data
          await cleanupOnboardingData();
          
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
      // Get comprehensive onboarding data for OAuth preservation
      const { profile, conversation, userName: finalUserName, promptMode } = getComprehensiveOnboardingData();
      
      const onboardingData = {
        profile: profile,
        conversation: conversation,
        userName: finalUserName,
        promptMode: promptMode
      };
      
      console.log('📊 CreateAccountPrompt: Onboarding data to preserve for OAuth:', {
        hasProfile: !!onboardingData.profile,
        userName: onboardingData.userName,
        hasConversation: !!(onboardingData.conversation.messages.length > 0 || onboardingData.conversation.userAnswers.length > 0),
        promptMode: onboardingData.promptMode,
        conversationMessageCount: onboardingData.conversation.messages.length,
        conversationUserAnswerCount: onboardingData.conversation.userAnswers.length
      });
      
      // Store context for callback page
      localStorage.setItem('oauth_context', 'onboarding_results');
      
      // Use the Google auth service for OAuth flow
      await GoogleAuthService.initiateGoogleAuth(onboardingData);
      
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
