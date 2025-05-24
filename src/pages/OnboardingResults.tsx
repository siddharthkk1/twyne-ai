
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import { useOnboardingChat } from "@/hooks/useOnboardingChat";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";

const OnboardingResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { userProfile, userName } = useOnboardingChat();
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);

  const handleCreateAccount = () => {
    setShowCreateAccountPrompt(true);
  };

  const handleContinueWithoutAccount = () => {
    navigate("/");
  };

  const handleGoToMirror = () => {
    navigate("/mirror");
  };

  // Get the user's first name from the collected data
  const getUserFirstName = () => {
    if (userName) {
      return userName.split(' ')[0];
    }
    if (userProfile?.name) {
      return userProfile.name.split(' ')[0];
    }
    return "User";
  };

  console.log("OnboardingResults - userName:", userName, "userProfile.name:", userProfile?.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex flex-col">
      <div className="flex-1 container px-4 py-8 mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {getUserFirstName()}'s Mirror
          </h1>
          <p className="text-muted-foreground text-lg">
            Here's what we learned about you through our conversation
          </p>
        </div>

        {/* Dashboard - Pass userName explicitly */}
        <ProfileCompletionDashboard 
          userProfile={userProfile} 
          userName={userName || userProfile?.name} 
        />

        {/* Action buttons */}
        {!user && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <UserPlus className="h-12 w-12 text-primary mx-auto" />
                <h3 className="text-xl font-semibold">Save Your Profile</h3>
                <p className="text-muted-foreground">
                  Create an account to save your insights and start using all of Twyne's features.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleCreateAccount}
                    className="bg-gradient-to-r from-primary to-accent text-white"
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

      {/* Create Account Prompt */}
      <CreateAccountPrompt 
        open={showCreateAccountPrompt}
        onOpenChange={setShowCreateAccountPrompt}
        onboardingProfileData={userProfile}
        onboardingConversationData={null}
        userName={userName || userProfile?.name}
      />
    </div>
  );
};

export default OnboardingResults;
