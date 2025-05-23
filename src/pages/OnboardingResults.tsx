
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfile, Conversation } from "@/types/chat";
import { PromptModeType } from "@/hooks/usePromptMode";
import { ProfileCompletionDashboard } from "@/components/onboarding/ProfileCompletionDashboard";
import { CreateAccountPrompt } from "@/components/auth/CreateAccountPrompt";
import { toast } from "@/components/ui/use-toast";
import { useSupabaseSync } from "@/hooks/useSupabaseSync";

interface LocationState {
  profile?: UserProfile;
  conversation?: Conversation;
  promptMode?: PromptModeType;
}

const OnboardingResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, clearNewUserFlag } = useAuth();
  const { saveOnboardingData } = useSupabaseSync();
  const [showCreateAccountPrompt, setShowCreateAccountPrompt] = useState(false);
  
  // Use state from location or default values
  const state = location.state as LocationState;
  const profile = state?.profile || {
    name: "",
    personalityTraits: {
      extroversion: 50,
      openness: 50,
      empathy: 50,
      structure: 50
    }
  };
  const conversation = state?.conversation;
  const promptMode = state?.promptMode || "playful";
  
  // Store profile data in localStorage for OAuth flow
  useEffect(() => {
    if (profile) {
      localStorage.setItem('onboarding_profile_data', JSON.stringify(profile));
    }
  }, [profile]);
  
  // If we have both user and profile data but no state, we were likely redirected
  // after signing up with OAuth. Redirect to mirror.
  useEffect(() => {
    if (user && !state?.profile && localStorage.getItem('onboarding_profile_data')) {
      navigate("/mirror");
    }
  }, [user, state]);

  const handleCreateAccount = () => {
    setShowCreateAccountPrompt(true);
  };

  const handleContinueWithoutAccount = async () => {
    try {
      // Save data as anonymous user
      const saveResult = await saveOnboardingData(
        profile, 
        conversation || { messages: [], userAnswers: [] }, 
        promptMode,
        null,
        clearNewUserFlag
      );
      
      if (saveResult) {
        toast({
          title: "Profile saved",
          description: "Your profile has been saved anonymously. Create an account anytime to access it.",
        });
        navigate("/mirror");
      }
    } catch (error) {
      console.error("Error saving anonymous data:", error);
      toast({
        title: "Error",
        description: "There was an error saving your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <div className="container mx-auto p-4 pb-20">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold">Your Mirror is Ready</h1>
          <p className="text-muted-foreground mt-2">
            Based on our conversation, here's what we've learned about you
          </p>
        </div>

        {/* Profile Dashboard */}
        <ProfileCompletionDashboard userProfile={profile} />

        {/* Action Buttons */}
        <div className="flex flex-col items-center max-w-md mx-auto mt-8 space-y-4">
          <Button 
            onClick={handleCreateAccount} 
            className="w-full"
          >
            Create an account to save your mirror
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleContinueWithoutAccount}
            className="w-full"
          >
            Continue without an account
          </Button>
        </div>
      </div>

      {/* Create Account Modal */}
      <CreateAccountPrompt 
        open={showCreateAccountPrompt} 
        onOpenChange={setShowCreateAccountPrompt}
        onboardingProfileData={profile}
      />
    </div>
  );
};

export default OnboardingResults;
