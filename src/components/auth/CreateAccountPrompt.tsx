
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { UserPlus, Mail, Lock, User } from "lucide-react";
import type { Json } from '@/integrations/supabase/types';

interface CreateAccountPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onboardingProfileData?: any;
  onboardingConversationData?: any;
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
  const [fullName, setFullName] = useState(userName || "");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    try {
      console.log("Signing up with:", {
        email,
        password: "***",
        full_name: fullName || userName || onboardingProfileData?.name || ''
      });

      // Sign up with only essential data to avoid trigger issues
      const signupData: any = { email, password };
      
      // Only add full_name if we have a valid non-empty value
      const nameToUse = fullName || userName || onboardingProfileData?.name;
      if (nameToUse && nameToUse.trim() !== '') {
        signupData.options = {
          data: {
            full_name: nameToUse.trim()
          }
        };
      }

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
        // Save onboarding data to user_data table if we have it
        if (onboardingProfileData) {
          try {
            const { error: userDataError } = await supabase
              .from('user_data')
              .insert({
                user_id: data.user.id,
                profile_data: onboardingProfileData as unknown as Json,
                conversation_data: (onboardingConversationData || {}) as unknown as Json,
                prompt_mode: 'structured'
              });

            if (userDataError) {
              console.error("Error saving user data:", userDataError);
              // Don't block the signup process for this error
            }
          } catch (dataError) {
            console.error("Error saving onboarding data:", dataError);
            // Don't block the signup process
          }
        }

        toast({
          title: "Account created successfully!",
          description: "Welcome to Twyne! You can now access all features.",
        });

        // Auto sign in the user
        await signIn(email, password);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Your Account
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
