
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import type { Json } from "@/integrations/supabase/types";

const OnboardingResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile } = useOnboardingChat();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    
    // Store onboarding data in localStorage temporarily
    try {
      localStorage.setItem('onboarding_profile_data', JSON.stringify(userProfile));
      navigate("/auth");
    } catch (error) {
      console.error("Error storing onboarding data:", error);
      navigate("/auth");
    }
  };

  const handleContinueWithoutAccount = () => {
    navigate("/");
  };

  const handleGoToMirror = async () => {
    if (user) {
      // Save to user_data table if user is authenticated
      try {
        const { error } = await supabase
          .from('user_data')
          .insert({
            user_id: user.id,
            profile_data: userProfile as unknown as Json,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error("Error saving user data:", error);
          toast({
            title: "Error",
            description: "Failed to save your profile data. Please try again.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Profile Saved",
          description: "Your profile has been saved successfully!",
        });
      } catch (error) {
        console.error("Error saving user data:", error);
        toast({
          title: "Error",
          description: "Failed to save your profile data. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    navigate("/mirror");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Your Personal Insights Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what we learned about you through our conversation
          </p>
        </div>

        {/* Dashboard */}
        <ProfileCompletionDashboard userProfile={userProfile} />

        {/* Action buttons */}
        {!user && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <UserPlus className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Save Your Profile</h3>
                <p className="text-muted-foreground">
                  Create an account to save your insights and start meeting people who match your vibe.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleCreateAccount}
                    className="bg-gradient-to-r from-primary to-accent text-white"
                    disabled={isCreatingAccount}
                  >
                    Create Account to Save Data
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleContinueWithoutAccount}
                  >
                    Continue Without Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {user && (
          <div className="text-center mt-8">
            <Button 
              onClick={handleGoToMirror}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              Go to Your Mirror
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingResults;
